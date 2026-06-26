import Anthropic from "@anthropic-ai/sdk";
import { loadKnowledge } from "../../../lib/loadKnowledge";
import { decodeSession, USER_COOKIE } from "../../../lib/session";
import { checkRateLimit } from "../../../lib/rateLimit";
import { checkContentFilter, FILTER_REPLY } from "../../../lib/contentFilter";
import { logChat } from "../../../lib/chatLog";
import { splitIntoChunks, buildTOC, pickChunks } from "../../../lib/regChunks";
import { matchFaq } from "../../../lib/faq";

export const runtime = "nodejs";

const ROUTER_MODEL = "claude-haiku-4-5-20251001"; // 軽量・安価なルーティング用
const ANSWER_MODEL = "claude-sonnet-4-5";

/**
 * 質問に関連する規程チャンクの本文を返す（RAG）。
 * Haiku で「どの章を見るべきか」を判定 → 関連章だけ抽出。
 * 失敗時は全文を返す（安全フォールバック）。
 */
/**
 * ルーティング失敗時のフォールバック。
 * 全文ではなく「バイト向け主要章（PA就業規則優先）」のみ。
 * → ルーターをわざとエラーさせて全文を抜く攻撃を防ぐ。
 */
function fallbackContext(chunks: ReturnType<typeof splitIntoChunks>): string {
  if (chunks.length === 0) return "";
  const pa = chunks.filter((c) => c.id.startsWith("003")).slice(0, 5);
  const picked = pa.length > 0 ? pa : chunks.slice(0, 5);
  return picked.map((c) => c.body).join("\n\n---\n\n");
}

async function selectRelevantContext(
  client: Anthropic,
  knowledge: string,
  question: string
): Promise<{ context: string; routedIds: string[]; fullFallback: boolean }> {
  const chunks = splitIntoChunks(knowledge);
  // チャンク分割そのものが失敗した時だけ全文（最終手段）
  if (chunks.length === 0) {
    return { context: knowledge, routedIds: [], fullFallback: true };
  }
  const fb = fallbackContext(chunks);
  const toc = buildTOC(chunks);

  try {
    const res = await client.messages.create({
      model: ROUTER_MODEL,
      max_tokens: 120,
      system:
        "あなたは社内規程の検索アシスタントです。" +
        "ユーザーの質問に答えるために参照すべき章を、以下の目次から選んでください。" +
        "関連度の高い章IDを最大4つ、カンマ区切りで出力してください（例：003-4,002-1）。" +
        "IDのみを出力し、説明文は不要です。該当が思い当たらない場合は最も近いものを2つ選んでください。\n\n" +
        "# 目次\n" +
        toc,
      messages: [{ role: "user", content: question }],
    });

    const text =
      res.content[0] && res.content[0].type === "text"
        ? res.content[0].text
        : "";
    const ids = (text.match(/\d{3}-\d+/g) || []).slice(0, 4);

    if (ids.length === 0) {
      // 全文ではなく主要章のみ
      return { context: fb, routedIds: [], fullFallback: false };
    }
    const context = pickChunks(chunks, ids);
    if (!context.trim()) {
      return { context: fb, routedIds: ids, fullFallback: false };
    }
    return { context, routedIds: ids, fullFallback: false };
  } catch (e: any) {
    console.warn("[router] failed, fallback to PA chapters:", e?.message ?? e);
    return { context: fb, routedIds: [], fullFallback: false };
  }
}

