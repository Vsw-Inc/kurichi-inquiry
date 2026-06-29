/**
 * Resend 経由のメール通知。
 *
 * env：
 *  - RESEND_API_KEY ：https://resend.com で取得
 *  - NOTIFY_EMAIL_TO ：通知先（カンマ区切り複数可）
 *  - NOTIFY_EMAIL_FROM ：送信元（独自ドメイン認証推奨、未設定なら onboarding@resend.dev）
 *
 * 未設定時は黙ってスキップ（fire-and-forget 前提）。
 */

type SendInput = {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export async function sendNotifyMail(input: SendInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = (process.env.NOTIFY_EMAIL_TO || "").trim();
  const from =
    (process.env.NOTIFY_EMAIL_FROM || "").trim() ||
    "クリチBot <onboarding@resend.dev>";

  if (!key || !to) {
    console.warn(
      "[notifyMail] RESEND_API_KEY / NOTIFY_EMAIL_TO が未設定。メール送信スキップ。"
    );
    return false;
  }

  const recipients = to
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: input.subject.slice(0, 200),
        text: input.text.slice(0, 30000),
        html: input.html,
        reply_to: input.replyTo,
      }),
    });
    if (!r.ok) {
      const body = await r.text().catch(() => "");
      console.error("[notifyMail] failed:", r.status, body);
      return false;
    }
    return true;
  } catch (e: any) {
    console.error("[notifyMail] error:", e?.message ?? e);
    return false;
  }
}

/**
 * 担当者向け：エスカレ通知メールの本文を組み立てる。
 */
export function buildEscalateMail(opts: {
  userId: string;
  category: string;
  priority: string;
  userText: string;
  botReply: string;
  fullDetail: string;
}): { subject: string; text: string; html: string } {
  const { userId, category, priority, userText, botReply, fullDetail } = opts;
  const emoji = priority === "high" ? "🚨" : priority === "medium" ? "⚠️" : "ℹ️";
  const subject = `${emoji} [クリチBot] ${category}（${priority.toUpperCase()}）`;

  const text = [
    `${emoji} クリチ Inquiry AI から重要案件の通知です`,
    "",
    `カテゴリ：${category}`,
    `優先度：${priority.toUpperCase()}`,
    `LINE userId：${userId}`,
    "",
    "─────────────────────",
    "■ お客様の発言",
    "─────────────────────",
    userText,
    "",
    "─────────────────────",
    "■ クリチちゃんの返答",
    "─────────────────────",
    botReply,
    "",
    "─────────────────────",
    "■ 詳細（記憶・不足情報含む）",
    "─────────────────────",
    fullDetail,
    "",
    "─────────────────────",
    "→ Vsw 担当より対応してください",
    "",
    `※ このメールは ${new Date().toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
    })} 時点の通知です。`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:32px 16px;background:#fff8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#2a1810;line-height:1.7;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #f3d9b5;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(217,110,30,0.08);">
    <div style="padding:24px 28px;background:linear-gradient(90deg,#f5862e,#d96e1e);color:#fff;">
      <div style="font-size:11px;letter-spacing:.18em;opacity:.85;">KURICHI INQUIRY AI / NOTIFICATION</div>
      <div style="font-size:20px;font-weight:700;margin-top:6px;">${escapeHtml(emoji)} ${escapeHtml(category)}（${escapeHtml(priority.toUpperCase())}）</div>
    </div>
    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px;">
        <tr><td style="padding:6px 0;color:#7a5a3e;width:120px;">カテゴリ</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(category)}</td></tr>
        <tr><td style="padding:6px 0;color:#7a5a3e;">優先度</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(priority.toUpperCase())}</td></tr>
        <tr><td style="padding:6px 0;color:#7a5a3e;">LINE userId</td><td style="padding:6px 0;font-family:Menlo,Monaco,monospace;font-size:11px;">${escapeHtml(userId)}</td></tr>
      </table>

      <h3 style="margin:0 0 8px;font-size:13px;color:#d96e1e;letter-spacing:.05em;">■ お客様の発言</h3>
      <div style="padding:14px 16px;background:#fff8f0;border-left:3px solid #f5862e;border-radius:0 8px 8px 0;font-size:14px;margin-bottom:18px;white-space:pre-wrap;">${escapeHtml(userText)}</div>

      <h3 style="margin:0 0 8px;font-size:13px;color:#d96e1e;letter-spacing:.05em;">■ クリチちゃんの返答</h3>
      <div style="padding:14px 16px;background:#fefaf2;border:1px dashed #f3d9b5;border-radius:8px;font-size:13.5px;margin-bottom:18px;white-space:pre-wrap;">${escapeHtml(botReply)}</div>

      <h3 style="margin:0 0 8px;font-size:13px;color:#d96e1e;letter-spacing:.05em;">■ 詳細（記憶・不足情報含む）</h3>
      <pre style="padding:14px 16px;background:#f4ebd9;border-radius:8px;font-size:12px;line-height:1.6;overflow:auto;white-space:pre-wrap;">${escapeHtml(fullDetail)}</pre>

      <p style="margin:24px 0 0;padding:14px 16px;background:#fffaf2;border-radius:8px;font-size:13px;color:#5a3f2a;">
        → Vsw 担当より対応してください 🍔
      </p>
    </div>
    <div style="padding:16px 28px;background:#fff8f0;border-top:1px solid #f3d9b5;font-size:11px;color:#8a6d38;text-align:center;">
      © 2026 Vsw株式会社 / クリチ Inquiry AI
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * リードフォーム経由のお問い合わせ通知メール。
 */
