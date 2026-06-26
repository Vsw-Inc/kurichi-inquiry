import { cookies } from "next/headers";
import Link from "next/link";
import ViBotAvatar from "../components/ViBotAvatar";
import { decodeSession, USER_COOKIE, verifyShopToken } from "../../lib/session";
import "./login.css";

export const metadata = {
  title: "ログイン — ラ・ヴィーチェ コンシェルジュ",
  description: "パスワード + LINEでログイン",
};

const SHOP_COOKIE = "shopcode";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    logout?: string;
    error?: string;
    reason?: string;
    step?: string;
  }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(USER_COOKIE)?.value);
  const shopVerified =
    verifyShopToken(cookieStore.get(SHOP_COOKIE)?.value) ||
    params.step === "line";

  return (
    <div className="lg">
      <div className="lg-orb" aria-hidden />
      <div className="lg-card">
        <div className="lg-avatar float">
          <ViBotAvatar size={140} />
        </div>

        <div className="lg-eyebrow">― LA VICHE CONCIERGE</div>
        <h1 className="serif">
          ヴィーチェさんに、<br />
          ようこそ。
        </h1>
        <p className="lg-lead">
          ラ・ヴィーチェのバイト・社員向け<br />
          社内Q&A AI先輩です🌿
        </p>

        {params.logout === "ok" && (
          <div className="lg-msg ok">ログアウトしました</div>
        )}
        {params.error === "shopcode" && (
          <div className="lg-msg err">パスワードが違います。もう一度入力してください。</div>
        )}
        {params.error && params.error !== "shopcode" && (
          <div className="lg-msg err">エラー: {params.error}</div>
        )}
        {params.reason === "authrequired" && (
          <div className="lg-msg err">ご利用にはログインが必要です。</div>
        )}
        {params.reason === "shopcode" && (
          <div className="lg-msg err">パスワードの確認が必要です。</div>
        )}

        {session ? (
          /* ── ログイン済み ── */
          <div className="lg-loggedin">
            <p>
              ログイン中：<strong>{session.name}</strong>
              {session.store && <small>（{session.store}）</small>}
            </p>
            <div className="lg-btns">
              <Link href="/" className="lg-btn-primary">
                チャットを開く →
              </Link>
              <a href="/api/auth/logout" className="lg-btn-ghost">
                ログアウト
              </a>
            </div>
          </div>
        ) : shopVerified ? (
          /* ── STEP 2：LINEログイン ── */
          <div className="lg-actions">
            <div className="lg-msg ok" style={{ marginBottom: 14 }}>
              ✓ パスワード確認OK
            </div>
            <a href="/api/auth/line/start" className="lg-btn-line">
              <span className="lg-line-icon">LINE</span>
              <span>LINEでログイン</span>
            </a>
            <p className="lg-mock-note">
              ※ LINEの「許可する」を押すとログインできます。
              <br />
              個人のLINEアカウントがあればOKです。
            </p>
          </div>
        ) : (
          /* ── STEP 1：パスワード（JS非依存のHTML form）── */
          <div className="lg-actions">
            <form method="POST" action="/api/auth/shopcode" className="lg-gate-field">
              <input
                type="password"
                name="code"
                placeholder="パスワードを入力"
                autoComplete="current-password"
                required
                autoFocus
              />
              <button type="submit">次へ</button>
            </form>
            <p className="lg-mock-note">
              🔒 ラ・ヴィーチェ関係者限定です。
              <br />
              パスワードは店長または本部からご案内します。
            </p>
          </div>
        )}

        <p className="lg-foot">
          <Link href="/terms" style={{ color: "#c8a570", textDecoration: "none" }}>
            利用規約
          </Link>
          <span style={{ margin: "0 10px", opacity: 0.4 }}>·</span>
          <Link href="/privacy" style={{ color: "#c8a570", textDecoration: "none" }}>
            プライバシー
          </Link>
          <br />
          © 2026 La Viche / AMZ GROUP · Built by Vsw Inc.
        </p>
      </div>
    </div>
  );
}
