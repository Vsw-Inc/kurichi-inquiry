/**
 * 管理者専用：LINEユーザーへ Push Message を送信。
 *
 * - admin認証必須（ADMIN_USER_IDS に session.id が含まれること）
 * - 送信ログは chat_logs に user_source="admin/push" で記録
 * - 入力validation はlinePush.ts側でも実施
 */
import { cookies } from "next/headers";
import { decodeSession, USER_COOKIE } from "../../../../lib/session";
import { pushTextMessage } from "../../../../lib/linePush";
import { logChat } from "../../../../lib/chatLog";

export const runtime = "nodejs";

function isAdmin(sessionId: string): boolean {
  const adminIds = (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return adminIds.length > 0 && adminIds.includes(sessionId);
}

export async function POST(req: Request) {
  // 認証
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(USER_COOKIE)?.value);
  if (!session) {
    return new Response(JSON.stringify({ ok: false, error: "ログインが必要です" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!isAdmin(session.id)) {
    return new Response(JSON.stringify({ ok: false, error: "管理者権限が必要です" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // body
  let body: { to?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "不正なJSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const to = (body.to || "").trim();
  const text = (body.text || "").trim();

  if (!to || !text) {
    return new Response(JSON.stringify({ ok: false, error: "宛先とメッセージは必須" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Push 送信
  const result = await pushTextMessage(to, text);

  // ログ記録（admin/push として識別可能に）
  void logChat({
    user_id: to,
    user_source: "admin/push",
    user_name: `[管理者${session.name}より]`,
    question: `[管理者からのpush]`,
    answer_preview: text.substring(0, 300),
    citation: result.ok ? "PUSH_OK" : `PUSH_FAILED: ${result.error}`,
  });

  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 502,
    headers: { "Content-Type": "application/json" },
  });
}
