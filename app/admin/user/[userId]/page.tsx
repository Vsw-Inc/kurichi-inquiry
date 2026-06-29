import { cookies } from "next/headers";
import Link from "next/link";
import AdminLogin from "../../AdminLogin";
import { fetchChatsByUser } from "../../../../lib/chatLog";
import PushForm from "./PushForm";
import "../../admin.css";

export const metadata = {
  title: "ユーザー詳細 — クリチ Inquiry AI 管理",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ADMIN_COOKIE = "kurichi_admin";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const cookieStore = await cookies();
  const authed = cookieStore.get(ADMIN_COOKIE)?.value === "ok";
  if (!authed) return <AdminLogin />;

  const { userId } = await params;
  const chats = await fetchChatsByUser(userId, 500);

  const fmt = (s: string | null | undefined) => {
    if (!s) return "—";
    return new Date(s).toLocaleString("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const userName = chats.find((c) => c.user_name)?.user_name || null;

  return (
    <div className="kadmin">
      <header className="kadmin-head">
        <div>
          <div className="kadmin-eyebrow">― USER DETAIL</div>
          <h1 className="serif">{userName || "（名前未取得）"}</h1>
          <div className="kadmin-user-meta">
            <code>{userId}</code>　/　全 {chats.length} 件
          </div>
        </div>
        <div className="kadmin-head-r">
          <Link href="/admin" className="kadmin-link">← 管理トップ</Link>
        </div>
      </header>

      <section className="kadmin-section">
        <h2>📤 このユーザーに個別メッセージを送る</h2>
        <p className="kadmin-note">
          管理者から手動でLINEメッセージを送信できます。送信内容は履歴にも残ります。
        </p>
        <PushForm userId={userId} />
      </section>

      <section className="kadmin-section">
        <h2>💬 会話履歴（古い順 / 最大500件）</h2>
        {chats.length === 0 ? (
          <div className="kadmin-empty">このユーザーの履歴はまだありません。</div>
        ) : (
          <ul className="kadmin-chatlist">
            {chats.map((c) => {
              const isAdminPush = c.user_source?.includes("admin-push");
              const isEscalate = c.user_source?.includes("escalate");
              return (
                <li
                  key={c.id}
                  className={`kadmin-chatitem ${
                    isAdminPush ? "is-admin" : isEscalate ? "is-escalate" : ""
                  }`}
                >
                  <div className="kadmin-chat-meta">
                    <span className="kadmin-chat-time">{fmt(c.created_at)}</span>
                    {isAdminPush && <span className="bdg accent">管理者送信</span>}
                    {isEscalate && <span className="bdg escalate">エスカレ</span>}
                  </div>
                  {!isAdminPush && (
                    <div className="kadmin-chat-q">
                      <strong>ユーザー：</strong>
                      {c.question}
                    </div>
                  )}
                  <div className="kadmin-chat-a">
                    <strong>{isAdminPush ? "管理者：" : "クリチちゃん："}</strong>
                    {c.answer_preview || "—"}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="kadmin-foot">
        <span>© 2026 Vsw株式会社 — クリチ Inquiry AI</span>
        <span>v0.2</span>
      </footer>
    </div>
  );
}
