/**
 * LINE Messaging API Webhook
 *
 * 「株式会社ラビーチェ」公式アカウント @923fsjxp 用。
 * バイト・社員が LINE で質問 → RAG で関連章抽出 → Claude が回答 → LINE で返信。
 *
 * - 署名検証（HMAC-SHA256 + timingSafeEqual）
 * - 既存 RAG ロジック（selectRelevantContext 相当）を流用
 * - レート制限（LINE userId 単位）
 * - 不適切コンテンツフィルタ
 * - チャットログ記録（Supabase）
 *
 * 注意：
 * - reply（無料・無制限）のみ使用、push は使わない
 * - replyToken は約1分で失効するので、重い処理を含む場合は別途検討
 * - 当面ホワイトリストなし（誰でも質問可）。Phase 2 でホワイトリスト追加予定
 */
import crypto from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { loadKnowledge } from "../../../lib/loadKnowledge";
import { splitIntoChunks, buildTOC, pickChunks } from "../../../lib/regChunks";
import { checkRateLimit } from "../../../lib/rateLimit";
import { checkContentFilter, FILTER_REPLY } from "../../../lib/contentFilter";
import { logChat } from "../../../lib/chatLog";
import { matchFaq } from "../../../lib/faq";
import {
  isVerified,
  verifyUser,
  createPendingUser,
  touch,
  checkPassword,
  updateDisplayName,
} from "../../../lib/lineWhitelist";
import { fetchLineProfile } from "../../../lib/lineProfile";

export const runtime = "nodejs";
export const maxDuration = 25; // Vercel 関数タイムアウト

const ROUTER_MODEL = "claude-haiku-4-5-20251001";
const ANSWER_MODEL = "claude-sonnet-4-5";

const SYSTEM_PROMPT = `あなたはラ・ヴィーチェ（株式会社ラ・ヴィーチェ／AMZ GROUP）の先輩スタッフ「ヴィーチェさん」です。LINEでバイト・社員から質問を受けます。

# 役割
- 高校生〜大学生のアルバイト・パートスタッフ、および正社員からの質問に答える
- 敬語ベースだが堅すぎない、親しみのある先輩口調で
- 質問者がバイト・パートと思われる場合は、まず「パート・アルバイト就業規則」を優先

# 回答ルール
- 必ず以下の【規程書コンテキスト】に基づいて答えてください
- 規程にない内容は推測せず「ごめん、規程にはっきり書いてないから店長に確認してみてね」と返す
- 専門用語は噛み砕いて説明
- 1回の回答は3〜5行以内で簡潔に（LINE向け）
- 数字（金額・日数・時間）は規程通り正確に
- 絵文字は1〜2個まで（多用しない）
- 規程本文の長文コピペは避け、要点を伝える
- 複雑な事案や個別判断が必要なものは「店長または本部に確認してね」と促す
- 詳細を読みたい場合は「リッチメニューの『規程ビューア』から確認できるよ」と案内してOK

# 出典タグ（必ず最後に1行）
以下のフォーマットで（URLは含めない）：
- [CITE: パート・アルバイト就業規則 第◯章]
- [CITE: 就業規則 第◯章]
- [CITE: 給与規程 第◯章]
- [CITE: 育児介護休業規程 第◯章]
- [CITE: 慶弔見舞金規程 第◯条]
- [CITE: 総務マニュアル 第◯章]
- [CITE: エニタイム業務FAQ 第◯章]
- [CITE: SOELU店舗運用FAQ 第◯章]
- 該当なし：[CITE: 規程に該当なし]`;

const GREETING = `友だち追加ありがとう🌿

ラ・ヴィーチェの先輩AI「ヴィーチェさん」です。
社内規程・FAQに基づいて質問に答えるよ。

⚠️ ご利用には認証が必要です
店長または本部から教えてもらった
【合言葉】をこのトークに送ってね。

合言葉がわからない場合は
店長または本部担当者まで🙏`;

const AUTH_PROMPT = `先に【合言葉】を送ってもらえる？🌿

店長または本部から教えてもらった
合言葉を入力してね。

わからない場合は店長に確認してね🙏`;

const AUTH_OK = `認証ありがとう🌿
これから何でも気軽に聞いてね。

例えばこんなこと：
・給料日いつ？
・タトゥーOK？
・有給はどう取る？
・レジ開局を間違えたら？
・育休取れる？

質問どうぞ。`;

const AUTH_NG = `ごめん、その合言葉は違うみたい🙏
もう一度確認してから送ってね。

合言葉がわからない場合は
店長または本部担当者まで。`;

const BLOCKED = `このアカウントはご利用いただけません。
店長または本部担当者にお問い合わせください。`;

