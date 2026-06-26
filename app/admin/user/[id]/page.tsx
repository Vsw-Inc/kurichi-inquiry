import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { decodeSession, USER_COOKIE } from "../../../../lib/session";
import { fetchUserLogs } from "../../../../lib/chatLog";
import { getUser } from "../../../../lib/lineWhitelist";
import PushForm from "./PushForm";
import "../../admin.css";

export const metadata = {
  title: "ユーザー詳細 — GM Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = decodeURIComponent(id);

  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(USER_COOKIE)?.value);

  const adminIds = (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isAdmin =
    session !== null &&
    adminIds.length > 0 &&
    adminIds.includes(session.id);

  if (!session) {
    redirect("/login?reason=adminrequired");
  }
  if (!isAdmin) {
    return (
      <div className="ad">
        <div className="ad-deny">
          <div className="ad-deny-icon">🔒</div>
          <h1 className="serif">管理者権限が必要です</h1>
          <p>このページは管理者のみアクセス可能です。</p>
          <div className="ad-deny-btns">
            <Link href="/" className="ad-btn">チャットに戻る</Link>
          </div>
        </div>
      </div>
    );
  }

  // データ取得
  const [user, logs] = await Promise.all([
    getUser(userId),
    fetchUserLogs(userId, 300),
  ]);

  // 集計
  const total = logs.length;
  const filtered = logs.filter((l) => l.filtered).length;
  const rateLimited = logs.filter((l) => l.rate_limited).length;
  const totalCostJpy = logs.reduce((s, l) => {
    // 雑な再計算（chatLog.tsのPRICINGと同じ単価）
    const input = ((l.input_tokens || 0) * 3) / 1_000_000;
    const output = ((l.output_tokens || 0) * 15) / 1_000_000;
    const cWrite = ((l.cache_creation_tokens || 0) * 3.75) / 1_000_000;
    const cRead = ((l.cache_read_tokens || 0) * 0.3) / 1_000_000;
    return s + (input + output + cWrite + cRead) * 155;
  }, 0);
  const sources = Array.from(new Set(logs.map((l) => l.user_source).filter(Boolean)));

  const fmt = (s: string | null | undefined) => {
    if (!s) return "—";
    return new Date(s).toLocaleString("ja-JP", {
      month: "numeric", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="ad">
      <header className="ad-head">
        <div className="ad-head-l">
          <div className="ad-eyebrow">― USER DETAIL</div>
          <h1 className="serif">{user?.display_name || "（表示名未取得）"}</h1>
          <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
            <code>{userId}</code>
          </div>
        </div>
        <div className="ad-head-r">
          <Link href="/admin" className="ad-link">← 管理画面に戻る</Link>
          <Link href="/" className="ad-link">チャット</Link>
        </div>
      </header>

      {/* ユーザー基本情報 */}
      <section className="ad-section">
        <h2>👤 基本情報</h2>
        {user ? (
          <div className="ad-kpis">
            <div className="ad-kpi">
              <div className="ad-kpi-num" style={{ fontSize: 18 }}>
                {user.blocked ? "🚫" : user.is_verified ? "✅" : "⏳"}<em></em>
              </div>
              <div className="ad-kpi-label">
                {user.blocked ? "ブロック中" : user.is_verified ? "認証済" : "未認証"}
              </div>
            </div>
            <div className="ad-kpi">
              <div className="ad-kpi-num" style={{ fontSize: 18 }}>{fmt(user.verified_at)}<em></em></div>
              <div className="ad-kpi-label">認証日時</div>
            </div>
            <div className="ad-kpi">
              <div className="ad-kpi-num" style={{ fontSize: 18 }}>{fmt(user.last_seen_at)}<em></em></div>
              <div className="ad-kpi-label">最終アクセス</div>
            </div>
            <div className="ad-kpi">
              <div className="ad-kpi-num" style={{ fontSize: 18 }}>{fmt(user.created_at)}<em></em></div>
              <div className="ad-kpi-label">友だち追加日</div>
            </div>
          </div>
        ) : (
          <div className="ad-empty">
            line_users に該当レコードがありません。
            <br />
            <small style={{color:"#999"}}>
              chat_logs だけ存在し、認証フロー前のユーザーの可能性があります。
            </small>
          </div>
        )}
      </section>

      {/* 利用統計 */}
      <section className="ad-section">
        <h2>📊 利用統計</h2>
        <div className="ad-kpis">
          <div className="ad-kpi">
            <div className="ad-kpi-num">{total}<em>件</em></div>
            <div className="ad-kpi-label">質問数</div>
          </div>
          <div className="ad-kpi">
            <div className="ad-kpi-num">¥{Math.round(totalCostJpy).toLocaleString()}<em></em></div>
            <div className="ad-kpi-label">累計APIコスト</div>
          </div>
          <div className="ad-kpi" style={filtered > 0 ? {borderLeftColor:"#d97a6c"} : {}}>
            <div className="ad-kpi-num" style={filtered > 0 ? {color:"#d97a6c"} : {}}>{filtered}<em>件</em></div>
            <div className="ad-kpi-label">フィルタ検知</div>
          </div>
          <div className="ad-kpi">
            <div className="ad-kpi-num" style={rateLimited > 0 ? {color:"#d97a6c"} : {}}>{rateLimited}<em>件</em></div>
            <div className="ad-kpi-label">レート制限</div>
          </div>
        </div>
        {sources.length > 0 && (
          <p className="ad-cost-note" style={{ marginTop: 12 }}>
            利用経路：{sources.join(" / ")}
          </p>
        )}
      </section>

      {/* Push送信フォーム（LINE userIdが取れた場合のみ） */}
      {userId.startsWith("U") && (
        <section className="ad-section">
          <PushForm userId={userId} displayName={user?.display_name || null} />
        </section>
      )}

      {/* チャット履歴 */}
      <section className="ad-section">
        <h2>💬 チャット履歴（直近{Math.min(300, total)}件）</h2>
        {logs.length === 0 ? (
          <div className="ad-empty">このユーザーの質問履歴はまだありません。</div>
        ) : (
          <table className="ad-tbl">
            <thead>
              <tr>
                <th style={{width:90}}>時刻</th>
                <th style={{width:80}}>経路</th>
                <th>質問</th>
                <th>応答プレビュー</th>
                <th style={{width:160}}>出典</th>
                <th style={{width:60}}>判定</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => (
                <tr key={row.id} className={row.filtered ? "row-filtered" : row.rate_limited ? "row-rate" : ""}>
                  <td className="muted">{fmt(row.created_at)}</td>
                  <td className="muted" style={{fontSize:11}}>{row.user_source || "—"}</td>
                  <td className="q">{row.question}</td>
                  <td className="a">{row.answer_preview || "—"}</td>
                  <td className="cite">{row.citation || "—"}</td>
                  <td>
                    {row.filtered && <span className="bdg fil">FIL</span>}
                    {row.rate_limited && <span className="bdg rate">RATE</span>}
                    {!row.filtered && !row.rate_limited && <span className="bdg ok">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer className="ad-foot">
        <div>
          <Link href="/admin" className="ad-link">← 管理画面に戻る</Link>
        </div>
        <div>Prepared by Vsw Inc.</div>
      </footer>
    </div>
  );
}
