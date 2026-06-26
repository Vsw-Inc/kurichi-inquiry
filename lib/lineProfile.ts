/**
 * LINE Messaging API: Profile 取得ヘルパー。
 * GET https://api.line.me/v2/bot/profile/{userId}
 */
export type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

export async function fetchLineProfile(
  lineUserId: string
): Promise<LineProfile | null> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return null;
  try {
    const r = await fetch(
      `https://api.line.me/v2/bot/profile/${encodeURIComponent(lineUserId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    if (!r.ok) {
      console.warn(
        "[lineProfile] fetch failed:",
        r.status,
        await r.text().catch(() => "")
      );
      return null;
    }
    return (await r.json()) as LineProfile;
  } catch (e: any) {
    console.warn("[lineProfile] error:", e?.message ?? e);
    return null;
  }
}
