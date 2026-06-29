/**
 * クリチ公式LINE (@552gvrkj) Messaging API Webhook。
 *
 * - 認証なし（誰でも質問可・社外向け）
 * - クリチ製品・店舗・FAQ をRAGで回答
 * - 卸/取材/コラボ等の重要相談は営業エスカレ判定 → Slack/メール通知
 * - reply（無料）のみ使用、push は通知ボタンで
 */
import crypto from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { loadKnowledge } from "../../../lib/loadKnowledge";
import { splitIntoChunks, buildTOC, pickChunks } from "../../../lib/regChunks";
import { logChat } from "../../../lib/chatLog";
import {
  getMemory,
  upsertMemory,
  memoryToSystemHint,
  extractMemoryUpdate,
  type ConversationMemory,
} from "../../../lib/conversationMemory";
import {
  detectEscalation,
  buildHandoffNotification,
} from "../../../lib/escalation";

export const runtime = "nodejs";
export const maxDuration = 25;

const ROUTER_MODEL = "claude-haiku-4-5-20251001";
const ANSWER_MODEL = "claude-sonnet-4-5";

const SYSTEM_PROMPT = `あなたは「KURICHI / #クリチ」公式の問い合わせAI Botです。

# 基本人格
- 明るい・親しみやすい・少しポップ
- でも食品を扱うブランドなので、礼儀正しく丁寧
- ユーザーに寄り添う
- 困ったら必ずスタッフに繋ぐ

# 話し方の例
「ありがとうございます！」
「#クリチについてですね。」
「冷凍のままでも、少し解凍しても楽しめます。」
「正確な情報はスタッフに確認しますね。」

# 回答ルール
- 必ず以下の【ナレッジ】に基づいて答える
- ナレッジに無い情報を勝手に作らない（想像で答えない）
- 1回の回答は2〜5行で簡潔に
- 絵文字は1〜2個まで（🍔🧀✨ 等。多用しない）

# 断定してよいこと
- #クリチはクリームチーズバーガー型のスイーツである
- 英語表記は KURICHI、中国語表記は 酷莉琪
- 冷凍・半解凍・解凍で楽しめる、冷凍保存が基本
- 解凍後は早めに食べる
- イベントやポップアップで販売されることがある
- 日本発の食のIPブランドである

# 絶対に断定しないこと（必ず「スタッフ確認します」と返す）
- 現在の販売場所・在庫
- 正確な価格（過去事例は「過去のイベントでは550〜650円前後」と紹介してよい）
- 正確な賞味期限（目安は冷凍1ヶ月・解凍後2日でOK・ただし商品ラベル参照を促す）
- 原材料・アレルギーの最終判断
- 配送対応の可否
- 法人/卸価格・出店可否
- 海外店舗の現在の営業状況

# スタッフ引き継ぎ条件（以下は必ずスタッフへ案内）
- 注文希望・配送希望・大量注文
- 法人・卸・取材・コラボ・出店依頼
- クレーム
- アレルギー相談
- 価格交渉
- 海外販売の詳細
- ナレッジに情報が無い質問

# 禁止事項
- 「絶対に安全」「必ず届く」「在庫あります」「現在販売中です」など保証・断定表現
- 医療的・健康効果的な表現
- 価格・賞味期限・原材料の固定回答

# 出典タグ（必ず最後に1行）
[CITE: セクション名 / 章ID]（例：[CITE: 4. 食べ方 / 4-1]、[CITE: 16. よくある質問 / Q3]）
該当なし：[CITE: ナレッジに該当なし]`;

const GREETING = `友だち追加ありがとうございます！

こちらはKURICHI公式アカウントです🍔
#クリチの商品情報、イベント情報、食べ方、注文に関するお問い合わせにAIがお答えします。

知りたい内容をメッセージで送ってください。

例：
・#クリチって何？
・どこで買える？
・食べ方を教えて
・注文したい
・イベント出店について相談したい`;

// エスカレーション判定は lib/escalation.ts に移譲（カテゴリ・優先度・不足情報を返す）

