/**
 * リード受け取りエンドポイント。
 * /lp の問い合わせフォームから POST される。
 *
 * 通知先候補：
 *  - Slack Webhook (LEAD_SLACK_WEBHOOK)
 *  - Email（後日実装）
 *
 * Supabase の leads テーブルに保存（任意・テーブル無ければ skip）。
 */
export const runtime = "nodejs";

type LeadInput = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
  type?: string;
};

const TYPE_LABEL: Record<string, string> = {
  demo: "無料デモ希望",
  biz: "他社導入の相談",
  wholesale: "クリチの卸し・取引相談",
  media: "取材・メディア",
  other: "その他",
};

function isEmail(s: string): boolean {
  return /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(s);
}

async function notifySlack(payload: Required<LeadInput>) {
  const url = process.env.LEAD_SLACK_WEBHOOK;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🍔 新規リード受領（クリチ Inquiry AI）`,
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "🍔 新規リード受領" },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*種別*\n${TYPE_LABEL[payload.type] || payload.type}` },
              { type: "mrkdwn", text: `*お名前*\n${payload.name}` },
              { type: "mrkdwn", text: `*会社*\n${payload.company || "—"}` },
              { type: "mrkdwn", text: `*メール*\n${payload.email}` },
              { type: "mrkdwn", text: `*電話*\n${payload.phone || "—"}` },
            ],
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: `*お問い合わせ内容*\n${payload.message}` },
          },
        ],
      }),
    });
  } catch (e: any) {
    console.warn("[lead] slack notify failed:", e?.message ?? e);
  }
}

async function saveSupabase(payload: Required<LeadInput>) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url.replace(/\/$/, "")}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name: payload.name,
        company: payload.company,
        email: payload.email,
        phone: payload.phone,
        message: payload.message,
        type: payload.type,
        created_at: new Date().toISOString(),
      }),
    });
  } catch (e: any) {
    console.warn("[lead] supabase save failed:", e?.message ?? e);
  }
}

export async function POST(req: Request) {
  let body: LeadInput;
  try {
    body = (await req.json()) as LeadInput;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "不正なJSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();
  const company = (body.company || "").trim();
  const phone = (body.phone || "").trim();
  const type = (body.type || "other").trim();

  if (!name || !email || !message) {
    return new Response(
      JSON.stringify({ ok: false, error: "お名前・メールアドレス・お問い合わせ内容は必須です" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!isEmail(email)) {
    return new Response(
      JSON.stringify({ ok: false, error: "メールアドレスの形式が正しくありません" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (name.length > 100 || company.length > 200 || email.length > 200 || message.length > 4000) {
    return new Response(
      JSON.stringify({ ok: false, error: "入力文字数が上限を超えています" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const payload = { name, company, email, phone, message, type };

  // 通知＋保存（並列・fire-and-forget でも構わないが、失敗ログのため await）
  await Promise.allSettled([notifySlack(payload), saveSupabase(payload)]);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
