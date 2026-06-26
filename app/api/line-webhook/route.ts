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

export const runtime = "nodejs";
export const maxDuration = 25;

const ROUTER_MODEL = "claude-haiku-4-5-20251001";
const ANSWER_MODEL = "claude-sonnet-4-5";

const SYSTEM_PROMPT = `あなたは「クリチちゃん」、クリームチーズバーガーブランド「#クリチ」公式のお問い合わせコンシェルジュAIです。

# キャラクター設定
- 親しみやすく、明るく、フレンドリーな口調
- 絵文字を1〜2個まで使ってOK（🍔🧀✨等）
- 一人称は「クリチちゃん」
- 失礼な敬語は使わず、カジュアル目に
- ただし業務的な質問（卸し・取材等）には丁寧に対応

# 回答ルール
- 必ず以下の【ナレッジ】に基づいて答える
- ナレッジにない情報は勝手に作らない
- 「分かりません」「不明です」と言う代わりに、
  「最新情報は公式LINE/SNSをチェックしてね」「担当者から個別連絡します」など前向きに誘導
- 1回の回答は2〜5行で簡潔に
- 重要な案件（卸し・取材・コラボ・大量注文）はVsw株式会社の担当者へエスカレを促す

# 出典タグ（必ず最後に1行）
回答の根拠を以下のフォーマットで：
- [CITE: ブランド概要 第◯章]
- [CITE: 店舗・営業情報 第◯章]
- [CITE: メニュー・価格 第◯章]
- [CITE: 卸・取引相談 第◯章]
- [CITE: 取材・コラボ・メディア 第◯章]
- [CITE: イベント・移動販売 第◯章]
- [CITE: SNS・公式情報 第◯章]
- [CITE: FAQ Q◯]
- 該当なし：[CITE: ナレッジに該当なし]`;

const GREETING = `友だち追加ありがとう🍔

クリチちゃんだよ！
NY発・大阪生まれのクリームチーズバーガー「#クリチ」の公式AIアシスタント🧀

こんなこと聞いてね：
🍔 店舗・営業時間は？
🧀 メニュー・価格は？
🚚 出店スケジュールは？
💼 卸し・取引したい
📺 取材したい
✨ コラボ提案したい

なんでも気軽にどうぞ！`;

// 営業エスカレが必要なキーワード
const ESCALATE_KEYWORDS = [
  "卸", "おろし", "取引", "仕入れ",
  "取材", "メディア", "TV", "雑誌",
  "コラボ", "コラボレーション", "提案",
  "出店依頼", "イベント主催", "キッチンカー出店",
  "法人", "大量", "ギフト",
];

function shouldEscalate(text: string): boolean {
  return ESCALATE_KEYWORDS.some((kw) => text.includes(kw));
}

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
  question: string
): Promise<{ answer: string; citation: string | null }> {
  const knowledge = await loadKnowledge();
  const { context } = await selectRelevantContext(client, knowledge, question);

  const res = await client.messages.create({
    model: ANSWER_MODEL,
    max_tokens: 600,
    system: [
      { type: "text", text: SYSTEM_PROMPT },
      { type: "text", text: `# ナレッジ\n${context}` },
    ] as any,
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
  answer: string
) {
  const url = process.env.LEAD_SLACK_WEBHOOK;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🚨 クリチBot: 重要案件の問い合わせ`,
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "🚨 重要案件の問い合わせ" },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*LINE userId*\n\`${userId}\`` },
            ],
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: `*質問*\n${question}` },
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: `*クリチちゃんの回答*\n${answer}` },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "→ Vsw担当より2営業日以内に個別フォローアップ推奨",
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
          try {
            const { answer, citation } = await askClaude(client, userText);

            // 重要案件は本文末尾にエスカレ案内を追加
            let finalAnswer = answer;
            const escalate = shouldEscalate(userText);
            if (escalate) {
              finalAnswer +=
                "\n\n💼 重要なご相談として、Vsw担当者にもお伝えしておくね。" +
                "個別連絡まで少しお待ちいただけると嬉しいです🍔";
            }

            await lineReply(ev.replyToken, finalAnswer);

            if (escalate) {
              void notifyEscalateSlack(userId, userText, answer);
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
