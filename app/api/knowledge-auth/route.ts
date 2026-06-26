export const runtime = "nodejs";

const SESSION_COOKIE = "lavicheauth";
const SESSION_VALUE = "1";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30日

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };
  // 環境変数 KNOWLEDGE_PASSWORD（必須・fallback なし）
  const expected = process.env.KNOWLEDGE_PASSWORD;
  if (!expected) {
    return new Response(
      JSON.stringify({ ok: false, error: "KNOWLEDGE_PASSWORD not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (typeof password === "string" && password.trim() === expected) {
    // 認証成功：HttpOnly Cookie をセット（30日保持）
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `${SESSION_COOKIE}=${SESSION_VALUE}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; Secure; SameSite=Strict`,
      },
    });
  }
  return new Response(JSON.stringify({ ok: false }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
