/**
 * LINE Messaging API: Push Message ヘルパー。
 * POST https://api.line.me/v2/bot/message/push
 *
 * 注意：
 *  - 無料プラン：月200通まで
 *  - ライトプラン：月5,000通まで（¥5,000/月）
 *  - reply とは別の課金対象
 */

export type PushResult = {
  ok: boolean;
  status?: number;
  error?: string;
};

export async function pushTextMessage(
  lineUserId: string,
  text: string
): Promise<PushResult> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return { ok: false, error: "LINE_CHANNEL_ACCESS_TOKEN not set" };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: "メッセージが空です" };
  }
  if (trimmed.length > 4900) {
    return { ok: false, error: "メッセージは4900文字以内にしてください" };
  }
  if (!lineUserId || !lineUserId.startsWith("U")) {
    return { ok: false, error: "LINE userId 形式が不正です" };
  }

  try {
    const r = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [{ type: "text", text: trimmed }],
      }),
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      console.error("[linePush] failed:", r.status, errText);
      return {
        ok: false,
        status: r.status,
        error: r.status === 429
          ? "月の送信上限に達した可能性があります（無料プランは月200通）"
          : `LINE API エラー：${r.status}`,
      };
    }
    return { ok: true, status: r.status };
  } catch (e: any) {
    console.error("[linePush] error:", e?.message ?? e);
    return { ok: false, error: e?.message ?? "通信エラー" };
  }
}
