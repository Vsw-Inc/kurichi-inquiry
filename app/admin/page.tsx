import { cookies } from "next/headers";
import Link from "next/link";
import AdminLogin from "./AdminLogin";
import {
  fetchKurichiChats,
  countKurichiChats,
} from "../../lib/chatLog";
import { fetchLeads, countLeads } from "../../lib/leadLog";
import "./admin.css";

export const metadata = {
  title: "管理コンソール — クリチ Inquiry AI",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ADMIN_COOKIE = "kurichi_admin";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get(ADMIN_COOKIE)?.value === "ok";

  if (!authed) {
    return <AdminLogin />;
  }

  const [totalChats, todayChats, totalLeads, todayLeads, chats, leads] =
    await Promise.all([
      countKurichiChats("all"),
      countKurichiChats("today"),
      countLeads("all"),
      countLeads("today"),
      fetchKurichiChats(20),
      fetchLeads(20),
    ]);

  const fmt = (s: string | null | undefined) => {
    if (!s) return "—";
    return new Date(s).toLocaleString("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const typeLabel: Record<string, string> = {
    demo: "無料デモ",
    biz: "他社導入",
    wholesale: "卸し相談",
    media: "取材",
    other: "その他",
  };

  return (
    <div className="kadmin">
      <header className="kadmin-head">
        <div>
          <div className="kadmin-eyebrow">― KURICHI ADMIN</div>
          <h1 className="serif">クリチ Inquiry AI 管理</h1>
        </div>
        <div className="kadmin-head-r">
          <Link href="/admin/knowledge" className="kadmin-link">📖 ナレッジ</Link>
          <Link href="/lp" className="kadmin-link">サイトに戻る</Link>
          <a href="/api/admin/logout" className="kadmin-link">ログアウト</a>
        </div>
      </header>

      {/* KPIs */}
      <section className="kadmin-kpis">
        <div className="kadmin-kpi">
          <div className="kadmin-kpi-num">{todayChats}<em></em></div>
          <div className="kadmin-kpi-label">今日のLINEチャット</div>
        </div>
        <div className="kadmin-kpi">
          <div className="kadmin-kpi-num">{totalChats}<em></em></div>
          <div className="kadmin-kpi-label">LINEチャット累計</div>
        </div>
        <div className="kadmin-kpi">
          <div className="kadmin-kpi-num accent">{todayLeads}<em></em></div>
          <div className="kadmin-kpi-label">今日のフォームリード</div>
        </div>
        <div className="kadmin-kpi">
          <div className="kadmin-kpi-num accent">{totalLeads}<em></em></div>
          <div className="kadmin-kpi-label">フォームリード累計</div>
        </div>
      </section>

      {/* Leads */}
      <section className="kadmin-section">
        <h2>📨 リード一覧（直近20件）</h2>
        {leads.length === 0 ? (
          <div className="kadmin-empty">
            まだフォームからのお問い合わせはありません。
            <br />
            <small>
              ※ Supabase に leads テーブル未作成だと記録されません。
              SETUP参照。
            </small>
          </div>
        ) : (
          <table className="kadmin-tbl">
            <thead>
              <tr>
                <th style={{ width: 100 }}>時刻</th>
                <th style={{ width: 90 }}>種別</th>
                <th>お名前・会社</th>
                <th>連絡先</th>
                <th>内容</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td className="muted">{fmt(l.created_at)}</td>
                  <td>
                    <span className="bdg">{typeLabel[l.type || "other"] || l.type}</span>
                  </td>
                  <td>
                    <strong>{l.name}</strong>
                    {l.company && <><br /><small className="muted">{l.company}</small></>}
                  </td>
                  <td>
                    <a href={`mailto:${l.email}`}>{l.email}</a>
                    {l.phone && <><br /><small>{l.phone}</small></>}
                  </td>
                  <td className="q">{l.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Chats */}
      <section className="kadmin-section">
        <h2>💬 LINEチャット履歴（直近20件）</h2>
        {chats.length === 0 ? (
          <div className="kadmin-empty">
            まだLINEからの問い合わせはありません。
            <br />
            <small>
              ※ Supabase に chat_logs テーブル未作成だと記録されません。
            </small>
          </div>
        ) : (
          <table className="kadmin-tbl">
            <thead>
              <tr>
                <th style={{ width: 100 }}>時刻</th>
                <th style={{ width: 120 }}>区分</th>
                <th>質問</th>
                <th>回答プレビュー</th>
                <th style={{ width: 140 }}>出典</th>
              </tr>
            </thead>
            <tbody>
              {chats.map((c) => (
                <tr
                  key={c.id}
                  className={c.user_source?.includes("escalate") ? "row-escalate" : ""}
                >
                  <td className="muted">{fmt(c.created_at)}</td>
                  <td>
                    {c.user_source?.includes("escalate") ? (
                      <span className="bdg escalate">エスカレ</span>
                    ) : (
                      <span className="bdg">LINE</span>
                    )}
                  </td>
                  <td className="q">{c.question}</td>
                  <td className="a">{c.answer_preview || "—"}</td>
                  <td className="cite">{c.citation || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer className="kadmin-foot">
        <span>© 2026 Vsw株式会社 — クリチ Inquiry AI</span>
        <span>v0.1</span>
      </footer>
    </div>
  );
}
