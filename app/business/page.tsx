import Link from "next/link";
import "./business.css";

export const metadata = {
  title: "Vsw AI事業 — 社内Q&A 先輩AIサービス",
  description: "LINE Bot + Web + 管理画面で「現場の問い合わせ」をAIで解決。スタンダード¥30万〜・1週間納品。",
};

export default function BusinessPage() {
  return (
    <div className="biz">
      {/* HEADER */}
      <header className="biz-header">
        <div className="biz-logo">
          <span className="serif">Vsw</span>
          <span className="biz-logo-sub">AI BUSINESS</span>
        </div>
        <nav className="biz-nav">
          <a href="#service">SERVICE</a>
          <a href="#industries">INDUSTRIES</a>
          <a href="#pricing">PRICING</a>
          <a href="#cases">CASES</a>
          <a href="#contact">CONTACT</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="biz-hero">
        <div className="biz-hero-text">
          <div className="biz-eyebrow">― AI CONCIERGE FOR YOUR COMPANY</div>
          <h1 className="serif">
            社内の「これってどうすれば？」を、<br />
            <em>LINEで30秒</em>で解決。
          </h1>
          <p className="biz-lead">
            就業規則・接客マニュアル・FAQを読んで、24時間答えるAI先輩。<br />
            22店舗の実稼働実績ベース、<strong>1週間で導入可能</strong>。
          </p>
          <div className="biz-hero-stats">
            <div className="biz-stat">
              <div className="biz-stat-num">¥30<em>万</em></div>
              <div className="biz-stat-label">初期費用〜</div>
            </div>
            <div className="biz-stat">
              <div className="biz-stat-num">¥3.7<em>/質問</em></div>
              <div className="biz-stat-label">AIコスト</div>
            </div>
            <div className="biz-stat">
              <div className="biz-stat-num">7<em>日</em></div>
              <div className="biz-stat-label">導入完了</div>
            </div>
          </div>
          <div className="biz-hero-cta">
            <a href="#contact" className="biz-btn-primary">
              無料デモ依頼 <span>→</span>
            </a>
            <Link href="https://laviche-concierge.vercel.app/lp" target="_blank" className="biz-btn-ghost">
              実機デモを見る ↗
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICE */}
      <section className="biz-section" id="service">
        <div className="biz-section-num">01</div>
        <div className="biz-section-label">SERVICE</div>
        <h2 className="serif">
          サービス概要。
        </h2>
        <div className="biz-service-grid">
          <div className="biz-feature">
            <div className="biz-feature-icon">💬</div>
            <h3>LINE公式アカウント</h3>
            <p>バイト・社員が普段使うLINEで質問。インストール不要、合言葉認証で部外者ブロック。</p>
          </div>
          <div className="biz-feature">
            <div className="biz-feature-icon">🌐</div>
            <h3>Webアプリ</h3>
            <p>ブラウザでも使える。LINEが苦手な世代も同じ体験。</p>
          </div>
          <div className="biz-feature">
            <div className="biz-feature-icon">📚</div>
            <h3>RAG技術</h3>
            <p>規程・FAQから関連章だけ抽出。出典付きで正確に回答。誤情報リスク最小化。</p>
          </div>
          <div className="biz-feature">
            <div className="biz-feature-icon">📊</div>
            <h3>管理ダッシュボード</h3>
            <p>質問ログ・APIコスト・ユーザー一覧をリアルタイム可視化。改善ループが回せる。</p>
          </div>
          <div className="biz-feature">
            <div className="biz-feature-icon">🔐</div>
            <h3>3層セキュリティ</h3>
            <p>合言葉認証 + パスワード + AES-256暗号化。退職者は管理画面でワンクリックブロック。</p>
          </div>
          <div className="biz-feature">
            <div className="biz-feature-icon">🇯🇵</div>
            <h3>国内データ保管</h3>
            <p>Supabase東京リージョン。AIはAnthropic Claude（学習に使わない規約）。</p>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="biz-section" id="industries">
        <div className="biz-section-num">02</div>
        <div className="biz-section-label">INDUSTRIES</div>
        <h2 className="serif">
          業種別の導入事例。
        </h2>
        <div className="biz-industry-grid">
          <div className="biz-industry">
            <div className="biz-industry-icon">💪</div>
            <h3>フィットネス</h3>
            <p>会員管理・接客・設備対応・SOELU運用</p>
            <span className="biz-industry-ref">✓ ラ・ヴィーチェ実装中</span>
          </div>
          <div className="biz-industry">
            <div className="biz-industry-icon">💆</div>
            <h3>美容・サロン</h3>
            <p>接客カウンセリング・薬剤・SNS投稿ルール</p>
            <span className="biz-industry-ref">テンプレ提供</span>
          </div>
          <div className="biz-industry">
            <div className="biz-industry-icon">🍴</div>
            <h3>飲食店</h3>
            <p>食品衛生・接客・キッチンオペ・クレーム</p>
            <span className="biz-industry-ref">テンプレ提供</span>
          </div>
          <div className="biz-industry">
            <div className="biz-industry-icon">👴</div>
            <h3>介護施設</h3>
            <p>介護記録・服薬・感染症対策・緊急時対応</p>
            <span className="biz-industry-ref">テンプレ提供</span>
          </div>
          <div className="biz-industry">
            <div className="biz-industry-icon">🏗</div>
            <h3>建設業</h3>
            <p>KY活動・安全衛生・労災対応・近隣対応</p>
            <span className="biz-industry-ref">テンプレ提供</span>
          </div>
          <div className="biz-industry">
            <div className="biz-industry-icon">🛍</div>
            <h3>小売・専門店</h3>
            <p>接客・レジ操作・返品・在庫管理</p>
            <span className="biz-industry-ref">テンプレ提供</span>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="biz-section" id="pricing">
        <div className="biz-section-num">03</div>
        <div className="biz-section-label">PRICING</div>
        <h2 className="serif">料金プラン。</h2>
        <div className="biz-pricing-grid">
          <div className="biz-pricing">
            <div className="biz-pricing-tier">スタンダード</div>
            <div className="biz-pricing-target">1〜50店舗</div>
            <div className="biz-pricing-price">
              ¥30<em>万</em><span>初期</span>
              <br />
              + ¥3<em>万</em><span>/月</span>
            </div>
            <ul className="biz-pricing-features">
              <li>LINE Bot 1チャネル</li>
              <li>Web版チャットアプリ</li>
              <li>規程ビューア</li>
              <li>管理ダッシュボード</li>
              <li>規程・FAQ 5本まで投入</li>
              <li>ブランディング基本</li>
              <li>3ヶ月運用サポート</li>
            </ul>
          </div>
          <div className="biz-pricing featured">
            <div className="biz-pricing-badge">人気</div>
            <div className="biz-pricing-tier">エンタープライズ</div>
            <div className="biz-pricing-target">50店舗超 / 業種特化</div>
            <div className="biz-pricing-price">
              ¥100<em>万</em><span>初期</span>
              <br />
              + ¥10<em>万</em><span>/月</span>
            </div>
            <ul className="biz-pricing-features">
              <li>LINE Bot 2チャネル（社内+採用 等）</li>
              <li>カスタムドメイン</li>
              <li>業種特化機能の開発</li>
              <li>月次レポート</li>
              <li>規程・FAQ 無制限投入</li>
              <li>24/7 サポート</li>
              <li>多店舗ダッシュボード</li>
            </ul>
          </div>
          <div className="biz-pricing">
            <div className="biz-pricing-tier">カスタム</div>
            <div className="biz-pricing-target">大規模 / 特殊要件</div>
            <div className="biz-pricing-price">
              <span>別途見積</span>
            </div>
            <ul className="biz-pricing-features">
              <li>多言語対応（英・中・越・etc）</li>
              <li>音声入出力</li>
              <li>SSO（Entra / Google Workspace）</li>
              <li>マルチテナント環境</li>
              <li>独自AIモデル切替</li>
            </ul>
          </div>
        </div>
        <p className="biz-pricing-note">
          ※ AI API実費は別途実費 + 管理手数料20%（月¥3,000〜10,000程度）
        </p>
      </section>

      {/* CASES */}
      <section className="biz-section" id="cases">
        <div className="biz-section-num">04</div>
        <div className="biz-section-label">CASES</div>
        <h2 className="serif">導入事例。</h2>
        <div className="biz-case">
          <div className="biz-case-header">
            <div>
              <div className="biz-case-name">株式会社ラ・ヴィーチェ</div>
              <div className="biz-case-meta">AMZ GROUP / フィットネスクラブ運営 / 22店舗</div>
            </div>
            <div className="biz-case-tag">2026年5月導入</div>
          </div>
          <div className="biz-case-stats">
            <div className="biz-case-stat">
              <div className="biz-case-num">22<em>店舗</em></div>
              <div className="biz-case-lbl">全店展開</div>
            </div>
            <div className="biz-case-stat">
              <div className="biz-case-num">200<em>名+</em></div>
              <div className="biz-case-lbl">利用者数</div>
            </div>
            <div className="biz-case-stat">
              <div className="biz-case-num">8<em>本</em></div>
              <div className="biz-case-lbl">規程・FAQ</div>
            </div>
            <div className="biz-case-stat">
              <div className="biz-case-num">60<em>%減</em></div>
              <div className="biz-case-lbl">問い合わせ削減</div>
            </div>
          </div>
          <p className="biz-case-quote">
            "いままで電話で来ていた質問が大幅に減って、店長が本来の業務に集中できるようになった。"
            <br /><span>― 営業統括部長</span>
          </p>
          <Link href="https://laviche-concierge.vercel.app/lp" target="_blank" className="biz-case-link">
            実機を見る ↗
          </Link>
        </div>
      </section>

      {/* PROCESS */}
      <section className="biz-section" id="process">
        <div className="biz-section-num">05</div>
        <div className="biz-section-label">PROCESS</div>
        <h2 className="serif">導入の流れ。</h2>
        <div className="biz-process">
          <div className="biz-process-step">
            <div className="biz-process-num">DAY 1</div>
            <h3>ヒアリング</h3>
            <p>業種・店舗数・規程の量を確認。デモを見せながら方針すり合わせ。</p>
          </div>
          <div className="biz-process-step">
            <div className="biz-process-num">DAY 2-3</div>
            <h3>データ準備</h3>
            <p>規程・FAQを受領、AIが読める形に整形。ブランディング素材も収集。</p>
          </div>
          <div className="biz-process-step">
            <div className="biz-process-num">DAY 4-5</div>
            <h3>セットアップ</h3>
            <p>LINE Bot・Supabase・Vercel構築。カスタムドメイン取得（オプション）。</p>
          </div>
          <div className="biz-process-step">
            <div className="biz-process-num">DAY 6</div>
            <h3>テスト</h3>
            <p>社内パイロット店舗で先行運用。フィードバック収集。</p>
          </div>
          <div className="biz-process-step">
            <div className="biz-process-num">DAY 7</div>
            <h3>リリース</h3>
            <p>全店ロールアウト。スタッフへLINE友だち追加案内。</p>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="biz-section biz-contact" id="contact">
        <div className="biz-section-num">06</div>
        <div className="biz-section-label">CONTACT</div>
        <h2 className="serif">無料デモのお申込み。</h2>
        <p className="biz-contact-lead">
          ZOOMまたは対面で 30分のデモを承ります。<br />
          実際のLINE Botを触っていただきながら、貴社向けの導入イメージを具体化します。
        </p>
        <div className="biz-contact-grid">
          <div className="biz-contact-card">
            <div className="biz-contact-h">💼 担当</div>
            <div className="biz-contact-v">
              <strong>菊地 俊雄</strong>
              <br />
              Vsw株式会社 AI事業
            </div>
          </div>
          <div className="biz-contact-card">
            <div className="biz-contact-h">📧 連絡先</div>
            <div className="biz-contact-v">
              LINEで友だち追加または<br />
              既存ご担当者経由でご連絡ください
            </div>
          </div>
          <div className="biz-contact-card">
            <div className="biz-contact-h">⏱ レスポンス</div>
            <div className="biz-contact-v">
              通常 1営業日以内<br />
              急ぎの場合はLINEでお伝えください
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="biz-footer">
        <div className="biz-footer-grid">
          <div>
            <div className="serif biz-footer-logo">Vsw AI Business</div>
            <p className="biz-footer-desc">
              社内の「これってどうすれば？」を解決する<br />
              次世代のSaaS型 先輩AI。
            </p>
          </div>
          <div>
            <div className="biz-footer-h">サービス</div>
            <a href="#service">サービス概要</a>
            <a href="#industries">業種別</a>
            <a href="#pricing">料金</a>
            <a href="#cases">事例</a>
          </div>
          <div>
            <div className="biz-footer-h">リソース</div>
            <Link href="https://laviche-concierge.vercel.app/lp" target="_blank">実機デモ ↗</Link>
            <Link href="/privacy">プライバシー</Link>
            <Link href="/terms">利用規約</Link>
          </div>
          <div>
            <div className="biz-footer-h">お問い合わせ</div>
            <a href="#contact">デモ依頼</a>
            <Link href="/">トップ</Link>
          </div>
        </div>
        <div className="biz-footer-bottom">
          <span>© 2026 Vsw Inc.</span>
          <span>AI Business Division</span>
        </div>
      </footer>
    </div>
  );
}
