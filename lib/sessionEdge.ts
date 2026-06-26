/**
 * Edge Runtime（middleware）用のセッション署名検証。
 * node:crypto が使えないため Web Crypto API（crypto.subtle）で実装。
 * lib/session.ts（node:crypto・HMAC-SHA256 base64url フル幅）と互換。
 */

const MAX_AGE_MS = 60 * 60 * 24 * 30 * 1000; // 30日

function bufToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToString(s: string): string {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * セッショントークンの署名と有効期限を検証（Edge対応）。
 */
export async function verifySessionEdge(
  token: string | undefined
): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret || secret.length < 16) return false;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );
    const expected = bufToBase64url(sigBuf);

    // 定数時間比較
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) {
      diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (diff !== 0) return false;

    // 有効期限チェック
    const user = JSON.parse(base64urlToString(payload)) as {
      loggedAt?: number;
    };
    if (
      typeof user.loggedAt !== "number" ||
      Date.now() - user.loggedAt > MAX_AGE_MS
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
