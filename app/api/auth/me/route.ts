/**
 * 現在のセッション情報を返すエンドポイント。
 * Client Component から fetch して、ログイン状態を取得する。
 */
import { cookies } from "next/headers";
import { decodeSession, USER_COOKIE } from "../../../../lib/session";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(USER_COOKIE)?.value);
  if (!session) {
    return new Response(JSON.stringify({ user: null, isAdmin: false }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  const adminIds = (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isAdmin = adminIds.length > 0 && adminIds.includes(session.id);
  return new Response(JSON.stringify({ user: session, isAdmin }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
