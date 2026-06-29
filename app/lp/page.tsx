import Link from "next/link";
import KurichiHero from "./KurichiHero";
import LeadForm from "./LeadForm";
import "./lp.css";

const lineUrl = "https://line.me/R/ti/p/@552gvrkj";

const capabilities = [
  {
    label: "Answer",
    title: "よくある質問はその場で回答",
    text: "商品、食べ方、保存方法、イベント出店などをナレッジに沿って案内します。",
  },
  {
    label: "Lead",
    title: "商談になりそうな相談を取得",
    text: "卸し、コラボ、取材、法人相談は必要項目を聞き取り、担当者につなぎます。",
  },
  {
    label: "Update",
    title: "新情報を反映しやすい運用",
    text: "メニューや出店情報が変わっても、FAQとナレッジを更新して回答品質を保ちます。",
  },
  {
    label: "Report",
    title: "問い合わせ傾向を次の施策へ",
    text: "何を聞かれているかを把握し、商品説明、SNS投稿、販促導線の改善に使えます。",
  },
];

const useCases = [
  ["購入前の質問", "食べ方、保存方法、賞味目安、フレーバーの違いを即案内"],
  ["イベント・出店確認", "販売場所や今後の出店情報を案内し、最新情報へ誘導"],
  ["卸し・取引相談", "会社名、数量感、希望時期を聞き取り、営業担当へ通知"],
  ["コラボ・取材依頼", "企画概要や媒体情報を整理して、対応しやすい状態で引き継ぎ"],
];

const steps = [
  ["01", "ナレッジ整理", "#クリチの商品情報、FAQ、問い合わせ導線をAI用に整備"],
  ["02", "LINE / Web連携", "ユーザーが普段使う接点から、すぐ質問できる状態を作成"],
  ["03", "営業通知", "重要な相談だけをフォーム・通知経由で担当者へエスカレーション"],
  ["04", "改善運用", "問い合わせログを見ながら、回答とLP・SNS導線を継続改善"],
];

export const metadata = {
  title: "#クリチ Inquiry AI | LINE問い合わせをAIで自動対応",
  description:
    "#クリチ公式LINEの問い合わせにAIが24時間対応。商品FAQ、イベント案内、卸し・コラボ・取材相談のリード獲得まで支援します。Vsw株式会社が提供。",
};

