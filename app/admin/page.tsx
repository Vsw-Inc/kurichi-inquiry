import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { decodeSession, USER_COOKIE } from "../../lib/session";
import { fetchRecentLogs, fetchStats, USD_JPY } from "../../lib/chatLog";
import { listUsers, countUsers } from "../../lib/lineWhitelist";
import CostChart from "./CostChart";
import "./admin.css";

export const metadata = {
  title: "GM Console — ラ・ヴィーチェ コンシェルジュ",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(USER_COOKIE)?.value);

  // 管理者判定：ADMIN_USER_IDS 環境変数（カンマ区切り）
  const adminIds = (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // 空配列 = 管理者ゼロ = 全拒否（誤って全開放しないため）
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
          <p>
            ログイン中：<strong>{session.name}</strong>
            <br />
            ご自身のLINE User IDは <code>{session.id}</code> です。
          </p>
          <p className="ad-deny-note">
            管理者として追加する場合は、Vsw（菊地）に上記IDをお伝えください。
            Vercel環境変数 ADMIN_USER_IDS に追加されると、こちらに戻った瞬間に
            管理画面が見えるようになります。
          </p>
          <div className="ad-deny-btns">
            <Link href="/" className="ad-btn">チャットに戻る</Link>
            <a href="/api/auth/logout" className="ad-btn ghost">ログアウト</a>
          </div>
        </div>
      </div>
    );
  }

  // 管理者：データ取得
  const [stats, logs, lineUserCounts, lineUserList] = await Promise.all([
    fetchStats(),
    fetchRecentLogs(50),
    countUsers(),
    listUsers(100),
  ]);

  return (
    <div className="ad">
      <header className="ad-head">
        <div className="ad-head-l">
          <div className="ad-eyebrow">― GM CONSOLE</div>
          <h1 className="serif">ヴィーチェさん 管理画面</h1>
        </div>
        <div className="ad-head-r">
          <span>👤 {session.name}</span>
          <Link href="/" className="ad-link">チャット</Link>
          <Link href="/status" className="ad-link">進捗</Link>
          <a href="/api/auth/logout" className="ad-link">ログアウト</a>
        </div>
      </header>

      <section className="ad-kpis">
        <div className="ad-kpi">
          <div className="ad-kpi-num">{stats.today}<em></em></div>
          <div className="ad-kpi-label">今日の質問</div>
        </div>
        <div className="ad-kpi">
          <div className="ad-kpi-num">{stats.total}<em></em></div>
          <div className="ad-kpi-label">累計質問数</div>
        </div>
        <div className="ad-kpi">
          <div className="ad-kpi-num">{stats.uniqueUsers}<em>人</em></div>
          <div className="ad-kpi-label">ユニークユーザー</div>
        </div>
        <div className="ad-kpi" style={stats.filtered > 0 ? {borderLeftColor:"#d97a6c"} : {}}>
          <div className="ad-kpi-num">{stats.filtered}<em></em></div>
          <div className="ad-kpi-label">フィルタ検知 累計</div>
        </div>
      </section>

      {/* API利用料 */}
      <section className="ad-cost">
        <h2>💰 API利用料（Claude Sonnet 4.5）</h2>
        <div className="ad-cost-grid">
          <div className="ad-cost-card">
            <div className="ad-cost-num">¥{Math.round(stats.costJpyToday).toLocaleString()}</div>
            <div className="ad-cost-label">今日のAPI料金</div>
          </div>
          <div className="ad-cost-card accent">
            <div className="ad-cost-num">¥{Math.round(stats.costJpyTotal).toLocaleString()}</div>
            <div className="ad-cost-label">累計API料金</div>
          </div>
          <div className="ad-cost-card">
            <div className="ad-cost-num">¥{stats.avgCostJpy.toFixed(1)}</div>
            <div className="ad-cost-label">1質問あたり 平均</div>
          </div>
          <div className="ad-cost-card">
            <div className="ad-cost-num">{(stats.tokensTotal / 1000).toFixed(1)}<span className="u">K</span></div>
            <div className="ad-cost-label">累計トークン数</div>
          </div>
        </div>
        <CostChart stats={stats} />
        <p className="ad-cost-note">
          ※ 単価：input $3 / output $15 / cache write $3.75 / cache read $0.30（per 1M tokens）
          ・$1 = ¥{USD_JPY} で換算 ・Prompt Caching で2回目以降は大幅割引
          ・月次目安：{stats.total > 0 ? `現ペースで約 ¥${Math.round(stats.costJpyToday * 30).toLocaleString()}/月` : "データ蓄積後に表示"}
        </p>
      </section>

      {/* LINEユーザー管理 */}
      <section className="ad-section">
        <h2>💬 LINE 公式アカウント ユーザー</h2>

        <div className="ad-kpis ad-kpis-line">
          <div className="ad-kpi">
            <div className="ad-kpi-num">{lineUserCounts.total}<em>人</em></div>
            <div className="ad-kpi-label">友だち追加 累計</div>
          </div>
          <div className="ad-kpi">
            <div className="ad-kpi-num" style={{color:"#06c755"}}>{lineUserCounts.verified}<em>人</em></div>
            <div className="ad-kpi-label">認証済み</div>
          </div>
          <div className="ad-kpi">
            <div className="ad-kpi-num" style={{color:"#999"}}>{lineUserCounts.pending}<em>人</em></div>
            <div className="ad-kpi-label">未認証（合言葉待ち）</div>
          </div>
          <div className="ad-kpi" style={lineUserCounts.blocked > 0 ? {borderLeftColor:"#d97a6c"} : {}}>
            <div className="ad-kpi-num" style={{color:"#d97a6c"}}>{lineUserCounts.blocked}<em>人</em></div>
            <div className="ad-kpi-label">ブロック</div>
          </div>
        </div>

        {lineUserList.length === 0 ? (
          <div className="ad-empty">
            まだLINE経由のユーザーはいません。
            <br />
            <small style={{color:"#999"}}>
              友だち追加→合言葉認証されたユーザーがここに表示されます。
            </small>
          </div>
        ) : (
          <table className="ad-tbl">
            <thead>
              <tr>
                <th style={{width:140}}>表示名</th>
                <th>LINE User ID</th>
                <th style={{width:90}}>状態</th>
                <th style={{width:120}}>認証日</th>
                <th style={{width:120}}>最終アクセス</th>
                <th style={{width:80}}>詳細</th>
              </tr>
            </thead>
            <tbody>
              {lineUserList.map((u) => {
                const fmt = (s: string | null | undefined) => {
                  if (!s) return "—";
                  return new Date(s).toLocaleString("ja-JP", {
                    month: "numeric", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  });
                };
                return (
                  <tr key={u.line_user_id} className={u.blocked ? "row-filtered" : ""}>
                    <td><strong>{u.display_name || "（未取得）"}</strong></td>
                    <td className="muted"><code style={{fontSize:11}}>{u.line_user_id.substring(0,8)}…{u.line_user_id.slice(-6)}</code></td>
                    <td>
                      {u.blocked ? <span className="bdg fil">BLOCK</span>
                        : u.is_verified ? <span className="bdg ok" style={{background:"#06c755",color:"#fff"}}>認証済</span>
                        : <span className="bdg" style={{background:"#fce6c8",color:"#8a6d38"}}>未認証</span>}
                    </td>
                    <td className="muted">{fmt(u.verified_at)}</td>
                    <td className="muted">{fmt(u.last_seen_at)}</td>
                    <td>
                      <Link href={`/admin/user/${encodeURIComponent(u.line_user_id)}`} className="ad-link" style={{fontSize:12}}>
                        履歴 →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="ad-section">
        <h2>直近の質問ログ（最新50件）</h2>
        {logs.length === 0 ? (
          <div className="ad-empty">
            ログがまだありません。
            <br />
            <small style={{color:"#999"}}>
              ※ chat_logs テーブルが Supabase 未作成の可能性があります。
              <br />
              <code>supabase/schema.sql</code> を SQL Editor で実行してください。
            </small>
          </div>
        ) : (
          <table className="ad-tbl">
            <thead>
              <tr>
                <th style={{width:60}}>時刻</th>
                <th style={{width:100}}>ユーザー</th>
                <th>質問</th>
                <th>応答プレビュー</th>
                <th style={{width:120}}>出典</th>
                <th style={{width:60}}>判定</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => {
                const dt = new Date(row.created_at);
                const time =
                  dt.toLocaleString("ja-JP", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                const userDisplay = row.user_name || (row.user_id ? row.user_id.substring(0,10) + "…" : "—");
                return (
                  <tr key={row.id} className={row.filtered ? "row-filtered" : row.rate_limited ? "row-rate" : ""}>
                    <td className="muted">{time}</td>
                    <td>
                      {row.user_id ? (
                        <Link href={`/admin/user/${encodeURIComponent(row.user_id)}`} className="ad-link" style={{fontSize:12}}>
                          {userDisplay}
                        </Link>
                      ) : userDisplay}
                    </td>
                    <td className="q">{row.question}</td>
                    <td className="a">{row.answer_preview || "—"}</td>
                    <td className="cite">{row.citation || "—"}</td>
                    <td>
                      {row.filtered && <span className="bdg fil">FIL</span>}
                      {row.rate_limited && <span className="bdg rate">RATE</span>}
                      {!row.filtered && !row.rate_limited && <span className="bdg ok">OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <footer className="ad-foot">
        <div>© 2026 La Viche / AMZ GROUP — GM Console v0.1（MVP）</div>
        <div>Prepared by Vsw Inc.</div>
      </footer>
    </div>
  );
}
