/**
 * 店舗コード認証エンドポイント。
 * LINE Login の前段で「ラ・ヴィーチェ関係者のみ通す」フィルタ。
 *
 * 設定：環境変数 SHOP_CODE（必須・fallback なし）
 * 成功時：署名つき HttpOnly Cookie `shopcode` を 30日 で発行（捏造防止）
 */
import { makeShopToken } from "../../../../lib/session";

export const runtime = "nodejs";

const SHOP_COOKIE = "shopcode";
const SHOP_MAX_AGE = 60 * 60 * 24 * 30; // 30日

export async function POST(req: Request) {
  const expected = process.env.SHOP_CODE;
  if (!expected) {
    return new Response(
      JSON.stringify({ ok: false, error: "SHOP_CODE not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const contentType = req.headers.get("content-type") || "";
  let code = "";
  let isForm = false;

  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as { code?: string };
    code = body.code || "";
  } else {
    isForm = true;
    const form = await req.formData().catch(() => null);
    code = form ? String(form.get("code") || "") : "";
  }

  const ok = code.trim().toUpperCase() === expected.toUpperCase();
  const token = makeShopToken();
  const setCookie = `${SHOP_COOKIE}=${token}; Path=/; Max-Age=${SHOP_MAX_AGE}; HttpOnly; Secure; SameSite=Strict`;

  // フォーム送信：リダイレクトで応答（JS不要）
  if (isForm) {
    if (ok) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/login?step=line", "Set-Cookie": setCookie },
      });
    }
    return new Response(null, {
      status: 302,
      headers: { Location: "/login?error=shopcode" },
    });
  }

  // JSON（fetch）
  if (ok) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": setCookie },
    });
  }
  return new Response(JSON.stringify({ ok: false }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