function fallbackContext(chunks: ReturnType<typeof splitIntoChunks>): string {
  if (chunks.length === 0) return "";
  const faq = chunks.filter((c) => c.id.startsWith("008")).slice(0, 5);
  const picked = faq.length > 0 ? faq : chunks.slice(0, 5);
  return picked.map((c) => c.body).join("\n\n---\n\n");
}

async function selectRelevantContext(
  client: Anthropic,
  knowledge: string,
  question: string
): Promise<{ context: string; routedIds: string[] }> {
  const chunks = splitIntoChunks(knowledge);
  if (chunks.length === 0) return { context: knowledge, routedIds: [] };
  const fb = fallbackContext(chunks);
  const toc = buildTOC(chunks);
  try {
    const res = await client.messages.create({
      model: ROUTER_MODEL,
      max_tokens: 120,
      system:
        "あなたはクリチちゃんのナレッジ検索アシスタントです。" +
        "ユーザーの質問に答えるために参照すべき章を、以下の目次から選んでください。" +
        "関連度の高い章IDを最大4つ、カンマ区切りで出力（例：008-1,003-2）。" +
        "IDのみを出力。\n\n# 目次\n" +
        toc,
      messages: [{ role: "user", content: question }],
    });
    const text =
      res.content[0] && res.content[0].type === "text" ? res.content[0].text : "";
    const ids = (text.match(/\d{3}-\d+/g) || []).slice(0, 4);
    if (ids.length === 0) return { context: fb, routedIds: [] };
    const context = pickChunks(chunks, ids);
    if (!context.trim()) return { context: fb, routedIds: ids };
    return { context, routedIds: ids };
  } catch (e: any) {
    console.warn("[kurichi-bot router] failed:", e?.message ?? e);
    return { context: fb, routedIds: [] };
  }
}

async function askClaude(
  client: Anthropic,
  question: string,
  memory: ConversationMemory | null = null
): Promise<{ answer: string; citation: string | null }> {
  const knowledge = await loadKnowledge();
  const { context } = await selectRelevantContext(client, knowledge, question);

  const memoryHint = memoryToSystemHint(memory);

  const systemBlocks: any[] = [
    { type: "text", text: SYSTEM_PROMPT },
    { type: "text", text: `# ナレッジ\n${context}` },
  ];
  if (memoryHint) {
    systemBlocks.push({ type: "text", text: memoryHint });
  }

  const res = await client.messages.create({
    model: ANSWER_MODEL,
    max_tokens: 600,
    system: systemBlocks as any,
    messages: [{ role: "user", content: question }],
  });

  const rawText =
    res.content[0] && res.content[0].type === "text" ? res.content[0].text : "";
  const citeMatch = rawText.match(/\[CITE:\s*([^\]]+)\]/);
  const citation = citeMatch ? citeMatch[1].trim() : null;
  let body = rawText.replace(/\[CITE:\s*[^\]]+\]/g, "").trim();

  // 出典は本文末尾に簡略表示（任意）
  if (citation && !/該当なし/.test(citation)) {
    body += `\n\n📎 ${citation}`;
  }

  return { answer: body, citation };
}

async function lineReply(replyToken: string, text: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.error("[kurichi-bot] LINE_CHANNEL_ACCESS_TOKEN not set");
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
      console.error("[kurichi-bot] reply failed:", r.status, await r.text().catch(() => ""));
    }
  } catch (e: any) {
    console.error("[kurichi-bot] reply error:", e?.message ?? e);
  }
}

async function notifyEscalateSlack(
  userId: string,
  question: string,
  answer: string,
  category: string,
  priority: string,
  fullText: string
) {
  const url = process.env.LEAD_SLACK_WEBHOOK;
  if (!url) return;
  try {
    const emoji = priority === "high" ? "🚨" : priority === "medium" ? "⚠️" : "ℹ️";
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `${emoji} クリチBot: ${category}（${priority}）`,
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: `${emoji} ${category}` },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*優先度*\n${priority.toUpperCase()}` },
              { type: "mrkdwn", text: `*LINE userId*\n\`${userId}\`` },
            ],
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: `*ご相談内容*\n${question.slice(0, 500)}` },
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: `*クリチちゃんの返答*\n${answer.slice(0, 500)}` },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "```" + fullText.slice(0, 2500) + "```",
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "→ Vsw担当より対応してください",
              },
            ],
          },
        ],
      }),
    });
  } catch (e: any) {
    console.warn("[kurichi-bot] slack escalate failed:", e?.message ?? e);
  }
}

