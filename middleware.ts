/**
 * Next.js Middleware：認証ガード（署名検証つき）
 *
 * 保護対象（未ログイン・署名不正なら /login にリダイレクト）：
 *   - /          チャット画面
 *   - /api/chat  Claude API
 *   - /admin     管理画面（さらに ADMIN_USER_IDS で絞り込み・page.tsx 側）
 *
 * 認証不要：/lp /status /login /knowledge /api/auth/* /api/knowledge-auth /terms /privacy
 *
 * 認証判定：userauth Cookie の HMAC署名＋有効期限を検証（Cookie存在だけでは通さない）
 */
import { NextRequest, NextResponse } from "next/server";
import { verifySessionEdge } from "./lib/sessionEdge";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("userauth")?.value;
  const valid = await verifySessionEdge(token);

  if (!valid) {
    // API は 401 JSON、ページは /login リダイレクト
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: "authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("reason", "authrequired");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/chat/:path*", "/admin/:path*"],
};
