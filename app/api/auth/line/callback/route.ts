/**
 * LINE Login コールバックエンドポイント（本番接続時に使用）。
 * 認証コードを access token に交換し、profile を取得してセッション発行する。
 *
 * モック時は呼ばれない（start/route.ts で即セッション発行するため）。
 */
import {
  encodeSession,
  buildSetCookieHeader,
  type SessionUser,
} from "../../../../../lib/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return new Response(`LINE auth error: ${error}`, { status: 400 });
  }
  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  // state検証（簡略・本番では Cookie 取得→比較）
  const cookieHeader = req.headers.get("cookie") || "";
  const stateMatch = cookieHeader.match(/linestate=([^;]+)/);
  if (!stateMatch || stateMatch[1] !== state) {
    return new Response("State mismatch", { status: 400 });
  }

  const channelId = process.env.LINE_CHANNEL_ID;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const redirectUri =
    process.env.LINE_REDIRECT_URI ||
    `${url.origin}/api/auth/line/callback`;

  if (!channelId || !channelSecret) {
    return new Response("LINE channel not configured", { status: 500 });
  }

  // 1. access_token 取得
  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: channelId,
      client_secret: channelSecret,
    }),
  });
  if (!tokenRes.ok) {
    return new Response("token exchange failed: " + (await tokenRes.text()), {
      status: 502,
    });
  }
  const tokenJson = (await tokenRes.json()) as { access_token: string };

  // 2. profile 取得
  const profRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!profRes.ok) {
    return new Response("profile fetch failed", { status: 502 });
  }
  const prof = (await profRes.json()) as {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  };

  // 3. セッション発行
  const user: SessionUser = {
    id: prof.userId,
    name: prof.displayName,
    picture: prof.pictureUrl || null,
    loggedAt: Date.now(),
    source: "line",
  };
  const token = encodeSession(user);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/?login=ok",
      "Set-Cookie": buildSetCookieHeader(token),
    },
  });
}
