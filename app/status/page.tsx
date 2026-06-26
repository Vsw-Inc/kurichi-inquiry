import Link from "next/link";
import "./status.css";

export const metadata = {
  title: "ラ・ヴィーチェ コンシェルジュ — 現在地",
  description: "ヴィーチェさん（社内Q&A AI）の進行ステータス・必要資料・本番稼働スケジュールを1ページで。",
};

export default function StatusPage() {
  return (
    <div className="st">
      {/* HEADER */}
      <header className="st-header">
        <div className="st-logo">
          <span className="serif">La Viche</span>
          <span className="st-logo-sub">CONCIERGE / STATUS</span>
        </div>
        <nav className="st-nav">
          <a href="#progress">PROGRESS</a>
          <a href="#phase">PHASE</a>
          <a href="#assets">ASSETS</a>
          <a href="#schedule">SCHEDULE</a>
          <a href="#next">NEXT</a>
          <Link href="/lp" className="st-cta-mini">LPを見る →</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="st-hero">
        <div className="st-hero-inner">
          <div className="st-hero-eyebrow">― PROJECT STATUS / PHASE 02 ほぼ完成</div>
          <h1 className="serif">
            本番リリースへ、<em>残りわずか。</em>
          </h1>
          <p className="st-hero-lead">
            規程5本のRAG投入・<strong>🇯🇵 日本国内化（Supabase 東京）・暗号化・LINE Login・店舗コード認証・管理画面（GM Console）</strong> まで完成しました。<br />
            バイトは「店舗コード ＋ LINE」でログインし、規程に基づく回答を出典つきで受け取れます。質問ログは管理画面でリアルタイムに把握可能です。<br />
            残りは <strong>カスタムドメイン</strong> と <strong>顧問専門家の法的確認</strong>。<strong>2026年6月末の本番リリース</strong>へ向け、最終段階です。
          </p>
          <div className="st-hero-meta">
            <div className="st-hero-meta-item">
              <div className="st-hero-meta-key">REPORT DATE</div>
              <div className="st-hero-meta-val serif">2026 / 05 / 24</div>
            </div>
            <div className="st-hero-meta-item">
              <div className="st-hero-meta-key">STATUS</div>
              <div className="st-hero-meta-val serif">PHASE 02 ほぼ完成 / 仕上げ段階</div>
            </div>
            <div className="st-hero-meta-item">
              <div className="st-hero-meta-key">TARGET LAUNCH</div>
              <div className="st-hero-meta-val">2026年 6月末 本番リリース</div>
            </div>
            <div className="st-hero-meta-item">
              <div className="st-hero-meta-key">PRODUCED BY</div>
              <div className="st-hero-meta-val">Vsw株式会社 / 菊地</div>
            </div>
          </div>
        </div>
      </section>

      {/* SUMMARY BAR */}
      <section className="st-summary">
        <div className="st-summary-inner">
          <div className="st-summary-cell">
            <div className="st-summary-num">5<em>本</em></div>
            <div className="st-summary-label">規程取り込み（5/12）</div>
          </div>
          <div className="st-summary-cell">
            <div className="st-summary-num">🇯🇵<em></em></div>
            <div className="st-summary-label">日本国内 保管完了（5/14）</div>
          </div>
          <div className="st-summary-cell">
            <div className="st-summary-num">4.95<em>/5</em></div>
            <div className="st-summary-label">セキュリティ評価</div>
          </div>
          <div className="st-summary-cell">
            <div className="st-summary-num">6<em>月末</em></div>
            <div className="st-summary-label">本番リリース目標</div>
          </div>
        </div>
      </section>

      {/* 01. PROGRESS */}
      <section className="st-section" id="progress">
        <div className="st-section-num">01</div>
        <div className="st-section-label">PROGRESS</div>
        <h2 className="serif">ここまで、完了。</h2>
        <p className="st-section-sub">
          プロト検証 → 規程取り込み → RAG 投入 → <strong>セキュリティ強化＆日本国内化</strong> まで完了。
          現在は <strong>LINE Login / カスタムドメイン / 管理画面の実装フェーズ</strong>。本番リリースに向けて並行で進めています。
        </p>
        <div className="st-progress-list">
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>アバター「ヴィーチェさん」設計</h3>
              <p>SVGオリジナルキャラ。ラ・ヴィーチェの世界観（葉のブローチ・温かみ）を踏襲。Live2D化も拡張可能。</p>
              <span className="st-progress-tag">DESIGN</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>Claude Sonnet 4.5 連携</h3>
              <p>規定書を読んで「出典付きで」答える応答ロジック実装済み。あやふやな質問は「店長へ」と正直に振る。</p>
              <span className="st-progress-tag">AI</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>チャット画面 / ストリーミング応答</h3>
              <p>スマホ前提のUIで、文字が流れるように出る応答。出典タグを自動抽出して表示。</p>
              <span className="st-progress-tag">UI / UX</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>商品説明LP（/lp）</h3>
              <p>6セクション（ABOUT/FEATURES/HOW IT WORKS/MEET HER/EFFECT/SPEC）。社内・社外説明用に常時参照可能。</p>
              <span className="st-progress-tag">LP</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>本番URL（Vercel）公開</h3>
              <p>laviche-concierge.vercel.app で稼働中。スマホ・PC・タブレット対応。LINEからURL共有で開けます。</p>
              <span className="st-progress-tag">DEPLOY</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>ダミー規定書22条 / 動作検証</h3>
              <p>「早退したい」「シフト変更」「制服ルール」等で応答確認済み。本物の規定書PDFに差し替えるだけで稼働可能。</p>
              <span className="st-progress-tag">VALIDATION</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>規程5本 受領（2026-05-12）</h3>
              <p>就業規則 / 給与規程 / <strong>パート・アルバイト就業規則（バイト向け本命）</strong> / 育児介護休業 / 慶弔見舞金。171KB / 2,200行 / 121,000文字。</p>
              <span className="st-progress-tag">RECEIVED</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>規程をAIに学習投入（RAG）</h3>
              <p>Claude Sonnet 4.5 が規程全文を参照して応答。回答末尾に <code>[CITE: ●●規程 第◯章]</code> の出典タグつき。<strong>Prompt Caching（ephemeral）</strong>で2回目以降のコスト・レイテンシを大幅削減。</p>
              <span className="st-progress-tag">RAG / CACHED</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>応答の正確性 動作確認</h3>
              <p>「給料日は？」→ 給与規程 第6条「毎月20日」を正確引用。「早退したい？」→ パート・アルバイト就業規則 第4章 第2節を引用。規程外質問は「店長に確認してね」と誠実に振る。</p>
              <span className="st-progress-tag">VERIFIED</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>規程ビューア整備（社内検証用）</h3>
              <p>ヴィーチェさんが見ている全データを<strong>人間が読める形</strong>で閲覧可能。章目次・全文検索つき。AI応答の根拠を確認可能。URLは個別にLINEでご案内します。</p>
              <span className="st-progress-tag">VIEWER</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>本番データ基盤 構築完了（Supabase 東京）</h3>
              <p>規程の本体を<strong>🇯🇵 日本国内サーバー</strong>（Supabase 東京リージョン）に物理移管完了（2026-05-14）。米国法管轄から離脱。</p>
              <span className="st-progress-tag">JP RESIDENCE</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>暗号化保管（AES-256-GCM）</h3>
              <p>規程は<strong>軍事レベルの認証付き暗号化</strong>で保管。鍵は別サーバー（Vercel環境変数）に分離。鍵を持たない者は読めません。</p>
              <span className="st-progress-tag">ENCRYPTED</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>サーバー側 Cookie 認証</h3>
              <p>規程ビューアの認証を <strong>HttpOnly / Secure / SameSite=Strict Cookie</strong> に強化。JavaScript から盗めない・CSRF耐性高・30日保持。</p>
              <span className="st-progress-tag">HARDENED</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>規程ビューア統合 / URL整理</h3>
              <p>並列していた2つの規程ビューアを <strong>/knowledge に一元化</strong>。先方共有時に懸念のあった旧URLは廃止予定。</p>
              <span className="st-progress-tag">UNIFIED</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>LINE Login 本接続 完了</h3>
              <p>LINE Developers Console で Login Channel 作成 → 本接続稼働開始（<a href="/login" style={{color:"var(--gold)"}}>/login</a>）。バイトは個人LINEアカウントで<strong>メアド入力ゼロのワンタップログイン</strong>が可能。チャット画面ヘッダーに「こんにちは、◯◯さん」を常時表示。30日Cookie保持。</p>
              <span className="st-progress-tag">LINE LIVE</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>店舗コード認証＆Middleware 認証ガード</h3>
              <p>店舗コード「AMZ2026」+ LINE Login の2段階認証。チャット画面（/）と /api/chat は<strong>未ログインで強制リダイレクト</strong>。LP・進捗・規程ビューアは引き続き先方共有可能。</p>
              <span className="st-progress-tag">GATED</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>レート制限・不適切質問フィルタ</h3>
              <p>ユーザーごとに <strong>1分10回 / 1日100回</strong> の上限。プロンプトインジェクション・規程全文引き出し・脱獄試行を検知して固定応答に切替。</p>
              <span className="st-progress-tag">SAFEGUARD</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>利用規約・プライバシーポリシー</h3>
              <p>バイト向けの<a href="/terms" style={{color:"var(--gold)"}}>利用規約</a>と<a href="/privacy" style={{color:"var(--gold)"}}>プラポリ</a>を整備。データ保管場所・取扱い・本人権利を明示。<strong>顧問社労士・顧問弁護士の最終確認推奨</strong>。</p>
              <span className="st-progress-tag">LEGAL DRAFT</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark done">✓</div>
            <div className="st-progress-body">
              <h3>GM Console（管理画面）完成</h3>
              <p>総務・本部向けの管理画面を実装完了。<strong>質問ログ一覧・今日/累計/ユニークユーザー数・不適切質問の検知</strong>をリアルタイム可視化。管理者（指定LINEアカウント）のみアクセス可能。質問データは Supabase 東京に蓄積。</p>
              <span className="st-progress-tag">GM CONSOLE</span>
            </div>
          </div>
          <div className="st-progress-item">
            <div className="st-progress-mark wip">◐</div>
            <div className="st-progress-body">
              <h3>カスタムドメイン適用</h3>
              <p>concierge.la-viche.jp（仮）への DNS 切替。ドメイン情報のご共有後、SSL含め30分で適用可能。6月上旬予定。</p>
              <span className="st-progress-tag">IN PROGRESS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 02. PHASE */}
      <section className="st-phase" id="phase">
        <div className="st-phase-inner">
          <div className="st-section-num">02</div>
          <div className="st-section-label">PHASE</div>
          <h2 className="serif">全体ロードマップ。</h2>
          <p className="st-section-sub">
            プロト検証 → 本番セットアップ → 店舗テスト → 全店＆海外。
            現在は <strong>PHASE 02 のスタート地点</strong>。<strong>2026年6月末の本番リリース</strong>を目指して進めます。
          </p>
          <div className="st-phase-rail">
            <div className="st-phase-card">
              <div className="st-phase-step">PHASE 01</div>
              <h3>プロト検証</h3>
              <p>触れるデモを公開し、実用性を確認いただく段階。</p>
              <div className="st-phase-status done">✓ 完了</div>
            </div>
            <div className="st-phase-card now">
              <div className="st-phase-step">PHASE 02</div>
              <h3>本番セットアップ</h3>
              <p>✓ RAG投入 / ✓ Supabase 東京 / ✓ 暗号化 / ✓ Cookie認証 / LINE Login / ドメイン / GM Console。</p>
              <div className="st-phase-status">実装中 / 6月末完了</div>
            </div>
            <div className="st-phase-card">
              <div className="st-phase-step">PHASE 03</div>
              <h3>店舗テスト運用</h3>
              <p>3〜5店舗で先行運用。質問ログを集めて改善ポイント抽出。月次レビュー。</p>
              <div className="st-phase-status">7月〜</div>
            </div>
            <div className="st-phase-card">
              <div className="st-phase-step">PHASE 04</div>
              <h3>全店展開＆海外</h3>
              <p>22店舗 + 海外（マレーシア）展開。多言語対応・FAQ整備運用に移行。</p>
              <div className="st-phase-status">秋〜年末</div>
            </div>
          </div>
        </div>
      </section>

      {/* 03. ASSETS — 受領状況・残依頼 */}
      <section className="st-section st-amz" id="assets">
        <div className="st-section-num">03</div>
        <div className="st-section-label">ASSETS</div>
        <h2 className="serif">
          資料・情報、<br />受領状況。
        </h2>
        <p className="st-section-sub">
          A：規程の受領・取り込みは完了しました。
          B：本番リリースに向けて、次回お打ち合わせ時にご教示ください。
          C：あれば嬉しい情報。
        </p>

        {/* 受領済み資料 */}
        <div className="st-amz-group">
          <div className="st-amz-group-head">
            <div className="st-amz-group-tier">A</div>
            <div className="st-amz-group-title">受領済み資料 — RAG投入完了</div>
            <div className="st-amz-group-bar"></div>
          </div>
          <div className="st-amz-list">
            <div className="st-amz-item">
              <div className="st-amz-check" style={{background:'var(--gold)',borderColor:'var(--gold)'}}></div>
              <div className="st-amz-body">
                <h4>就業規則 / 給与規程 / パート・アルバイト就業規則 / 育児介護休業規程 / 慶弔見舞金規程</h4>
                <p>
                  <strong>2026-05-12 受領</strong>。202404改訂 5本セット。171KB / 2,200行 / 121,000文字をClaude Sonnet 4.5に投入完了。
                  本物の規程ベースで応答中。出典タグつきで根拠を確認可能。
                </p>
              </div>
              <div className="st-amz-tag" style={{background:'var(--gold)',color:'var(--ink)',borderColor:'var(--gold)'}}>✓ 受領</div>
            </div>
            <div className="st-amz-item">
              <div className="st-amz-check"></div>
              <div className="st-amz-body">
                <h4>服装・接客・シフトに関する社内通達文書（追加分）</h4>
                <p>
                  規定書に明文化されていない<strong>運用ルール・店長通達</strong>があれば、追加でご共有ください。
                  PDF / Word / メール文 / LINE通達 / Excel 何でも可。
                </p>
              </div>
              <div className="st-amz-tag want">追加可</div>
            </div>
            <div className="st-amz-item">
              <div className="st-amz-check"></div>
              <div className="st-amz-body">
                <h4>利用規約・プライバシーポリシー</h4>
                <p>
                  既存の社内規程があればご共有ください。<strong>なければ当社で標準テンプレをご用意</strong>します（バイトの質問ログ保存・LINEログイン取得情報用）。
                </p>
              </div>
              <div className="st-amz-tag want">次回</div>
            </div>
          </div>
        </div>

        {/* 必須情報 */}
        <div className="st-amz-group">
          <div className="st-amz-group-head">
            <div className="st-amz-group-tier">B</div>
            <div className="st-amz-group-title">必須情報 — 設計・実装に必要</div>
            <div className="st-amz-group-bar"></div>
          </div>
          <div className="st-amz-list">
            <div className="st-amz-item">
              <div className="st-amz-check"></div>
              <div className="st-amz-body">
                <h4>利用ユーザー範囲</h4>
                <p>
                  まずは <strong>全バイトスタッフ一斉</strong> か、<strong>特定店舗から先行</strong> か。
                  人数規模（500名／1,000名／全社）でサーバー設計が変わります。
                </p>
              </div>
              <div className="st-amz-tag want">情報</div>
            </div>
            <div className="st-amz-item">
              <div className="st-amz-check"></div>
              <div className="st-amz-body">
                <h4>LINE公式アカウント情報 / Login Channel</h4>
                <p>
                  バイトのログインを「メアド入力ゼロ」にするため、LINE Loginを導入します。
                  既存の <strong>ラ・ヴィーチェ公式LINE</strong> がある場合は、その管理者連絡先と Channel ID をご共有ください。
                </p>
              </div>
              <div className="st-amz-tag want">情報</div>
            </div>
            <div className="st-amz-item">
              <div className="st-amz-check"></div>
              <div className="st-amz-body">
                <h4>カスタムドメインのご希望</h4>
                <p>
                  例：<strong>concierge.la-viche.jp</strong> / <strong>asks.la-viche.com</strong> など。
                  既存ドメイン管理の連絡先（取得業者・DNS管理者）も合わせてご共有ください。
                </p>
              </div>
              <div className="st-amz-tag want">情報</div>
            </div>
            <div className="st-amz-item">
              <div className="st-amz-check"></div>
              <div className="st-amz-body">
                <h4>管理画面（GM Console）閲覧権限者</h4>
                <p>
                  質問ログ・低評価質問・改善レポートを誰が見ますか？
                  例：<strong>平沼社長 / 副田部長 / 各店長 / 人事責任者</strong>。閲覧権限の段階を分けて設計します。
                </p>
              </div>
              <div className="st-amz-tag want">情報</div>
            </div>
            <div className="st-amz-item">
              <div className="st-amz-check"></div>
              <div className="st-amz-body">
                <h4>店舗テスト運用の対象店舗（3〜5店舗）</h4>
                <p>
                  PHASE 03 で先行運用する店舗の選定。<strong>店長の温度感が高い店舗</strong>を選ぶと精度が上がります。
                  バイト人数・年齢層・店舗特性が分散しているとなお良し。
                </p>
              </div>
              <div className="st-amz-tag want">情報</div>
            </div>
          </div>
        </div>

        {/* あれば嬉しい */}
        <div className="st-amz-group">
          <div className="st-amz-group-head">
            <div className="st-amz-group-tier">C</div>
            <div className="st-amz-group-title">あれば嬉しい — 改善精度・効果測定に効く</div>
            <div className="st-amz-group-bar"></div>
          </div>
          <div className="st-amz-list">
            <div className="st-amz-item">
              <div className="st-amz-check"></div>
              <div className="st-amz-body">
                <h4>過去のバイトからのよくある質問リスト</h4>
                <p>
                  店長LINE・本部問い合わせで頻出する質問があれば、ヒアリングだけでも。
                  <strong>初期FAQの精度</strong>が一気に上がります。
                </p>
              </div>
              <div className="st-amz-tag nice">参考</div>
            </div>
            <div className="st-amz-item">
              <div className="st-amz-check"></div>
              <div className="st-amz-body">
                <h4>マレーシア展開時の言語要件 / タイムライン</h4>
                <p>
                  英語・マレー語対応の要否、開始時期。<strong>多言語対応の優先順位検討用</strong>。
                  確定情報でなく現時点の温度感で構いません。
                </p>
              </div>
              <div className="st-amz-tag nice">参考</div>
            </div>
          </div>
        </div>
      </section>

      {/* 04. OUR TODO */}
      <section className="st-our">
        <div className="st-our-inner">
          <div className="st-section-num">04</div>
          <div className="st-section-label">OUR TODO</div>
          <h2 className="serif">当社側の残作業。</h2>
          <p className="st-section-sub">
            規定書ご共有後、こちらで段階的に仕上げる作業です。
            プロト基盤が整っているため大きな技術的リスクはなく、<strong>5月着手 → 6月末リリース</strong>のスケジュールで余裕を持って進められます。
          </p>
          <div className="st-our-grid">
            <div className="st-our-item">
              <div className="st-our-num">M-01</div>
              <div>
                <h4>本物の規定書 → RAG投入</h4>
                <p>PDFをテキスト化し、ベクトルDB（pgvector）で類似検索ベースに切替。応答の精度が一段上がる。</p>
              </div>
            </div>
            <div className="st-our-item">
              <div className="st-our-num">M-02</div>
              <div>
                <h4>Supabase 本格セットアップ</h4>
                <p>Auth / Postgres / RLSを本番設定。ユーザー管理・質問ログ保存・権限制御を一本化。</p>
              </div>
            </div>
            <div className="st-our-item">
              <div className="st-our-num">M-03</div>
              <div>
                <h4>LINE Login 実装</h4>
                <p>メアド入力ゼロでログイン。バイトの初日離脱を防ぐ最重要UX。</p>
              </div>
            </div>
            <div className="st-our-item">
              <div className="st-our-num">M-04</div>
              <div>
                <h4>GM Console（管理画面）</h4>
                <p>質問ログ・低評価質問・改善ダッシュボード・PDF再学習・FAQ追加機能。総務オペレーション用。</p>
              </div>
            </div>
            <div className="st-our-item">
              <div className="st-our-num">M-05</div>
              <div>
                <h4>カスタムドメイン適用</h4>
                <p>concierge.la-viche.jp（仮）でアクセス可能に。SSL・サブドメイン設計まで一括対応。</p>
              </div>
            </div>
            <div className="st-our-item">
              <div className="st-our-num">M-06</div>
              <div>
                <h4>セキュリティ・レート制限</h4>
                <p>不適切質問フィルタ・スパム対策・API利用上限制御。安心して全社展開できる土台を作る。</p>
              </div>
            </div>
            <div className="st-our-item">
              <div className="st-our-num">M-07</div>
              <div>
                <h4>利用規約・プライバシーポリシー整備</h4>
                <p>個人情報・質問ログの取り扱いを明文化。法務確認用のドラフトをご提供。</p>
              </div>
            </div>
            <div className="st-our-item">
              <div className="st-our-num">M-08</div>
              <div>
                <h4>店長エスカレ通知（LINE通知）</h4>
                <p>規定書にない質問が入ると、自動で店長LINEに通知。「人間に聞きたい」問題に応える仕組み。</p>
              </div>
            </div>
            <div className="st-our-item">
              <div className="st-our-num">M-09</div>
              <div>
                <h4>アバター表情差分（3〜5パターン）</h4>
                <p>応答の感情に合わせて表情変化。<strong>"ヴィーチェさんに会いに行く"</strong> 体験を強化。</p>
              </div>
            </div>
            <div className="st-our-item">
              <div className="st-our-num">M-10</div>
              <div>
                <h4>運用マニュアル / 操作トレーニング</h4>
                <p>総務担当者向けのGM Consoleマニュアル。Zoomで30分のオンボーディングセッション込み。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05. SCHEDULE */}
      <section className="st-schedule" id="schedule">
        <div className="st-schedule-inner">
          <div className="st-section-num">05</div>
          <div className="st-section-label">SCHEDULE</div>
          <h2 className="serif">5月着手、6月末リリース。</h2>
          <p className="st-section-sub">
            約6週間のスケジュールで、無理のないペースで本番リリースまで持っていきます。
            <strong>規定書受領を起点</strong>に、5月後半から実装フェーズに入る想定です。
          </p>
          <div className="st-schedule-rail">
            <div className="st-schedule-row">
              <div className="st-schedule-day">✓ 5/12</div>
              <div className="st-schedule-task">
                <strong>規程5本 受領 完了</strong><br />
                就業規則 / 給与規程 / PA就業規則 / 育介規程 / 慶弔規程
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">✓ 5/13</div>
              <div className="st-schedule-task">
                <strong>規程RAG投入 完了 / 規程ビューア公開</strong><br />
                Claude Sonnet 4.5 + Prompt Caching・出典タグ付き応答稼働開始
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">✓ 5/14</div>
              <div className="st-schedule-task">
                <strong>セキュリティ強化＆日本国内化 完了</strong><br />
                AES-256-GCM 暗号化 / HttpOnly Cookie認証 / Supabase 東京移管 / 規程ビューア統合
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">✓ 5/19</div>
              <div className="st-schedule-task">
                <strong>LINE Login 仮実装 完了</strong><br />
                ログイン画面・認証API・セッション管理を実装
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">✓ 5/21</div>
              <div className="st-schedule-task">
                <strong>LINE Login 本接続 完了</strong><br />
                LINE Channel接続 / 個人LINEでワンタップログイン稼働開始 / ヘッダー常時表示
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">✓ 5/22</div>
              <div className="st-schedule-task">
                <strong>店舗コード認証 / 認証ガード / レート制限 / 利用規約 完了</strong><br />
                AMZ2026 + LINE 2段階 / Middleware で / と /api/chat 保護 / 1分10回・1日100回上限 / 規約・プラポリ整備
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">✓ 5/24</div>
              <div className="st-schedule-task">
                <strong>GM Console（管理画面）完成</strong><br />
                質問ログ・統計・不適切質問検知のリアルタイム可視化 / 管理者限定アクセス / Supabase 東京にログ蓄積
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">5月末</div>
              <div className="st-schedule-task">
                <strong>カスタムドメイン適用 / 顧問専門家への法的確認</strong><br />
                concierge.la-viche.jp（仮）への DNS 切替 / 社労士法・規約の最終チェック
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">5月末〜6月頭</div>
              <div className="st-schedule-task">
                <strong>LINE Login / カスタムドメイン適用</strong><br />
                認証フロー実装・SSL設定・DNS切替
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">6月上旬</div>
              <div className="st-schedule-task">
                <strong>GM Console / 通知連携 / 表情差分</strong><br />
                管理画面・店長エスカレLINE・アバター表情の各実装
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">6月中旬</div>
              <div className="st-schedule-task">
                <strong>セキュリティ強化 / 利用規約整備 / 内部QA</strong><br />
                レート制限・フィルタ・規約ドラフト・テスト全件
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">6月下旬</div>
              <div className="st-schedule-task">
                <strong>社内テスト / 不具合調整 / 運用マニュアル整備</strong><br />
                総務担当者向けの操作トレーニング素材作成・本番投入の最終チェック
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">6月末</div>
              <div className="st-schedule-task">
                <strong>本番リリース 🎬 / 御社オンボーディング</strong><br />
                30分の操作研修（Zoom / GINZA SIX）・3〜5店舗で先行運用開始
              </div>
            </div>
            <div className="st-schedule-row">
              <div className="st-schedule-day">7月下旬</div>
              <div className="st-schedule-task">
                <strong>月次レビュー1回目</strong><br />
                質問ログ集計・低評価質問抽出・FAQ追加・改善レポート提出
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / NEXT */}
      <section className="st-cta" id="next">
        <div className="st-cta-inner">
          <div className="st-cta-eyebrow">― NEXT STEP</div>
          <h2 className="serif">
            動作確認、<br />お願いします。
          </h2>
          <p className="st-cta-lead">
            本物の規程をもとに <strong>ヴィーチェさんが応答する状態</strong> で稼働中です。<br />
            実機で気軽に質問していただき、<strong>応答内容・トーン・出典タグの精度</strong> についてお気付きの点をお聞かせください。<br />
            取り込んだ規程の中身を直接ご覧になりたい場合は、LINEで個別にURLをお送りします。
          </p>
          <div className="st-cta-btns">
            <Link href="/" className="st-btn-primary">
              実機で試す <span>→</span>
            </Link>
            <Link href="/login" className="st-btn-ghost">
              📱 ログイン画面（仮）を見る
            </Link>
          </div>
          <div className="st-cta-meta">
            <div className="st-cta-meta-cell">
              <div className="k">お試し質問例</div>
              <div className="v">「給料日はいつ？」「早退したい？」<br />「育休取れる？」「結婚祝い金ある？」</div>
            </div>
            <div className="st-cta-meta-cell">
              <div className="k">フィードバック窓口</div>
              <div className="v">Vsw株式会社 / 菊地 俊雄<br />既存LINEグループでご返信ください</div>
            </div>
            <div className="st-cta-meta-cell">
              <div className="k">データ保管</div>
              <div className="v">🇯🇵 Supabase 東京（日本国内）<br />AES-256-GCM 暗号化保管（5/14 移管完了）</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="st-footer">
        <div className="st-footer-inner">
          <div className="st-footer-logo">La Viche Concierge</div>
          <div>© 2026 La Viche / AMZ GROUP — Status Report 2026.05.14</div>
          <div>Designed & Built by Vsw Inc.</div>
        </div>
      </footer>
    </div>
  );
}
