export const runtime = "nodejs";

export async function GET() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/admin",
      "Set-Cookie":
        "kurichi_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict",
    },
  });
}