const SYSTEM_BASE = `あなたはラ・ヴィーチェ（株式会社ラ・ヴィーチェ／AMZ GROUP）の先輩スタッフ「ヴィーチェさん」です。

# 役割
- 高校生〜大学生のアルバイト・パートスタッフ、および正社員からの質問に答える
- 敬語ベースだが堅すぎない、親しみのある先輩口調で
- 質問者がバイト・パートと思われる場合は、まず「パート・アルバイト就業規則」を優先的に参照する

# 回答ルール
- 必ず以下の【規程書コンテキスト】（5つの規程集）に基づいて答えてください
- 規程に該当する内容がない場合、推測せず「ごめん、規程にはっきり書いてないから店長に確認してみてね」と返す
- 専門用語は噛み砕いて説明（例：「労務に従事しない期間」→「お仕事をお休みする期間」）
- 1回の回答は3〜5行以内で簡潔に
- 数字（金額・日数・時間）は規程に書かれた通り正確に引用

# 出典タグ（必ず最後に1行加える）
以下のフォーマットを使い分けてください：
- [CITE: パート・アルバイト就業規則 第◯章 ◯◯（章タイトル）]
- [CITE: 就業規則 第◯章 ◯◯]
- [CITE: 給与規程 第◯章 ◯◯]
- [CITE: 育児介護休業規程 第◯章 ◯◯]
- [CITE: 慶弔見舞金規程 第◯条]
- 該当なしの場合：[CITE: 規程に該当なし]`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not set in .env.local" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { question } = (await req.json()) as { question: string };
  if (!question?.trim()) {
    return new Response(JSON.stringify({ error: "question required" }), {
      status: 400,
    });
  }

  // セッション取得 + 署名検証（middleware に加えて API でも厳格化）
  const cookieHeader = req.headers.get("cookie") || "";
  const userauthMatch = cookieHeader.match(/userauth=([^;]+)/);
  const session = decodeSession(userauthMatch?.[1]);
  // 未認証は拒否（anonymous フォールバックを廃止）
  if (!session) {
    return new Response(
      JSON.stringify({ type: "text", text: "ログインが必要です。ログイン画面からやり直してね🌿" }) + "\n",
      {
        status: 401,
        headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
      }
    );
  }
  const userId = session.id;

  // レート制限チェック
  const rl = await checkRateLimit(userId);
  if (!rl.ok) {
    const msg =
      rl.reason === "per_minute"
        ? `たくさんの質問ありがとう!ちょっと一呼吸(${rl.retryAfterSec}秒後にまた聞いてね)🌿`
        : `今日の質問上限に達しました。明日また聞いてくださいね🌿`;
    // ログ記録（fire-and-forget）
    void logChat({
      user_id: userId,
      user_name: session?.name,
      user_source: session?.source,
      question,
      rate_limited: true,
      answer_preview: msg.substring(0, 200),
    });
    return new Response(
      JSON.stringify({ type: "text", text: msg }) + "\n",
      {
        status: 429,
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Retry-After": String(rl.retryAfterSec),
        },
      }
    );
  }

  // 不適切質問フィルタ
  const filter = checkContentFilter(question);
  if (!filter.ok) {
    console.log(
      `[contentFilter] blocked user=${userId} label=${filter.label} matched="${filter.matched}"`
    );
    // ログ記録（fire-and-forget）
    void logChat({
      user_id: userId,
      user_name: session?.name,
      user_source: session?.source,
      question,
      filtered: true,
      filter_label: filter.label,
      answer_preview: FILTER_REPLY.substring(0, 200),
      citation: "応答ポリシーにより回答制限",
    });
    // フィルタ検知 → Claude に投げず固定応答（ストリーミング形式で返す）
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: "text", text: FILTER_REPLY }) + "\n"
          )
        );
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: "citation", citation: "応答ポリシーにより回答制限" }) +
              "\n"
          )
        );
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
    });
  }

  // FAQ 即答（定番質問は AI を呼ばず固定回答・コスト¥0）
  const faq = matchFaq(question);
  if (faq) {
    void logChat({
      user_id: userId,
      user_name: session?.name,
      user_source: session?.source ? `${session.source}/faq` : "faq",
      question,
      answer_preview: faq.answer.substring(0, 300),
      citation: faq.citation,
      input_tokens: 0,
      output_tokens: 0,
      cache_creation_tokens: 0,
      cache_read_tokens: 0,
      duration_ms: 0,
    });
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "text", text: faq.answer }) + "\n")
        );
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: "citation", citation: faq.citation }) + "\n"
          )
        );
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
    });
  }

  const knowledge = await loadKnowledge();
  const startedAt = Date.now();

  const client = new Anthropic({ apiKey });

  // RAG：質問に関連する章だけを抽出（コストを大幅削減）
  const { context, routedIds, fullFallback } = await selectRelevantContext(
    client,
    knowledge,
    question
  );
  console.log(
    `[rag] routed=${routedIds.join(",") || "none"} fullback=${fullFallback} ctxLen=${context.length}`
  );

  // 関連章のみを Sonnet に投入（全文ではないのでトークン激減）
  const stream = client.messages.stream({
    model: ANSWER_MODEL,
    max_tokens: 700,
    system: [
      { type: "text", text: SYSTEM_BASE },
      {
        type: "text",
        text: `# 規程書コンテキスト（質問に関連する章のみ抜粋）\n${context}`,
      },
    ] as any,
    messages: [{ role: "user", content: question }],
  });

  const encoder = new TextEncoder();
  // ログ用：応答全体・出典タグ・トークン使用量を蓄積
  let fullAnswer = "";
  let capturedCitation: string | null = null;
  let usage = {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_tokens: 0,
    cache_read_tokens: 0,
  };

  const readable = new ReadableStream({
    async start(controller) {
      let buffer = "";
      let citationSent = false;

      function flushVisible() {
        const m = buffer.match(/\[CITE:\s*([^\]]+)\]/);
        if (m) {
          const before = buffer.slice(0, m.index!);
          if (before) {
            fullAnswer += before;
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: "text", text: before }) + "\n")
            );
          }
          if (!citationSent) {
            capturedCitation = m[1].trim();
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ type: "citation", citation: capturedCitation }) + "\n"
              )
            );
            citationSent = true;
          }
          buffer = buffer.slice(m.index! + m[0].length);
        } else if (buffer.length > 80) {
          const safe = buffer.slice(0, buffer.length - 20);
          fullAnswer += safe;
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "text", text: safe }) + "\n")
          );
          buffer = buffer.slice(buffer.length - 20);
        }
      }

      try {
        for await (const event of stream) {
          // トークン使用量を取得（Prompt Caching の内訳含む）
          if (event.type === "message_start") {
            const u = (event as any).message?.usage;
            if (u) {
              usage.input_tokens = u.input_tokens || 0;
              usage.cache_creation_tokens = u.cache_creation_input_tokens || 0;
              usage.cache_read_tokens = u.cache_read_input_tokens || 0;
            }
          }
          if (event.type === "message_delta") {
            const u = (event as any).usage;
            if (u?.output_tokens) usage.output_tokens = u.output_tokens;
          }
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            buffer += event.delta.text;
            flushVisible();
          }
        }
        const m = buffer.match(/\[CITE:\s*([^\]]+)\]/);
        if (m) {
          const before = buffer.slice(0, m.index!);
          if (before) {
            fullAnswer += before;
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: "text", text: before }) + "\n")
            );
          }
          if (!citationSent) {
            capturedCitation = m[1].trim();
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ type: "citation", citation: capturedCitation }) + "\n"
              )
            );
          }
        } else if (buffer) {
          fullAnswer += buffer;
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "text", text: buffer }) + "\n")
          );
        }
      } catch (e: any) {
        // ユーザー向けの優しいエラーメッセージに変換（生のJSON/英文を出さない）
        const msg = String(e?.message ?? e ?? "");
        let userMsg = "\n\nごめん、通信がうまくいきませんでした。少し時間をおいて、もう一度試してみてね🌿";
        if (msg.includes("429") || msg.toLowerCase().includes("rate_limit") || msg.toLowerCase().includes("rate limit")) {
          userMsg = "\n\nごめん、いまちょっと混み合ってます。30秒〜1分くらい待って、もう一度聞いてみてね🌿";
        } else if (msg.includes("500") || msg.toLowerCase().includes("overloaded") || msg.toLowerCase().includes("server error")) {
          userMsg = "\n\nごめん、サーバーで一時的に問題が起きてます。少し待ってから、もう一度試してね。";
        }
        fullAnswer += userMsg;
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: "text", text: userMsg }) + "\n"
          )
        );
      } finally {
        controller.close();
        // ストリーミング完了後にログ記録（fire-and-forget・トークン使用量込み）
        void logChat({
          user_id: userId,
          user_name: session?.name,
          user_source: session?.source,
          question,
          answer_preview: fullAnswer.substring(0, 300),
          citation: capturedCitation,
          duration_ms: Date.now() - startedAt,
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
          cache_creation_tokens: usage.cache_creation_tokens,
          cache_read_tokens: usage.cache_read_tokens,
        });
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
