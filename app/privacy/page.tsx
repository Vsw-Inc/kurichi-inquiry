import Link from "next/link";
import "../terms/legal.css";

export const metadata = {
  title: "プライバシーポリシー — ラ・ヴィーチェ コンシェルジュ",
};

export default function PrivacyPage() {
  return (
    <div className="legal">
      <div className="legal-inner">
        <div className="legal-eyebrow">― LA VICHE CONCIERGE</div>
        <h1 className="serif">プライバシーポリシー</h1>
        <p className="legal-meta">
          制定日：2026年5月22日 / 最終改定：2026年6月25日
          <br />
          運営：Vsw株式会社（以下「当社」）
        </p>

        <section>
          <h2>1. 取得する情報</h2>
          <p>本サービス（Web版・LINE公式アカウント @923fsjxp）は以下の情報を取得します：</p>
          <ul>
            <li>
              <strong>Web版・LINE Login経由</strong>：LINEユーザーID・表示名・プロフィール画像URL
            </li>
            <li>
              <strong>LINE Bot経由</strong>：LINEユーザーID・認証日時・最終アクセス時刻
            </li>
            <li>
              <strong>利用ログ（chat_logs）</strong>：質問内容・回答プレビュー・出典タグ・送信時刻・所要時間・トークン使用量・コスト
            </li>
            <li>
              <strong>技術情報</strong>：ブラウザ種別・OS（不具合対応用）
            </li>
          </ul>
          <p>
            ※ メールアドレス・電話番号・住所等は取得しません。
            <br />
            ※ LINEパスワード等は当社に渡らない仕組みです（LINE社のOAuth経由）。
            <br />
            ※ 合言葉（パスワード）は照合後、保存されません。
          </p>
        </section>

        <section>
          <h2>2. 利用目的</h2>
          <ul>
            <li>本サービスの提供および応答機能の実行</li>
            <li>応答精度の改善・FAQ整備（質問ログの統計分析）</li>
            <li>不適切利用の検知・対策</li>
            <li>本サービスの安定運用・障害対応</li>
            <li>本人確認・正規利用者の判定</li>
            <li>運用コスト（APIトークン使用量）の可視化・管理</li>
          </ul>
        </section>

        <section>
          <h2>3. データの保管場所と方法</h2>
          <ul>
            <li>
              <strong>規程データ</strong>：<strong>🇯🇵 日本国内サーバー（Supabase 東京リージョン）</strong>に
              AES-256-GCM 暗号化された状態で保管
            </li>
            <li>
              <strong>認証情報</strong>：HttpOnly Cookie（30日保持・JavaScriptから読めない）
              ＋ HMAC-SHA256 署名で改ざん防止
            </li>
            <li>
              <strong>LINE Botホワイトリスト</strong>：Supabase 東京リージョンに保存
              （LINEユーザーIDと認証状態のみ）
            </li>
            <li>
              <strong>質問ログ（chat_logs）</strong>：Supabase 東京リージョンに保存
              （管理画面 GM Console で参照可・統計分析用）
            </li>
            <li>
              <strong>推論処理</strong>：質問処理の瞬間のみ、Anthropic Claude APIに送信
              （Anthropic社は学習に使用しないことを規約で保証）
            </li>
          </ul>
        </section>

        <section>
          <h2>4. 保管期間</h2>
          <ul>
            <li>認証Cookie：30日（再ログインで延長）</li>
            <li>LINE Botホワイトリスト：退職・退会・ブロック時に速やかに削除可</li>
            <li>質問ログ：原則90日（改善目的のため。ご希望により短縮可能）</li>
            <li>退職・退会時：速やかに当該ユーザー情報を削除</li>
          </ul>
        </section>

        <section>
          <h2>5. 第三者提供</h2>
          <p>
            取得した個人情報を、ご本人の同意なく第三者に提供することはありません。
            ただし、以下の場合を除きます：
          </p>
          <ul>
            <li>法令に基づく開示要請があった場合</li>
            <li>株式会社ラ・ヴィーチェへの業務報告（統計情報のみ・個人特定不可形式）</li>
          </ul>
        </section>

        <section>
          <h2>6. 委託先（業務委託に伴う情報の取り扱い）</h2>
          <ul>
            <li><strong>Vercel Inc.（米国）</strong>：アプリケーション実行環境</li>
            <li><strong>Supabase Inc.（東京リージョン）</strong>：データ保管</li>
            <li><strong>Anthropic, PBC（米国）</strong>：AI推論処理（学習には使用されない）</li>
            <li><strong>LINE株式会社（日本）</strong>：認証サービス・Messaging API</li>
          </ul>
          <p>各事業者とは適切な秘密保持・データ取扱契約を締結しています。</p>
        </section>

        <section>
          <h2>7. セキュリティ対策</h2>
          <ul>
            <li>通信：TLS 1.3 による暗号化</li>
            <li>保管：AES-256-GCM 暗号化（規程データ）</li>
            <li>認証：HttpOnly / Secure / SameSite=Strict Cookie ＋ HMAC-SHA256 署名</li>
            <li>
              アクセス制御（3層防御）：
              <ul>
                <li>Layer 1：合言葉認証（LINE Bot / Web版）</li>
                <li>Layer 2：規程ビューアの個別パスワード</li>
                <li>Layer 3：規程データの暗号化保管</li>
              </ul>
            </li>
            <li>レート制限：1分10回 / 1日30回（ユーザー単位）</li>
            <li>不適切コンテンツフィルタ：自動検知・ログ記録</li>
            <li>LINE署名検証：HMAC-SHA256 + timingSafeEqual（なりすまし防止）</li>
            <li>監査ログ：アクセス履歴・不適切質問検知ログの記録</li>
          </ul>
        </section>

        <section>
          <h2>8. ご本人の権利</h2>
          <p>利用者本人は、以下の権利を行使できます：</p>
          <ul>
            <li>自身の利用ログの開示請求</li>
            <li>利用ログの削除請求</li>
            <li>利用停止の請求（LINE Botの場合は「ブロック」で即停止可）</li>
            <li>LINE Botホワイトリストからの削除請求</li>
          </ul>
          <p>
            お問い合わせ窓口（既存LINEグループ、または店長経由）にてご連絡ください。
          </p>
        </section>

        <section>
          <h2>9. 改定</h2>
          <p>
            本ポリシーは、関連法令の改正や運用変更に応じて改定することがあります。
            重要な変更がある場合は、本サービス上で告知します。
          </p>
        </section>

        <section>
          <h2>10. お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせは、Vsw株式会社（既存LINEグループ）または
            ラ・ヴィーチェ本部までご連絡ください。
          </p>
        </section>

        <div className="legal-foot">
          <Link href="/lp">サービス概要 →</Link>
          <Link href="/terms">利用規約 →</Link>
          <Link href="/login">← ログインに戻る</Link>
        </div>
      </div>
    </div>
  );
}
