import Link from "next/link";
import "../terms/legal.css";

export const metadata = {
  title: "プライバシーポリシー — クリチちゃん Inquiry AI",
};

export default function PrivacyPage() {
  return (
    <div className="legal">
      <div className="legal-inner">
        <div className="legal-eyebrow">― KURICHI INQUIRY AI</div>
        <h1 className="serif">プライバシーポリシー</h1>
        <p className="legal-meta">
          制定日：2026年6月26日 / 最終改定：2026年6月26日
          <br />
          運営：Vsw株式会社（以下「当社」）
        </p>

        <section>
          <h2>1. 取得する情報</h2>
          <p>本サービス（クリチちゃん Inquiry AI）は以下の情報を取得します：</p>
          <ul>
            <li>
              <strong>お問い合わせフォーム入力情報</strong>：お名前・会社名・メールアドレス・電話番号・お問い合わせ内容・お問い合わせ種別
            </li>
            <li>
              <strong>AIチャット利用ログ</strong>：質問内容・回答内容・送信時刻
            </li>
            <li>
              <strong>技術情報</strong>：ブラウザ種別・OS（不具合対応用）
            </li>
          </ul>
        </section>

        <section>
          <h2>2. 利用目的</h2>
          <ul>
            <li>お問い合わせへのご回答・営業対応</li>
            <li>サービス品質向上・FAQ改善</li>
            <li>不適切利用の検知・対策</li>
            <li>本サービスの安定運用・障害対応</li>
          </ul>
        </section>

        <section>
          <h2>3. データの保管</h2>
          <ul>
            <li>
              <strong>保管場所</strong>：日本国内サーバー（Supabase 東京リージョン）
            </li>
            <li>
              <strong>暗号化</strong>：AES-256-GCM
            </li>
            <li>
              <strong>通信</strong>：TLS 1.3
            </li>
          </ul>
        </section>

        <section>
          <h2>4. 保管期間</h2>
          <ul>
            <li>お問い合わせ情報：原則1年間</li>
            <li>AIチャットログ：原則90日間（改善目的）</li>
            <li>削除請求：本人からの請求に応じ速やかに削除</li>
          </ul>
        </section>

        <section>
          <h2>5. 第三者提供</h2>
          <p>
            取得した個人情報を、ご本人の同意なく第三者に提供することはありません。
            ただし、法令に基づく開示要請があった場合を除きます。
          </p>
        </section>

        <section>
          <h2>6. 委託先</h2>
          <ul>
            <li><strong>Vercel Inc.（米国）</strong>：アプリケーション実行環境</li>
            <li><strong>Supabase Inc.（東京リージョン）</strong>：データ保管</li>
            <li><strong>Anthropic, PBC（米国）</strong>：AI推論処理（学習には使用されない）</li>
          </ul>
        </section>

        <section>
          <h2>7. ご本人の権利</h2>
          <p>利用者本人は、以下の権利を行使できます：</p>
          <ul>
            <li>自身の利用ログの開示請求</li>
            <li>利用ログの削除請求</li>
            <li>利用停止の請求</li>
          </ul>
        </section>

        <section>
          <h2>8. お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせは、Vsw株式会社（公式サイト：
            <a href="https://vsw.co.jp" target="_blank" rel="noreferrer">https://vsw.co.jp</a>）までご連絡ください。
          </p>
        </section>

        <div className="legal-foot">
          <Link href="/lp">← サービス概要</Link>
          <Link href="/terms">利用規約 →</Link>
        </div>
      </div>
    </div>
  );
}