export async function POST(req: Request) {
  const secret = process.env.LINE_MESSAGING_CHANNEL_SECRET;
  if (!secret) {
    console.error("[kurichi-bot] LINE_MESSAGING_CHANNEL_SECRET not set");
    return new Response(JSON.stringify({ error: "not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const raw = Buffer.from(await req.arrayBuffer());

  // 署名検証
  const sig = req.headers.get("x-line-signature") || "";
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("base64");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return new Response(JSON.stringify({ error: "invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

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

  await Promise.all(
    events.map(async (ev: any) => {
      try {
        if (ev.type === "follow" && ev.replyToken) {
          await lineReply(ev.replyToken, GREETING);
          return;
        }

        if (
          ev.type === "message" &&
          ev.message?.type === "text" &&
          ev.replyToken
        ) {
          const userText = String(ev.message.text || "").trim().slice(0, 1500);
          const userId = ev.source?.userId || "anonymous";
          if (!userText) return;

          const apiKey = process.env.ANTHROPIC_API_KEY;
          if (!apiKey) {
            await lineReply(
              ev.replyToken,
              "ごめんね、設定が不完全みたい。Vsw担当に連絡してくれると助かるよ🍔"
            );
            return;
          }

          const client = new Anthropic({ apiKey });
          const startedAt = Date.now();
          try {
            // (1) 会話記憶を取得
            const memory = await getMemory(userId);

            // (2) 構造化エスカレーション判定（記憶も考慮）
            const escalation = detectEscalation(userText, memory);

            // (3) RAG + 会話記憶を踏まえて Claude が回答
            const { answer, citation } = await askClaude(client, userText, memory);

            // (4) 重要案件のフォローアップを本文末尾に追記
            let finalAnswer = answer;
            if (escalation.should_handoff) {
              const nq = escalation.next_question;
              if (nq && !answer.includes("担当者")) {
                finalAnswer += `\n\n${nq}`;
              }
            }

            // (5) ユーザーへ返信
            await lineReply(ev.replyToken, finalAnswer);

            // (6) チャットログ記録（生ログ・fire-and-forget）
            const logSource = escalation.should_handoff
              ? `kurichi-line/escalate/${escalation.category || "other"}`
              : "kurichi-line";
            void logChat({
              user_id: userId,
              user_source: logSource,
              question: userText,
              answer_preview: finalAnswer.substring(0, 300),
              citation,
              duration_ms: Date.now() - startedAt,
            });

            // (7) 会話記憶を更新（Claudeで要約抽出）
            void (async () => {
              const update = await extractMemoryUpdate(
                client,
                userText,
                finalAnswer,
                memory
              );
              const finalUpdate = {
                ...(update || {}),
                handoff_required: escalation.should_handoff,
                handoff_category: escalation.category,
                handoff_priority: escalation.priority,
              };
              await upsertMemory(userId, finalUpdate);
            })();

            // (8) 担当者通知（Slack）
            if (escalation.should_handoff) {
              const notif = buildHandoffNotification({
                userId,
                userText,
                botReply: finalAnswer,
                result: escalation,
                memory,
              });
              void notifyEscalateSlack(
                userId,
                userText,
                finalAnswer,
                escalation.category || "重要案件",
                escalation.priority,
                notif.text
              );
            }
          } catch (e: any) {
            console.error("[kurichi-bot] claude error:", e?.message ?? e);
            await lineReply(
              ev.replyToken,
              "ごめんね、いまちょっと混んでます🍔 少し待ってから聞いてみてね。"
            );
          }
        }
      } catch (e: any) {
        console.error("[kurichi-bot] event error:", e?.message ?? e);
        if (ev.replyToken) {
          await lineReply(
            ev.replyToken,
            "ごめんね、エラーが起きちゃった🙏 少し待って試してね。"
          ).catch(() => {});
        }
      }
    })
  );

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET() {
  return new Response(
    JSON.stringify({
      service: "kurichi-line-webhook",
      ok: true,
      message: "POST only (with X-Line-Signature)",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
