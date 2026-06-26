import { buildClearCookieHeader } from "../../../../lib/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/login?logout=ok",
      "Set-Cookie": buildClearCookieHeader(),
    },
  });
}
