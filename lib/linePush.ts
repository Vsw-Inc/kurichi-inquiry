/**
 * LINE Push Message API ラッパー。
 * 管理者が個別ユーザーに対して任意のメッセージを送信するときに使う。
 *
 * 制限：
 *  - LINE 無料プラン：月1000通まで
 *  - LINE_CHANNEL_ACCESS_TOKEN 必須
 */

export type PushResult = { ok: true } | { ok: false; status: number; body: string };

export async function pushLineMessage(userId: string, text: string): Promise<PushResult> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return { ok: false, status: 500, body: "LINE_CHANNEL_ACCESS_TOKEN が未設定です" };

  try {
    const r = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text: text.slice(0, 5000) }],
      }),
    });
    if (!r.ok) {
      const body = await r.text().catch(() => "");
      return { ok: false, status: r.status, body };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, status: 0, body: e?.message ?? String(e) };
  }
}