// ─────────────────────────────────────
// RAG: 質問に関連する章だけ抽出
// ─────────────────────────────────────
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
): Promise<{ context: string; routedIds: string[] }> {
  const chunks = splitIntoChunks(knowledge);
  if (chunks.length === 0) {
    return { context: knowledge, routedIds: [] };
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
        "IDのみを出力し、説明文は不要です。\n\n" +
        "# 目次\n" +
        toc,
      messages: [{ role: "user", content: question }],
    });
    const text =
      res.content[0] && res.content[0].type === "text"
        ? res.content[0].text
        : "";
    const ids = (text.match(/\d{3}-\d+/g) || []).slice(0, 4);
    if (ids.length === 0) return { context: fb, routedIds: [] };
    const context = pickChunks(chunks, ids);
    if (!context.trim()) return { context: fb, routedIds: ids };
    return { context, routedIds: ids };
  } catch (e: any) {
    console.warn("[line-webhook router] failed, fallback:", e?.message ?? e);
    return { context: fb, routedIds: [] };
  }
}

// ─────────────────────────────────────
// Claude に質問 → 出典タグつき本文を返す
// ─────────────────────────────────────
async function askClaude(
  client: Anthropic,
  question: string
): Promise<{ answer: string; citation: string | null; usage: any }> {
  const knowledge = await loadKnowledge();
  const { context } = await selectRelevantContext(client, knowledge, question);

  const res = await client.messages.create({
    model: ANSWER_MODEL,
    max_tokens: 600,
    system: [
      { type: "text", text: SYSTEM_PROMPT },
      {
        type: "text",
        text: `# 規程書コンテキスト（質問に関連する章のみ抜粋）\n${context}`,
      },
    ] as any,
    messages: [{ role: "user", content: question }],
  });

  const rawText =
    res.content[0] && res.content[0].type === "text"
      ? res.content[0].text
      : "";

  // [CITE: ...] を抽出 → 本文と分離
  const citeMatch = rawText.match(/\[CITE:\s*([^\]]+)\]/);
  const citation = citeMatch ? citeMatch[1].trim() : null;
  const body = rawText.replace(/\[CITE:\s*[^\]]+\]/g, "").trim();

  // LINE向け：本文 + 改行 + 📎出典
  let answer = body;
  if (citation && !/該当なし|該当しない/.test(citation)) {
    answer += `\n\n📎 出典：${citation}`;
  }

  return {
    answer,
    citation,
    usage: {
      input_tokens: res.usage.input_tokens || 0,
      output_tokens: res.usage.output_tokens || 0,
      cache_creation_tokens:
        (res.usage as any).cache_creation_input_tokens || 0,
      cache_read_tokens: (res.usage as any).cache_read_input_tokens || 0,
    },
  };
}

// ─────────────────────────────────────
// LINE Reply API（無料・無制限）
// ─────────────────────────────────────
async function lineReply(replyToken: string, text: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.error("[line-webhook] LINE_CHANNEL_ACCESS_TOKEN not set");
    return;
  }
  try {
    const r = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: "text", text: text.slice(0, 4900) }],
      }),
    });
    if (!r.ok) {
      console.error(
        "[line-webhook] reply failed:",
        r.status,
        await r.text().catch(() => "")
      );
    }
  } catch (e: any) {
    console.error("[line-webhook] reply error:", e?.message ?? e);
  }
}

