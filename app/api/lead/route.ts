/**
 * リード受け取りエンドポイント。
 * /lp の問い合わせフォームから POST される。
 *
 * - 通知：メール（Resend経由・lib/notifyMail.ts）
 * - 保存：Supabase leads テーブル（未作成なら skip）
 */
import { sendNotifyMail, buildLeadMail } from "../../../lib/notifyMail";

export const runtime = "nodejs";

type LeadInput = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
  type?: string;
};

function isEmail(s: string): boolean {
  return /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(s);
}

async function notifyMail(payload: Required<LeadInput>) {
  const mail = buildLeadMail(payload);
  await sendNotifyMail({
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    replyTo: payload.email,
  });
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

  // 通知（メール）＋保存（Supabase）を並列実行・失敗ログのため await
  await Promise.allSettled([notifyMail(payload), saveSupabase(payload)]);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
