/**
 * LINE Login 認証開始エンドポイント。
 *
 * - LINE_LOGIN_MOCK=true（または LINE_CHANNEL_ID 未設定）の場合：
 *   モック動作。即セッション発行して / へリダイレクト。
 * - 本番設定済の場合：
 *   LINE 認証 URL にリダイレクト。
 *   ※ コールバックは /api/auth/line/callback で受ける
 */
import crypto from "node:crypto";
import {
  encodeSession,
  buildSetCookieHeader,
  verifyShopToken,
  MOCK_USER,
} from "../../../../../lib/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // 店舗コードチェック：署名つき shopcode Cookie を検証（捏造防止）
  const cookieHeader = req.headers.get("cookie") || "";
  const shopMatch = cookieHeader.match(/shopcode=([^;]+)/);
  if (!verifyShopToken(shopMatch?.[1])) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/login?reason=shopcode" },
    });
  }

  const isMock =
    process.env.LINE_LOGIN_MOCK === "true" || !process.env.LINE_CHANNEL_ID;

  if (isMock) {
    // モック：即セッション発行
    const user = { ...MOCK_USER, loggedAt: Date.now() };
    const token = encodeSession(user);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/?login=mock",
        "Set-Cookie": buildSetCookieHeader(token),
      },
    });
  }

  // 本番：LINE 認証 URL を組み立て
  const channelId = process.env.LINE_CHANNEL_ID;
  const redirectUri =
    process.env.LINE_REDIRECT_URI ||
    `${url.origin}/api/auth/line/callback`;
  const state = crypto.randomBytes(16).toString("hex");
  const scope = "profile openid";

  const lineUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
  lineUrl.searchParams.set("response_type", "code");
  lineUrl.searchParams.set("client_id", channelId!);
  lineUrl.searchParams.set("redirect_uri", redirectUri);
  lineUrl.searchParams.set("state", state);
  lineUrl.searchParams.set("scope", scope);
  lineUrl.searchParams.set("bot_prompt", "aggressive");

  // state を一時 Cookie に保管（CSRF対策）
  const stateCookie = `linestate=${state}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: lineUrl.toString(),
      "Set-Cookie": stateCookie,
    },
  });
}
