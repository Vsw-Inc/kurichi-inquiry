/**
 * セッション管理ユーティリティ（Node.js runtime 用）。
 * Cookie ベース（HttpOnly / Secure / SameSite=Strict）で 30 日保持。
 *
 * セキュリティ：
 *   - SESSION_SECRET は必須（fallback なし）
 *   - HMAC-SHA256 フル幅署名（切り詰めなし）
 *   - timingSafeEqual で定数時間比較
 *   - loggedAt による有効期限検証（30日）
 */
import crypto from "node:crypto";

export const USER_COOKIE = "userauth";
export const USER_MAX_AGE = 60 * 60 * 24 * 30; // 30日
const MAX_AGE_MS = USER_MAX_AGE * 1000;

export type SessionUser = {
  id: string;
  name: string;
  store?: string;
  picture?: string | null;
  loggedAt: number;
  source: "line" | "mock";
};

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "SESSION_SECRET が未設定または短すぎます。32バイトhex以上を環境変数に設定してください。"
    );
  }
  return s;
}

export function encodeSession(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url"); // フル幅（切り詰めなし）
  return `${payload}.${sig}`;
}

export function decodeSession(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  let expected: string;
  try {
    expected = crypto
      .createHmac("sha256", getSecret())
      .update(payload)
      .digest("base64url");
  } catch {
    return null;
  }

  // 定数時間比較（長さ不一致は即 false）
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const user = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    ) as SessionUser;
    // 有効期限チェック（30日超過は無効）
    if (
      typeof user.loggedAt !== "number" ||
      Date.now() - user.loggedAt > MAX_AGE_MS
    ) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function buildSetCookieHeader(token: string): string {
  return `${USER_COOKIE}=${token}; Path=/; Max-Age=${USER_MAX_AGE}; HttpOnly; Secure; SameSite=Strict`;
}

export function buildClearCookieHeader(): string {
  return `${USER_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

/** 店舗コード通過トークン（署名つき・捏造防止） */
export function makeShopToken(): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update("shopcode-verified")
    .digest("base64url");
}

export function verifyShopToken(token: string | undefined): boolean {
  if (!token) return false;
  let expected: string;
  try {
    expected = makeShopToken();
  } catch {
    return false;
  }
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** モック用のテストユーザー */
export const MOCK_USER: SessionUser = {
  id: "mock-bait-001",
  name: "テストバイトさん",
  store: "デモ店舗",
  picture: null,
  loggedAt: 0,
  source: "mock",
};