export function buildLeadMail(opts: {
  name: string;
  company: string;
  email: string;
  phone: string;
  type: string;
  message: string;
}): { subject: string; text: string; html: string } {
  const { name, company, email, phone, type, message } = opts;
  const typeLabel: Record<string, string> = {
    demo: "無料デモ希望",
    biz: "他社導入の相談",
    wholesale: "クリチの卸し・取引相談",
    media: "取材・メディア",
    other: "その他",
  };
  const subject = `📨 [クリチLP] ${typeLabel[type] || type}：${name}様`;

  const text = [
    "📨 クリチ Inquiry AI のお問い合わせフォームから新規リードが届きました。",
    "",
    `種別：${typeLabel[type] || type}`,
    `お名前：${name}`,
    `会社名：${company || "—"}`,
    `メール：${email}`,
    `電話：${phone || "—"}`,
    "",
    "─────────────────────",
    "■ お問い合わせ内容",
    "─────────────────────",
    message,
    "",
    "─────────────────────",
    `→ 2営業日以内にご連絡ください。`,
    `※ ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} 受信`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:32px 16px;background:#fff8f0;font-family:-apple-system,sans-serif;color:#2a1810;line-height:1.7;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #f3d9b5;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(217,110,30,0.08);">
    <div style="padding:24px 28px;background:linear-gradient(90deg,#f5862e,#d96e1e);color:#fff;">
      <div style="font-size:11px;letter-spacing:.18em;opacity:.85;">KURICHI INQUIRY AI / LEAD</div>
      <div style="font-size:20px;font-weight:700;margin-top:6px;">📨 ${escapeHtml(typeLabel[type] || type)}</div>
    </div>
    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;font-size:13.5px;margin-bottom:18px;">
        <tr><td style="padding:8px 0;color:#7a5a3e;width:120px;">お名前</td><td style="padding:8px 0;font-weight:700;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5a3e;">会社名</td><td style="padding:8px 0;">${escapeHtml(company || "—")}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5a3e;">メール</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#d96e1e;">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#7a5a3e;">電話</td><td style="padding:8px 0;">${escapeHtml(phone || "—")}</td></tr>
        <tr><td style="padding:8px 0;color:#7a5a3e;">種別</td><td style="padding:8px 0;font-weight:700;">${escapeHtml(typeLabel[type] || type)}</td></tr>
      </table>

      <h3 style="margin:0 0 8px;font-size:13px;color:#d96e1e;letter-spacing:.05em;">■ お問い合わせ内容</h3>
      <div style="padding:14px 16px;background:#fff8f0;border-left:3px solid #f5862e;border-radius:0 8px 8px 0;font-size:14px;white-space:pre-wrap;">${escapeHtml(message)}</div>

      <p style="margin:24px 0 0;padding:14px 16px;background:#fffaf2;border-radius:8px;font-size:13px;color:#5a3f2a;">
        → 2営業日以内にご返信ください 🍔
      </p>
    </div>
    <div style="padding:16px 28px;background:#fff8f0;border-top:1px solid #f3d9b5;font-size:11px;color:#8a6d38;text-align:center;">
      © 2026 Vsw株式会社 / クリチ Inquiry AI
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
}
