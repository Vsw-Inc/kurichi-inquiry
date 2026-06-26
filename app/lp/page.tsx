import Link from "next/link";
import SplineHero from "./SplineHero";
import LeadForm from "./LeadForm";
import "./lp.css";

export const metadata = {
  title: "クリチちゃん Inquiry AI — お問い合わせはAIに任せる新時代",
  description: "NY発・大阪生まれのクリームチーズバーガー「#クリチ」公式のAI問い合わせコンシェルジュ。24時間自動応答＋営業連携。Vsw株式会社が提供。",
};

export default function LP() {
  return (
    <div className="ku">
      {/* HEADER */}
      <header className="ku-header">
        <div className="ku-logo">
          <span className="serif">#クリチ</span>
          <span className="ku-logo-sub">INQUIRY AI</span>
        </div>
        <nav className="ku-nav">
          <a href="#about">ABOUT</a>
          <a href="#features">FEATURES</a>
          <a href="#use-cases">USE CASES</a>
          <a href="#pricing">PRICING</a>
          <a href="#contact">CONTACT</a>
        </nav>
      </header>

      {/* HERO with Spline 3D */}
      <section className="ku-hero">
        <div className="ku-hero-grid">
          <div className="ku-hero-text">
            <div className="ku-eyebrow">― AI INQUIRY CONCIERGE</div>
            <h1 className="serif">
              お問い合わせは、<br />
              <em>クリチちゃん</em>に。
            </h1>
            <p className="ku-lead">
              NY発・大阪生まれのクリームチーズバーガー <strong>#クリチ</strong>。<br />
              店舗・メニュー・卸し・コラボのご相談に、<strong>24時間AIが即応答</strong>。<br />
              <small>by Vsw株式会社</small>
            </p>
            <div className="ku-hero-cta">
              <a href="https://line.me/R/ti/p/@552gvrkj" target="_blank" rel="noreferrer" className="ku-btn-line">
                LINEで友だち追加 <span>+</span>
              </a>
              <a href="#contact" className="ku-btn-primary">
                お問い合わせフォーム <span>→</span>
              </a>
              <a href="#about" className="ku-btn-ghost">
                サービス詳細 ↓
              </a>
            </div>
          </div>
          <div className="ku-hero-vis">
            <SplineHero />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="ku-section" id="about">
        <div className="ku-section-num">01</div>
        <div className="ku-section-label">ABOUT</div>
        <h2 className="serif">クリチちゃん、<br />お客様の疑問に答えます。</h2>
        <div className="ku-about-grid">
          <p className="ku-about-text">
            「営業時間は？」「卸しの相談は？」「移動販売の予定は？」<br />
            ─ そんなお問い合わせ、これからは<strong>クリチちゃん</strong>が答えます。
            <br /><br />
            #クリチ公式サイト・SNSプロフィール・LINEから24時間アクセス可能。
            よくある質問は即答、複雑な相談は営業担当へ自動引き継ぎ。
            <br /><br />
            お客様の疑問解決スピードが<strong>10倍</strong>、営業効率は<strong>3倍</strong>に。
          </p>
          <div className="ku-about-stats">
            <div className="ku-stat">
              <div className="ku-stat-num">24<em>h</em></div>
              <div className="ku-stat-label">いつでも答える</div>
            </div>
            <div className="ku-stat">
              <div className="ku-stat-num">30<em>秒</em></div>
              <div className="ku-stat-label">平均応答時間</div>
            </div>
            <div className="ku-stat">
              <div className="ku-stat-num">¥0<em></em></div>
              <div className="ku-stat-label">お客様の利用料</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="ku-section" id="features">
        <div className="ku-section-num">02</div>
        <div className="ku-section-label">FEATURES</div>
        <h2 className="serif">機能。</h2>
        <div className="ku-feature-grid">
          <div className="ku-feature">
            <div className="ku-feature-icon">💬</div>
            <h3>24時間自動応答</h3>
            <p>営業時間外でもクリチちゃんが即対応。お客様を待たせない。</p>
          </div>
          <div className="ku-feature">
            <div className="ku-feature-icon">🎯</div>
            <h3>出典付き正確回答</h3>
            <p>製品情報・店舗情報・価格・FAQに基づいて答える。あいまいな返答ナシ。</p>
          </div>
          <div className="ku-feature">
            <div className="ku-feature-icon">📨</div>
            <h3>営業自動引き継ぎ</h3>
            <p>卸し・コラボ・取材依頼など重要案件は営業担当に即通知。</p>
          </div>
          <div className="ku-feature">
            <div className="ku-feature-icon">🌐</div>
            <h3>マルチデバイス</h3>
            <p>Web・LINE・SNSプロフィールから。お客様はどこからでも質問可能。</p>
          </div>
          <div className="ku-feature">
            <div className="ku-feature-icon">📊</div>
            <h3>問い合わせ分析</h3>
            <p>「何を聞かれたか」を可視化。商品改善・販促に活用できる。</p>
          </div>
          <div className="ku-feature">
            <div className="ku-feature-icon">🔐</div>
            <h3>セキュアな国内保管</h3>
            <p>会話データはSupabase東京リージョン。AES-256暗号化で安心。</p>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="ku-section" id="use-cases">
        <div className="ku-section-num">03</div>
        <div className="ku-section-label">USE CASES</div>
        <h2 className="serif">こんな質問に。</h2>
        <div className="ku-case-grid">
          <div className="ku-case">
            <div className="ku-case-q">「店舗どこですか？」</div>
            <div className="ku-case-a">→ 大阪・東京・横浜オフィスの所在地を即回答。Googleマップリンクも提示。</div>
          </div>
          <div className="ku-case">
            <div className="ku-case-q">「卸し相談したいです」</div>
            <div className="ku-case-a">→ 担当窓口を案内、お問い合わせフォームへ誘導 + 営業に即通知。</div>
          </div>
          <div className="ku-case">
            <div className="ku-case-q">「次のイベント出店は？」</div>
            <div className="ku-case-a">→ 出店スケジュールを確認、最新情報を回答。</div>
          </div>
          <div className="ku-case">
            <div className="ku-case-q">「メニューと価格は？」</div>
            <div className="ku-case-a">→ 全メニュー・価格・カロリーを正確に提示。</div>
          </div>
          <div className="ku-case">
            <div className="ku-case-q">「コラボ提案したいです」</div>
            <div className="ku-case-a">→ ヒアリング後、貴社情報を取得→クリチ営業へ自動通知。</div>
          </div>
          <div className="ku-case">
            <div className="ku-case-q">「取材したいです」</div>
            <div className="ku-case-a">→ メディア対応窓口・必要情報を案内、PR担当へエスカレ。</div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="ku-section" id="pricing">
        <div className="ku-section-num">04</div>
        <div className="ku-section-label">PRICING</div>
        <h2 className="serif">料金プラン。</h2>
        <p className="ku-pricing-lead">
          他社様への提供も可能です。<br />
          飲食店・ブランド企業のお問い合わせ業務をAIで完全自動化。
        </p>
        <div className="ku-pricing-grid">
          <div className="ku-pricing">
            <div className="ku-pricing-tier">スターター</div>
            <div className="ku-pricing-target">単店舗・1ブランド</div>
            <div className="ku-pricing-price">
              ¥20<em>万</em><span>初期</span>
              <br />
              + ¥2<em>万</em><span>/月</span>
            </div>
            <ul className="ku-pricing-features">
              <li>Web/LINE Bot 1チャネル</li>
              <li>製品・FAQ 5件まで投入</li>
              <li>月1,000問合せまで</li>
              <li>Slack/メール通知連携</li>
              <li>3ヶ月運用サポート</li>
            </ul>
          </div>
          <div className="ku-pricing featured">
            <div className="ku-pricing-badge">人気</div>
            <div className="ku-pricing-tier">プロ</div>
            <div className="ku-pricing-target">複数店舗・複数ブランド</div>
            <div className="ku-pricing-price">
              ¥50<em>万</em><span>初期</span>
              <br />
              + ¥5<em>万</em><span>/月</span>
            </div>
            <ul className="ku-pricing-features">
              <li>Web/LINE Bot 複数チャネル</li>
              <li>製品・FAQ 無制限投入</li>
              <li>月5,000問合せまで</li>
              <li>CRM連携 (HubSpot/Salesforce等)</li>
              <li>多言語対応 (英語・中国語等)</li>
              <li>24/7 サポート</li>
            </ul>
          </div>
          <div className="ku-pricing">
            <div className="ku-pricing-tier">エンタープライズ</div>
            <div className="ku-pricing-target">大規模・特殊要件</div>
            <div className="ku-pricing-price">
              <span>別途見積</span>
            </div>
            <ul className="ku-pricing-features">
              <li>カスタムAIモデル選定</li>
              <li>SSO連携</li>
              <li>大量データ・高速応答</li>
              <li>専属開発チーム</li>
              <li>SLA保証</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="ku-section ku-contact" id="contact">
        <div className="ku-section-num">05</div>
        <div className="ku-section-label">CONTACT</div>
        <h2 className="serif">お問い合わせ。</h2>
        <p className="ku-contact-lead">
          クリチちゃん（LINE）に直接話しかけるか、フォームからお問い合わせください。<br />
          貴社サービス導入のご相談も承ります。
        </p>

        <div className="ku-contact-line">
          <div className="ku-contact-line-info">
            <div className="ku-contact-line-h">💬 LINEで気軽に話しかける</div>
            <div className="ku-contact-line-desc">
              クリチ公式LINEに友だち追加して、クリチちゃんに何でも聞いてみてください🍔<br />
              <small>アカウント：<code>@552gvrkj</code></small>
            </div>
          </div>
          <a
            href="https://line.me/R/ti/p/@552gvrkj"
            target="_blank"
            rel="noreferrer"
            className="ku-btn-line big"
          >
            LINEで友だち追加 <span>+</span>
          </a>
        </div>

        <div className="ku-contact-or">― または、フォームから ―</div>
        <LeadForm />
      </section>

      {/* FOOTER */}
      <footer className="ku-footer">
        <div className="ku-footer-grid">
          <div>
            <div className="serif ku-footer-logo">#クリチ Inquiry AI</div>
            <p className="ku-footer-desc">
              NY発・大阪生まれの<br />
              クリームチーズバーガー<br />
              by Vsw株式会社
            </p>
          </div>
          <div>
            <div className="ku-footer-h">サービス</div>
            <a href="#about">サービス概要</a>
            <a href="#features">機能</a>
            <a href="#pricing">料金</a>
          </div>
          <div>
            <div className="ku-footer-h">リンク</div>
            <a href="https://vsw.co.jp" target="_blank" rel="noreferrer">Vsw株式会社 ↗</a>
            <Link href="/privacy">プライバシー</Link>
            <Link href="/terms">利用規約</Link>
          </div>
          <div>
            <div className="ku-footer-h">お問い合わせ</div>
            <a href="https://line.me/R/ti/p/@552gvrkj" target="_blank" rel="noreferrer">💬 LINEで聞く</a>
            <a href="#contact">フォーム</a>
            <a href="https://vsw.co.jp" target="_blank" rel="noreferrer">Vsw公式 ↗</a>
          </div>
        </div>
        <div className="ku-footer-bottom">
          <span>© 2026 Vsw株式会社</span>
          <span>#クリチ Inquiry AI</span>
        </div>
      </footer>
    </div>
  );
}
