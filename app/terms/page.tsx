import Link from "next/link";
import "./legal.css";

export const metadata = {
  title: "利用規約 — クリチちゃん Inquiry AI",
};

export default function TermsPage() {
  return (
    <div className="legal">
      <div className="legal-inner">
        <div className="legal-eyebrow">― KURICHI INQUIRY AI</div>
        <h1 className="serif">利用規約</h1>
        <p className="legal-meta">
          制定日：2026年6月26日 / 最終改定：2026年6月26日
          <br />
          運営：Vsw株式会社（以下「当社」）
        </p>

        <section>
          <h2>第1条（目的）</h2>
          <p>
            本規約は、当社が提供する「クリチちゃん Inquiry AI」（以下「本サービス」）
            の利用条件を定めるものです。
            本サービスは、クリームチーズバーガーブランド「#クリチ」および
            当社が提供するAIお問い合わせサービスへのご相談を受け付けます。
          </p>
        </section>

        <section>
          <h2>第2条（提供内容）</h2>
          <p>
            本サービスは、AIによる問い合わせ自動応答とお問い合わせフォームを
            提供します。回答内容の正確性・完全性は保証しません。
            重要な判断が必要な事項は当社担当者からの連絡をお待ちください。
          </p>
        </section>

        <section>
          <h2>第3条（禁止事項）</h2>
          <p>利用者は、以下の行為を行ってはなりません：</p>
          <ul>
            <li>虚偽の情報を入力する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>不正アクセス・リバースエンジニアリング</li>
            <li>過度な負荷をかける行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2>第4条（知的財産）</h2>
          <p>
            本サービスのソフトウェア・キャラクター「クリチちゃん」等に関する
            知的財産権は当社に帰属します。
          </p>
        </section>

        <section>
          <h2>第5条（免責）</h2>
          <p>
            本サービスは情報提供を目的とするものであり、回答内容の正確性を
            保証するものではありません。
            本サービスの利用または利用不能から生じる損害について、当社は
            一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2>第6条（規約の変更）</h2>
          <p>
            当社は、必要に応じて本規約を変更することがあります。変更後の規約は、
            本サービス上に掲載した時点で効力を生じます。
          </p>
        </section>

        <section>
          <h2>第7条（準拠法・管轄）</h2>
          <p>
            本規約は日本法に準拠し、本サービスに関する紛争は東京地方裁判所を
            第一審の専属的合意管轄裁判所とします。
          </p>
        </section>

        <section>
          <h2>お問い合わせ</h2>
          <p>
            本規約に関するお問い合わせは、Vsw株式会社（公式サイト：
            <a href="https://vsw.co.jp" target="_blank" rel="noreferrer">https://vsw.co.jp</a>）までご連絡ください。
          </p>
        </section>

        <div className="legal-foot">
          <Link href="/lp">← サービス概要</Link>
          <Link href="/privacy">プライバシーポリシー →</Link>
        </div>
      </div>
    </div>
  );
}
