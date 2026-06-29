/**
 * 管理者が LINE 個別ユーザーに任意のメッセージを送る API。
 * Cookie 認証必須（/admin と同じ kurichi_admin Cookie）。
 *
 * 送信成功時、chat_logs にも user_source="kurichi-admin-push" として記録し、
 * 管理画面側で操作履歴を辿れるようにする。
 */
import { cookies } from "next/headers";
import { pushLineMessage } from "../../../../lib/linePush";
import { logChat } from "../../../../lib/chatLog";

export const runtime = "nodejs";

const ADMIN_COOKIE = "kurichi_admin";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const authed = cookieStore.get(ADMIN_COOKIE)?.value === "ok";
  if (!authed) {
    return Response.json({ ok: false, error: "認証が必要です" }, { status: 401 });
  }

  let body: { userId?: string; text?: string };
  try {
    body = (await req.json()) as { userId?: string; text?: string };
  } catch {
    return Response.json({ ok: false, error: "不正なJSON" }, { status: 400 });
  }

  const userId = (body.userId || "").trim();
  const text = (body.text || "").trim();
  if (!userId || !text) {
    return Response.json(
      { ok: false, error: "userId と text は必須です" },
      { status: 400 }
    );
  }
  if (text.length > 5000) {
    return Response.json({ ok: false, error: "本文は5000文字以内" }, { status: 400 });
  }

  const result = await pushLineMessage(userId, text);
  if (!result.ok) {
    return Response.json(
      {
        ok: false,
        error: `LINE Push 失敗: ${result.status} ${result.body.slice(0, 200)}`,
      },
      { status: 502 }
    );
  }

  // 操作履歴として記録（fire-and-forget）
  logChat({
    user_id: userId,
    user_source: "kurichi-admin-push",
    question: "[管理者送信]",
    answer_preview: text.slice(0, 200),
  }).catch(() => {});

  return Response.json({ ok: true });
}
