import Link from "next/link";
import ViBotAvatar from "../components/ViBotAvatar";
import "./lp.css";

const ChatBubblePreview = () => (
  <div className="preview-card">
    <div className="preview-row user">
      <div className="preview-bubble user">給料日はいつ？</div>
    </div>
    <div className="preview-row bot">
      <div className="preview-bubble bot">
        毎月20日だよ🌿 20日が土日祝の場合は前営業日に支給されるよ。
        <div className="preview-cite">📎 出典：給与規程 第6条</div>
      </div>
    </div>
    <div className="preview-row user">
      <div className="preview-bubble user">タトゥーOK？</div>
    </div>
    <div className="preview-row bot">
      <div className="preview-bubble bot">
        ファッションタトゥーなら入会OKだよ🌿 ただし施設内では衣服で隠してね。
        <div className="preview-cite">📎 出典：SOELU店舗運用FAQ 第1章</div>
      </div>
    </div>
  </div>
);

export default function LP() {
  return (
    <div className="lp">
      {/* HEADER */}
      <header className="lp-header">
        <div className="lp-logo">
          <span className="serif">La Viche</span>
          <span className="lp-logo-sub">CONCIERGE</span>
        </div>
        <nav className="lp-nav">
          <a href="#about">ABOUT</a>
          <a href="#features">FEATURES</a>
          <a href="#flow">HOW IT WORKS</a>
          <a href="#meet">MEET</a>
          <Link href="/status">STATUS</Link>
          <Link href="/admin" className="lp-nav-admin">ADMIN</Link>
          <Link href="/login">LOGIN</Link>
          <Link href="/" className="lp-cta-mini">触ってみる →</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-grid">
          <div className="lp-hero-text">
            <div className="eyebrow">― AI EMPLOYEE FOR LA VICHE</div>
            <h1 className="serif">
              ヴィーチェさんに、<br />聞こう。
            </h1>
            <p className="lead">
              ラ・ヴィーチェのバイト・社員のための、社内ルールAI先輩。<br />
              規程・FAQ <strong>8本</strong>を読んで、<strong>24時間</strong>、
              <strong>LINE</strong>で優しく答えてくれる。
            </p>
            <div className="lp-hero-cta">
              <Link href="/" className="btn-primary">
                Webで話す <span>→</span>
              </Link>
              <a href="https://line.me/R/ti/p/@923fsjxp" target="_blank" rel="noreferrer" className="btn-line">
                LINEで友だち追加 <span>+</span>
              </a>
            </div>
          </div>
          <div className="lp-hero-vis">
            <div className="lp-hero-orb" />
            <ViBotAvatar size={300} />
            <div className="lp-hero-tag">"こんにちは、ヴィーチェです。"</div>
          </div>
        </div>
        <div className="lp-marquee" aria-hidden>
          <div className="lp-marquee-inner">
            <span>就業規則</span><span>·</span><span>シフトの相談</span><span>·</span>
            <span>制服のルール</span><span>·</span><span>給与日</span><span>·</span>
            <span>休憩時間</span><span>·</span><span>クレーム対応</span><span>·</span>
            <span>体調不良</span><span>·</span><span>SNSの注意</span><span>·</span>
            <span>有給</span><span>·</span><span>レジ運営</span><span>·</span>
            <span>Membr操作</span><span>·</span><span>よもぎ蒸し</span><span>·</span>
            <span>プロテイン</span><span>·</span><span>育休</span><span>·</span>
          </div>
        </div>
      </section>

      {/* 管理者向けバナー */}
      <section className="lp-admin-banner">
        <div className="lp-admin-banner-inner">
          <div className="lp-admin-banner-icon">📊</div>
          <div className="lp-admin-banner-text">
            <div className="lp-admin-banner-title">管理者の方へ</div>
            <div className="lp-admin-banner-desc">
              質問ログ・APIコスト・利用統計を 管理画面（GM Console）でリアルタイムに確認できます
            </div>
          </div>
          <Link href="/admin" className="lp-admin-banner-cta">
            管理画面を開く →
          </Link>
        </div>
      </section>

      {/* 01. ABOUT */}
      <section className="lp-section" id="about">
        <div className="section-num">01</div>
        <div className="section-label">ABOUT</div>
        <h2 className="serif">
          バイトの "これってアリ？" を、<br />全部受け止めるアバター。
        </h2>
        <div className="about-grid">
          <p className="about-text">
            ラ・ヴィーチェで働く高校生〜大学生のアルバイト・社員向けに、
            就業規則・服装ルール・シフトの相談など、業務にまつわる質問に
            <strong>規程・FAQ 計8本ベースで答えるAI先輩</strong>です。
            <br /><br />
            総務や店長に聞きづらい些細な疑問も、ヴィーチェさんになら気軽に聞ける。
            <strong>LINE公式アカウント</strong>と<strong>Web</strong>の両方で使えるので、
            通勤中・休憩中・夜中でもすぐ質問可能。
            <br /><br />
            「規定書、めくらない。」が合言葉。
          </p>
          <div className="about-stats">
            <div className="stat">
              <div className="stat-num">8<span className="stat-unit">本</span></div>
              <div className="stat-label">規程・FAQ収録</div>
            </div>
            <div className="stat">
              <div className="stat-num">24<span className="stat-unit">h</span></div>
              <div className="stat-label">いつでも答える</div>
            </div>
            <div className="stat">
              <div className="stat-num">100<span className="stat-unit">%</span></div>
              <div className="stat-label">出典付きの回答</div>
            </div>
          </div>
        </div>

        {/* 収録規程一覧 */}
        <div className="about-regs">
          <div className="about-regs-h">収録規程・FAQ</div>
          <div className="about-regs-grid">
            <div className="about-reg">001 就業規則</div>
            <div className="about-reg">002 給与規程</div>
            <div className="about-reg">003 パート・アルバイト就業規則</div>
            <div className="about-reg">004 育児介護休業規程</div>
            <div className="about-reg">005 慶弔見舞金規程</div>
            <div className="about-reg new">006 総務マニュアル</div>
            <div className="about-reg new">007 エニタイム業務FAQ</div>
            <div className="about-reg new">008 SOELU店舗運用FAQ</div>
          </div>
        </div>
      </section>

      {/* 02. FEATURES */}
      <section className="lp-section" id="features">
        <div className="section-num">02</div>
        <div className="section-label">FEATURES</div>
        <h2 className="serif">機能。</h2>
        <div className="feature-grid">
          <div className="feature">
            <div className="feature-num">F-01</div>
            <h3>出典付き回答</h3>
            <p>規程の◯条◯項に基づいて回答。あやふやな推測はしない。「書いてないから店長に聞いて」と正直に返す。</p>
          </div>
          <div className="feature">
            <div className="feature-num">F-02</div>
            <h3>アバター人格</h3>
            <p>無機質なチャットUIではなく、"ヴィーチェさん"という名前と顔がある先輩。聞くハードルが消える。</p>
          </div>
          <div className="feature">
            <div className="feature-num">F-03</div>
            <h3>LINE公式アカウント連携</h3>
            <p>LINEで「ラビーチェ」を友だち追加するだけ。インストール不要。バイト全員がすでに使っているLINEで完結。</p>
          </div>
          <div className="feature">
            <div className="feature-num">F-04</div>
            <h3>合言葉認証</h3>
            <p>友だち追加だけでは質問できない。店長から教えてもらった合言葉を入力した人だけが利用可能。</p>
          </div>
          <div className="feature">
            <div className="feature-num">F-05</div>
            <h3>店長エスカレ</h3>
            <p>規程にない質問は自動で「店長へ」誘導。判断が必要な領域は人間にバトンタッチ。</p>
          </div>
          <div className="feature">
            <div className="feature-num">F-06</div>
            <h3>管理ダッシュボード</h3>
            <p>質問ログ・APIコスト・利用統計をリアルタイム可視化。総務が改善ループを回せる。</p>
          </div>
          <div className="feature">
            <div className="feature-num">F-07</div>
            <h3>規程暗号化</h3>
            <p>規程データはAES-256-GCM暗号化で東京リージョン保管。漏洩しても復号不可。</p>
          </div>
          <div className="feature">
            <div className="feature-num">F-08</div>
            <h3>低コスト運用</h3>
            <p>RAG技術で1質問あたり約¥3.7。月1,000質問でも¥3,700。圧倒的に安い。</p>
          </div>
        </div>
      </section>

      {/* 03. HOW IT WORKS */}
      <section className="lp-section" id="flow">
        <div className="section-num">03</div>
        <div className="section-label">HOW IT WORKS</div>
        <h2 className="serif">使い方は、3ステップ。</h2>
        <div className="flow-grid">
          <div className="flow-card">
            <div className="flow-step">STEP 01</div>
            <div className="flow-icon">📱</div>
            <h3>LINEで友だち追加</h3>
            <p>店長から共有されたQRコードで「ラビーチェ」を友だち追加。インストール不要。</p>
          </div>
          <div className="flow-card">
            <div className="flow-step">STEP 02</div>
            <div className="flow-icon">🔑</div>
            <h3>合言葉を送信</h3>
            <p>店長から教えてもらった合言葉を入力して認証完了。一度認証すればずっと使える。</p>
          </div>
          <div className="flow-card">
            <div className="flow-step">STEP 03</div>
            <div className="flow-icon">💬</div>
            <h3>質問する</h3>
            <p>自由に質問を送るだけ。規程・FAQから出典付きで回答が返ってくる。</p>
          </div>
        </div>

        <div className="preview-wrap">
          <div className="preview-label">— 実際の応答例 —</div>
          <ChatBubblePreview />
        </div>
      </section>

      {/* 04. MEET */}
      <section className="lp-section meet" id="meet">
        <div className="section-num">04</div>
        <div className="section-label">MEET HER</div>
        <div className="meet-grid">
          <div className="meet-vis">
            <div className="meet-orb" />
            <ViBotAvatar size={280} />
          </div>
          <div className="meet-text">
            <div className="meet-name serif">ヴィーチェさん</div>
            <div className="meet-role">La Viche / 3年目スタッフ</div>
            <dl className="meet-profile">
              <div><dt>性格</dt><dd>親しみやすい先輩。敬語ベースだが堅すぎない口調。</dd></div>
              <div><dt>得意</dt><dd>就業規則・給与・シフト・服装・接客・レジ運営・Membr操作・SOELU設備など。</dd></div>
              <div><dt>苦手</dt><dd>規程にないこと。あやふやに答えず、すぐ店長に振る。</dd></div>
              <div><dt>口ぐせ</dt><dd>"ごめん、規程にはっきり書いてないから、店長に確認してみてね。"</dd></div>
              <div><dt>由来</dt><dd>"La Viche" の名前から。お客様にも、仲間にも、誠実に寄り添う存在。</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* 05. EFFECT */}
      <section className="lp-section effect" id="effect">
        <div className="section-num">05</div>
        <div className="section-label">EFFECT</div>
        <h2 className="serif">期待できる効果。</h2>
        <div className="effect-grid">
          <div className="effect-card">
            <div className="effect-icon">📉</div>
            <div className="effect-num">問い合わせ削減</div>
            <p>本部総務・店長にバイトから直接かかる問い合わせ件数を大幅に削減。</p>
          </div>
          <div className="effect-card">
            <div className="effect-icon">🛡️</div>
            <div className="effect-num">教育の均一化</div>
            <p>店舗ごとに違っていた "あいまいな運用" を、規程・FAQベースに揃える。</p>
          </div>
          <div className="effect-card">
            <div className="effect-icon">💛</div>
            <div className="effect-num">定着率の改善</div>
            <p>"聞きづらい" を解消し、新人バイトの最初の不安を取り除く。</p>
          </div>
          <div className="effect-card">
            <div className="effect-icon">📚</div>
            <div className="effect-num">規程の浸透</div>
            <p>誰もが規程・FAQを読まずに守れる状態。ルール改訂時もすぐ全員に届く。</p>
          </div>
          <div className="effect-card">
            <div className="effect-icon">💰</div>
            <div className="effect-num">圧倒的低コスト</div>
            <p>月¥3,000〜10,000で22店舗全員の「24時間先輩AI」が手に入る。</p>
          </div>
          <div className="effect-card">
            <div className="effect-icon">🌏</div>
            <div className="effect-num">マレーシア展開対応</div>
            <p>多言語化（英語・マレー語）に対応可能。海外進出時もそのまま使える。</p>
          </div>
        </div>
      </section>

      {/* 06. SPEC */}
      <section className="lp-section" id="spec">
        <div className="section-num">06</div>
        <div className="section-label">SPEC</div>
        <h2 className="serif">仕様。</h2>
        <div className="spec-grid">
          <div className="spec-row"><div className="spec-key">ベースAI</div><div className="spec-val">Claude Sonnet 4.5 + Haiku 4.5（Anthropic）</div></div>
          <div className="spec-row"><div className="spec-key">回答方式</div><div className="spec-val">RAG（関連章のみ抽出）／ 規程・FAQ 計8本</div></div>
          <div className="spec-row"><div className="spec-key">対応UI</div><div className="spec-val">LINE公式アカウント ／ Webブラウザ</div></div>
          <div className="spec-row"><div className="spec-key">認証</div><div className="spec-val">合言葉認証 ＋ LINE Login（メアド入力なし）</div></div>
          <div className="spec-row"><div className="spec-key">管理機能</div><div className="spec-val">質問ログ ／ APIコスト分析 ／ 円グラフ・棒グラフ ／ ホワイトリスト管理</div></div>
          <div className="spec-row"><div className="spec-key">対応言語</div><div className="spec-val">日本語（マレーシア展開時に英語・マレー語対応可）</div></div>
          <div className="spec-row"><div className="spec-key">データ管理</div><div className="spec-val">Supabase 東京リージョン ／ AES-256-GCM暗号化</div></div>
          <div className="spec-row"><div className="spec-key">セキュリティ</div><div className="spec-val">3層防御（合言葉認証 + パスワード + 暗号化）／ HMAC署名 ／ レート制限</div></div>
          <div className="spec-row"><div className="spec-key">運用コスト</div><div className="spec-val">インフラ¥0（Vercel + Supabase Free）／ AI料金のみ質問数比例</div></div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <div className="lp-cta-inner">
          <ViBotAvatar size={140} />
          <h2 className="serif">触ってみよう。</h2>
          <p>説明より、話しかけたほうが早いかもしれません。</p>
          <div className="lp-cta-btns">
            <Link href="/" className="btn-primary big">
              Webで話す <span>→</span>
            </Link>
            <a href="https://line.me/R/ti/p/@923fsjxp" target="_blank" rel="noreferrer" className="btn-line big">
              LINEで友だち追加 <span>+</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-grid">
          <div>
            <div className="serif lp-footer-logo">La Viche Concierge</div>
            <p className="lp-footer-desc">バイト・社員のための社内ルールAI先輩。<br />Vsw株式会社 開発。</p>
          </div>
          <div>
            <div className="lp-footer-h">サイトマップ</div>
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#flow">How it Works</a>
            <a href="#meet">Meet Her</a>
            <a href="#spec">Spec</a>
          </div>
          <div>
            <div className="lp-footer-h">体験</div>
            <Link href="/">Webアプリ</Link>
            <a href="https://line.me/R/ti/p/@923fsjxp" target="_blank" rel="noreferrer">LINEで追加</a>
            <Link href="/knowledge">規程ビューア</Link>
          </div>
          <div>
            <div className="lp-footer-h">管理者向け</div>
            <Link href="/admin">📊 管理画面（GM Console）</Link>
            <Link href="/status">プロジェクト現況</Link>
          </div>
          <div>
            <div className="lp-footer-h">規約類</div>
            <Link href="/terms">利用規約</Link>
            <Link href="/privacy">プライバシーポリシー</Link>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 La Viche / AMZ GROUP</span>
          <span>Designed & Built by Vsw Inc.</span>
        </div>
      </footer>
    </div>
  );
}