// ─────────────────────────────────────
// メインハンドラ
// ─────────────────────────────────────
export async function POST(req: Request) {
  // Messaging API用のチャネルシークレット（Web LINE LoginのLINE_CHANNEL_SECRETとは別）
  const secret = process.env.LINE_MESSAGING_CHANNEL_SECRET;
  if (!secret) {
    console.error("[line-webhook] LINE_MESSAGING_CHANNEL_SECRET not set");
    return new Response(JSON.stringify({ error: "not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 生のbodyを取得（署名検証のため）
  const raw = Buffer.from(await req.arrayBuffer());

  // (1) 署名検証（HMAC-SHA256 + timingSafeEqual）
  const sig = req.headers.get("x-line-signature") || "";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(raw)
    .digest("base64");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.warn("[line-webhook] invalid signature");
    return new Response(JSON.stringify({ error: "invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // body parse
  let body: any;
  try {
    body = JSON.parse(raw.toString("utf-8"));
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const events = Array.isArray(body.events) ? body.events : [];

  // 各 event を並列処理（reply は ev ごとに完結）
  await Promise.all(
    events.map(async (ev: any) => {
      try {
        // 友だち追加 → あいさつ + pending登録 + LINE Profile取得
        if (ev.type === "follow" && ev.replyToken) {
          const userId = ev.source?.userId;
          if (userId) {
            // Profile 取得（並列・失敗OK）→ display_name保存
            void (async () => {
              const profile = await fetchLineProfile(userId);
              await createPendingUser({
                lineUserId: userId,
                displayName: profile?.displayName,
              });
            })();
          }
          await lineReply(ev.replyToken, GREETING);
          return;
        }

        // テキストメッセージ → 認証チェック → AI応答
        if (
          ev.type === "message" &&
          ev.message?.type === "text" &&
          ev.replyToken
        ) {
          const userText = String(ev.message.text || "")
            .trim()
            .slice(0, 1500);
          const userId = ev.source?.userId || "anonymous";

          if (!userText) return;

          // ─────────────────────────────
          // 認証フロー（最優先）
          // ─────────────────────────────
          const verified = await isVerified(userId);

          if (!verified) {
            // 合言葉チェック
            const pwCheck = checkPassword(userText);
            if (pwCheck.ok) {
              // 認証成功 → Profile取得 → DB登録（並列で実行）
              const profile = await fetchLineProfile(userId).catch(() => null);
              const saved = await verifyUser({
                lineUserId: userId,
                shopCode: pwCheck.matched || "",
                displayName: profile?.displayName,
              });
              if (saved) {
                await lineReply(ev.replyToken, AUTH_OK);
                void logChat({
                  user_id: userId,
                  user_source: "line/auth",
                  question: "[認証成功]",
                  answer_preview: "AUTH_OK",
                  citation: "認証",
                });
              } else {
                // Supabase疎通失敗時：ユーザー側に分かりにくいエラーを出さず、
                // 合言葉再入力を促す（永続化できないなら認証もできない＝安全側）
                await lineReply(
                  ev.replyToken,
                  "ごめん、いま認証システムが応答できないみたい。少し待って試してね🙏"
                );
                console.error("[line-webhook] verify save failed for", userId);
              }
              return;
            }

            // 合言葉でない通常メッセージ → 認証要求
            await lineReply(ev.replyToken, AUTH_PROMPT);
            void logChat({
              user_id: userId,
              user_source: "line/unauth",
              question: userText.substring(0, 200),
              answer_preview: "AUTH_PROMPT",
              citation: "未認証ユーザーをブロック",
            });
            return;
          }

          // ─────────────────────────────
          // ここから認証済みユーザーのみ
          // ─────────────────────────────

          // 最終アクセス時刻を更新（fire-and-forget）
          void touch(userId);

          // レート制限（既存ロジック流用）
          const rl = await checkRateLimit(userId);
          if (!rl.ok) {
            const msg =
              rl.reason === "per_minute"
                ? `たくさんの質問ありがとう!ちょっと一呼吸(${rl.retryAfterSec}秒後にまた聞いてね)🌿`
                : `今日の質問上限に達したよ。明日また聞いてね🌿`;
            await lineReply(ev.replyToken, msg);
            void logChat({
              user_id: userId,
              user_source: "line",
              question: userText,
              rate_limited: true,
              answer_preview: msg.substring(0, 200),
            });
            return;
          }

          // コンテンツフィルタ
          const filter = checkContentFilter(userText);
          if (!filter.ok) {
            await lineReply(ev.replyToken, FILTER_REPLY);
            void logChat({
              user_id: userId,
              user_source: "line",
              question: userText,
              filtered: true,
              filter_label: filter.label,
              answer_preview: FILTER_REPLY.substring(0, 200),
              citation: "応答ポリシーにより回答制限",
            });
            return;
          }

          // FAQ 即答（コスト¥0）
          const faq = matchFaq(userText);
          if (faq) {
            const text = `${faq.answer}\n\n📎 出典：${faq.citation}`;
            await lineReply(ev.replyToken, text);
            void logChat({
              user_id: userId,
              user_source: "line/faq",
              question: userText,
              answer_preview: faq.answer.substring(0, 300),
              citation: faq.citation,
              input_tokens: 0,
              output_tokens: 0,
              cache_creation_tokens: 0,
              cache_read_tokens: 0,
              duration_ms: 0,
            });
            return;
          }

          // Claude API 呼び出し
          const apiKey = process.env.ANTHROPIC_API_KEY;
          if (!apiKey) {
            await lineReply(
              ev.replyToken,
              "ごめん、設定が不完全だから管理者に連絡してね🙏"
            );
            return;
          }

          const startedAt = Date.now();
          const client = new Anthropic({ apiKey });

          try {
            const { answer, citation, usage } = await askClaude(
              client,
              userText
            );
            // ★ replyToken は約1分で失効するので先に reply を送る
            await lineReply(ev.replyToken, answer);

            void logChat({
              user_id: userId,
              user_source: "line",
              question: userText,
              answer_preview: answer.substring(0, 300),
              citation,
              duration_ms: Date.now() - startedAt,
              input_tokens: usage.input_tokens,
              output_tokens: usage.output_tokens,
              cache_creation_tokens: usage.cache_creation_tokens,
              cache_read_tokens: usage.cache_read_tokens,
            });
          } catch (e: any) {
            console.error("[line-webhook] claude error:", e?.message ?? e);
            await lineReply(
              ev.replyToken,
              "ごめん、いまちょっと混み合ってます。30秒〜1分くらい待って、もう一度聞いてみてね🌿"
            );
          }
          return;
        }

        // unfollow / その他のイベントは無視
      } catch (e: any) {
        console.error("[line-webhook] event error:", e?.message ?? e);
        if (ev.replyToken) {
          await lineReply(
            ev.replyToken,
            "ごめん、エラーが起きました。少し待ってから試してね🙏"
          ).catch(() => {});
        }
      }
    })
  );

  // LINE には常に 200 を返す（リトライさせない）
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// GET（疎通確認用）
export async function GET() {
  return new Response(
    JSON.stringify({
      service: "laviche-line-webhook",
      ok: true,
      message: "POST only (with X-Line-Signature)",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
