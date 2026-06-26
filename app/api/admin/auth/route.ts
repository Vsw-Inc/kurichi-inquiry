/**
 * 管理画面のパスワード認証。
 * 一致したら 30日 HttpOnly Cookie を発行。
 */
export const runtime = "nodejs";

const COOKIE_NAME = "kurichi_admin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30日

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return new Response(
      JSON.stringify({ ok: false, error: "ADMIN_PASSWORD not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }

  const pw = (body.password || "").trim();
  if (!pw || pw !== expected.trim()) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${COOKIE_NAME}=ok; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Strict`,
    },
  });
}