export default function LP() {
  return (
    <div className="ku">
      <header className="ku-header">
        <a className="ku-logo" href="#top" aria-label="#クリチ Inquiry AI トップへ">
          <span className="serif">#クリチ</span>
          <span className="ku-logo-sub">INQUIRY AI</span>
        </a>
        <nav className="ku-nav" aria-label="ページ内ナビゲーション">
          <a href="#demo">DEMO</a>
          <a href="#design">DESIGN</a>
          <a href="#features">FEATURES</a>
          <a href="#flow">FLOW</a>
          <a href="#pricing">PRICING</a>
        </nav>
        <a href="#contact" className="ku-header-cta">
          相談する
        </a>
      </header>

      <main id="top">
        <section className="ku-hero">
          <div className="ku-hero-grid">
            <div className="ku-hero-text">
              <div className="ku-eyebrow">KURICHI OFFICIAL AI CONCIERGE</div>
              <h1 className="serif">
                LINEで聞かれること、<br />
                <em>クリチちゃん</em>が先に答える。
              </h1>
              <p className="ku-lead-copy">
                #クリチの購入前質問から、卸し・コラボ・取材相談まで。
                24時間AIが一次対応し、商談につながる問い合わせだけを担当者へ渡します。
              </p>

              <div className="ku-hero-actions" aria-label="主要アクション">
                <a href={lineUrl} target="_blank" rel="noreferrer" className="ku-btn-line">
                  LINEで試す <span aria-hidden>+</span>
                </a>
                <a href="#contact" className="ku-btn-primary">
                  導入を相談する <span aria-hidden>→</span>
                </a>
              </div>

              <div className="ku-hero-notes" aria-label="対応内容">
                <span>商品FAQ</span>
                <span>イベント案内</span>
                <span>卸し相談</span>
                <span>取材依頼</span>
              </div>
            </div>

            <div className="ku-hero-vis" aria-label="クリチちゃんビジュアル">
              <KurichiHero />
            </div>
          </div>

          <div className="ku-proof-strip" aria-label="サービスの特徴">
            <div>
              <strong>24時間</strong>
              <span>LINE / Webから受付</span>
            </div>
            <div>
              <strong>FAQ連携</strong>
              <span>ブランド情報に沿って回答</span>
            </div>
            <div>
              <strong>営業通知</strong>
              <span>重要相談を自動引き継ぎ</span>
            </div>
          </div>
        </section>

        <section className="ku-section ku-demo" id="demo">
          <div className="ku-demo-grid">
            <div className="ku-demo-copy">
              <div className="ku-section-kicker">SMARTPHONE DEMO</div>
              <h2 className="serif">スマホで見ると、こんな会話になります。</h2>
              <p>
                一般のお客様には食べ方や購入前の不安をその場で案内。卸しや取材のような重要相談は、必要情報を聞き取って担当者へ渡します。
              </p>
              <div className="ku-demo-points">
                <span>購入前の質問に即回答</span>
                <span>法人相談を自動判定</span>
                <span>担当者へ引き継ぎ</span>
              </div>
              <a href={lineUrl} target="_blank" rel="noreferrer" className="ku-btn-line">
                LINEで実際に試す <span aria-hidden>+</span>
              </a>
            </div>

            <div className="ku-demo-phones" aria-label="スマホでのLINEデモ画面">
              <div className="ku-phone" aria-label="一般のお客様向けLINEデモ画面">
                <div className="ku-phone-speaker" aria-hidden />
                <div className="ku-phone-screen">
                  <div className="ku-chat-head">
                    <div className="ku-chat-avatar">ク</div>
                    <div>
                      <strong>一般のお客様</strong>
                      <span>商品FAQ / 来店前相談</span>
                    </div>
                  </div>

                  <div className="ku-chat-body">
                    <div className="ku-chat-date">TODAY 10:24</div>
                    <div className="ku-bubble user">冷凍のまま食べられますか？</div>
                    <div className="ku-bubble bot">
                      はい。冷凍のままだとアイスサンドのように、常温で約20分置くとなめらかなチーズケーキ感で楽しめます。
                    </div>
                    <div className="ku-bubble user">どの味が人気ですか？</div>
                    <div className="ku-bubble bot">
                      はじめてならプレーン系やNY#クリチがおすすめです。イベントや時期によって販売ラインナップが変わるため、最新情報も案内します。
                    </div>
                    <div className="ku-chat-card">
                      <span>Customer support</span>
                      <strong>購入前の不安を解消</strong>
                      <p>食べ方・保存方法・販売情報へ案内</p>
                    </div>
                  </div>

                  <div className="ku-chat-input">
                    <span>質問を入力...</span>
                    <button type="button" aria-label="送信">↑</button>
                  </div>
                </div>
              </div>

              <div className="ku-phone" aria-label="法人相談向けLINEデモ画面">
                <div className="ku-phone-speaker" aria-hidden />
                <div className="ku-phone-screen">
                  <div className="ku-chat-head">
                    <div className="ku-chat-avatar">ク</div>
                    <div>
                      <strong>法人相談</strong>
                      <span>卸し / 取材 / コラボ</span>
                    </div>
                  </div>

                  <div className="ku-chat-body">
                    <div className="ku-chat-date">TODAY 10:28</div>
                    <div className="ku-bubble user">卸し相談もできますか？</div>
                    <div className="ku-bubble bot">
                      できます。会社名、希望数量、導入時期を教えていただければ、担当者に引き継ぎます。
                    </div>
                    <div className="ku-bubble user">イベント販売も相談したいです</div>
                    <div className="ku-bubble bot">
                      ありがとうございます。開催日、場所、来場者数の目安を確認して、担当者へ共有します。
                    </div>
                    <div className="ku-chat-card">
                      <span>Lead captured</span>
                      <strong>卸し・イベント相談</strong>
                      <p>営業担当へ通知準備</p>
                    </div>
                  </div>

                  <div className="ku-chat-input">
                    <span>質問を入力...</span>
                    <button type="button" aria-label="送信">↑</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ku-section ku-about" id="about">
          <div className="ku-section-kicker">ABOUT</div>
          <div className="ku-section-head">
            <h2 className="serif">問い合わせ対応を、ブランド体験に変える。</h2>
            <p>
              お客様は待たずに知りたいことへたどり着き、スタッフは重要な相談に集中できる。
              #クリチ Inquiry AIは、公式LINEとWebを問い合わせの入口にして、ブランドらしい会話で案内します。
            </p>
          </div>

          <div className="ku-split-grid">
            <div className="ku-panel ku-before">
              <span>Before</span>
              <h3>問い合わせが分散して、対応が後手になる</h3>
              <ul>
                <li>SNS、LINE、フォームで同じ質問が繰り返される</li>
                <li>営業時間外の質問にすぐ返せない</li>
                <li>卸しや取材の相談が通常質問に埋もれる</li>
              </ul>
            </div>
            <div className="ku-panel ku-after">
              <span>After</span>
              <h3>AIが一次対応し、必要な相談だけ人へ渡す</h3>
              <ul>
                <li>よくある質問は24時間その場で解決</li>
                <li>ナレッジに沿って、言い回しまでブランドらしく回答</li>
                <li>商談化しそうな相談をフォーム・通知へ誘導</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="ku-section ku-design" id="design">
          <div className="ku-section-kicker">DESIGN</div>
          <div className="ku-section-head">
            <h2 className="serif">FAQ Botではなく、<br />問い合わせAIとして設計。</h2>
            <p>
              #クリチ Inquiry AI は、商品情報・FAQ・ブランド情報を整理した <strong>RAGナレッジ</strong> をもとに回答します。
              さらに <strong>会話記憶</strong> で前回の相談を踏まえ、卸し・取材・コラボなど商談化しそうな問い合わせは <strong>担当者に自動引き継ぎ</strong>します。
            </p>
          </div>

          <div className="ku-design-grid">
            <article className="ku-design-card">
              <div className="ku-design-num">01</div>
              <h3>RAGナレッジ回答</h3>
              <p>
                商品・食べ方・保存方法・販売情報・ブランド情報を構造化。
                公式情報に沿った、ブランドらしい言い回しで自動回答。
              </p>
              <ul>
                <li>商品ごとの説明・フレーバー差を区別</li>
                <li>未確定情報は断定せず、確認に回す</li>
                <li>出典つきで根拠を残す</li>
              </ul>
            </article>

            <article className="ku-design-card featured">
              <div className="ku-design-num">02</div>
              <h3>会話記憶</h3>
              <p>
                LINE ユーザーごとに「興味・希望数量・前回の話題」など要点だけを保存。
                再訪時に「前回のご相談、続きですか？」と自然に踏まえて返せる。
              </p>
              <ul>
                <li>個人情報を不自然に並べない</li>
                <li>要約のみ保存（全文ログとは別管理）</li>
                <li>担当者引き継ぎ中フラグも保持</li>
              </ul>
            </article>

            <article className="ku-design-card">
              <div className="ku-design-num">03</div>
              <h3>有人引き継ぎ</h3>
              <p>
                卸し・取材・コラボ・クレーム・アレルギー詳細など、AIで完結させない方がよい相談を自動検知。
                不足情報を聞き取り、担当者通知をSlackやメールで届けます。
              </p>
              <ul>
                <li>カテゴリ・優先度を分類</li>
                <li>会社名・希望数量など不足項目を自然に質問</li>
                <li>担当者通知用の要約を生成</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="ku-section" id="features">
          <div className="ku-section-kicker">FEATURES</div>
          <div className="ku-section-head">
            <h2 className="serif">できること。</h2>
            <p>
              単なる自動返信ではなく、問い合わせを整理し、次の売上やPRにつながる状態で受け取れる仕組みです。
            </p>
          </div>

          <div className="ku-feature-grid">
            {capabilities.map((item) => (
              <article className="ku-feature" key={item.title}>
                <div className="ku-feature-label">{item.label}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ku-section ku-use-cases" id="use-cases">
          <div className="ku-section-kicker">USE CASES</div>
          <div className="ku-section-head">
            <h2 className="serif">来店前の質問も、法人相談も。</h2>
            <p>
              #クリチを知りたい人にはすぐ答え、ビジネスにつながる相談は取りこぼさない導線にします。
            </p>
          </div>

          <div className="ku-case-grid">
            {useCases.map(([title, text]) => (
              <article className="ku-case" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ku-section" id="flow">
          <div className="ku-section-kicker">FLOW</div>
          <div className="ku-section-head">
            <h2 className="serif">公開して終わりにしない導入フロー。</h2>
            <p>
              商品情報の整理から公開後の改善まで、問い合わせが増えても運用しやすい形で設計します。
            </p>
          </div>

          <div className="ku-step-list">
            {steps.map(([num, title, text]) => (
              <article className="ku-step" key={num}>
                <span>{num}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="ku-section" id="pricing">
          <div className="ku-section-kicker">PRICING</div>
          <div className="ku-section-head centered">
            <h2 className="serif">料金プラン。</h2>
            <p>
              #クリチで構築した問い合わせAIの仕組みは、飲食店・ブランド企業向けにも展開できます。
            </p>
          </div>

          <div className="ku-pricing-grid">
            <article className="ku-pricing">
              <div className="ku-pricing-tier">STARTER</div>
              <h3>スターター</h3>
              <p>単店舗・1ブランド向け</p>
              <div className="ku-pricing-price">
                ¥20<em>万</em><span>初期</span>
                <br />
                + ¥2<em>万</em><span>/月</span>
              </div>
              <ul className="ku-pricing-features">
                <li>✅ RAGナレッジ回答</li>
                <li>✅ 基本FAQ自動応答</li>
                <li>✅ LINEまたはWeb 1チャネル</li>
                <li>✅ 月1,000問い合わせ目安</li>
                <li>✅ 月1回の軽微なRAG更新</li>
                <li className="muted">— 会話記憶（なし）</li>
                <li className="muted">— 有人引き継ぎ判定（なし）</li>
              </ul>
            </article>

            <article className="ku-pricing featured">
              <div className="ku-pricing-badge">おすすめ</div>
              <div className="ku-pricing-tier">PRO</div>
              <h3>プロ</h3>
              <p>複数店舗・商談獲得を狙うブランド向け</p>
              <div className="ku-pricing-price">
                ¥50<em>万</em><span>初期</span>
                <br />
                + ¥5<em>万</em><span>/月</span>
              </div>
              <ul className="ku-pricing-features">
                <li>✅ RAGナレッジ回答</li>
                <li>✅ <strong>会話記憶</strong>（前回相談を踏まえ継続対応）</li>
                <li>✅ <strong>有人引き継ぎ判定</strong>（卸し・取材・コラボ検知）</li>
                <li>✅ 法人問い合わせ整理＋担当者通知</li>
                <li>✅ Web/LINE 複数チャネル対応</li>
                <li>✅ 月5,000問い合わせ目安</li>
                <li>✅ 月次RAG改善＋問い合わせ傾向レポート</li>
              </ul>
            </article>

            <article className="ku-pricing">
              <div className="ku-pricing-tier">ENTERPRISE</div>
              <h3>エンタープライズ</h3>
              <p>大規模・特殊要件向け</p>
              <div className="ku-pricing-price">
                <span>個別見積</span>
              </div>
              <ul className="ku-pricing-features">
                <li>✅ プロ全機能</li>
                <li>✅ 複数ブランド・複数店舗対応</li>
                <li>✅ 高度な会話記憶（長期文脈）</li>
                <li>✅ CRM / Chatwork / Slack 連携</li>
                <li>✅ 専用RAG設計＋運用改善ミーティング</li>
                <li>✅ 多言語・海外展開相談</li>
                <li>✅ SLA・専用運用体制</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="ku-section ku-trust" id="trust">
          <div className="ku-section-kicker">TRUST</div>
          <div className="ku-section-head">
            <h2 className="serif">安心して始められる運用設計。</h2>
            <p>
              AIだけで完結させず、必要な場面では人へつなぐ前提で設計します。公開後も回答内容と導線を見直せます。
            </p>
          </div>

          <div className="ku-trust-grid">
            <article>
              <h3>運営会社</h3>
              <p>#クリチの企画・販売とAI導入支援を行うVsw株式会社が提供します。</p>
            </article>
            <article>
              <h3>有人引き継ぎ</h3>
              <p>卸し、取材、コラボなどの重要相談はフォーム・通知導線へ誘導します。</p>
            </article>
            <article>
              <h3>データ管理</h3>
              <p>取得した情報はプライバシーポリシーに基づき、必要な範囲で管理します。</p>
            </article>
          </div>
        </section>

        <section className="ku-section ku-contact" id="contact">
          <div className="ku-contact-grid">
            <div>
              <div className="ku-section-kicker">CONTACT</div>
              <h2 className="serif">まずは、試す。導入は、相談する。</h2>
              <p>
                #クリチについて知りたい方は公式LINEへ。問い合わせAIを自社にも導入したい方は、フォームからご相談ください。
              </p>

              <div className="ku-contact-line">
                <div>
                  <h3>クリチちゃんに話しかける</h3>
                  <p>公式LINEアカウント <code>@552gvrkj</code></p>
                </div>
                <a href={lineUrl} target="_blank" rel="noreferrer" className="ku-btn-line">
                  LINEで試す <span aria-hidden>+</span>
                </a>
              </div>
            </div>

            <LeadForm />
          </div>
        </section>
      </main>

      <footer className="ku-footer">
        <div className="ku-footer-grid">
          <div>
            <div className="serif ku-footer-logo">#クリチ Inquiry AI</div>
            <p className="ku-footer-desc">
              日本発のスイーツIP #クリチの問い合わせAI。企画・提供: Vsw株式会社
            </p>
          </div>
          <div>
            <div className="ku-footer-h">ページ</div>
            <a href="#about">概要</a>
            <a href="#features">機能</a>
            <a href="#pricing">料金</a>
          </div>
          <div>
            <div className="ku-footer-h">リンク</div>
            <a href="https://vsw.co.jp" target="_blank" rel="noreferrer">Vsw株式会社</a>
            <Link href="/privacy">プライバシー</Link>
            <Link href="/terms">利用規約</Link>
          </div>
          <div>
            <div className="ku-footer-h">問い合わせ</div>
            <a href={lineUrl} target="_blank" rel="noreferrer">LINEで聞く</a>
            <a href="#contact">フォーム</a>
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
