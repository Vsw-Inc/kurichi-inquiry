# クリチ Inquiry AI

NY発・大阪生まれのクリームチーズバーガー「#クリチ」公式の **Inquiry AI**。  
お客様・取引候補からの問い合わせに、AIが24時間自動回答 + リード獲得。

> Provided by **Vsw株式会社**

---

## 🎯 提供価値

```
お客様（HP / SNS / LINEから）
   ↓ 質問
[クリチBot] が即回答
   ・店舗・営業時間
   ・メニュー・価格
   ・配送・テイクアウト
   ・卸・コラボ提案
   ↓ リード獲得
営業担当へ自動通知（Slack/メール）
```

---

## 📁 プロジェクト構成

```
kurichi-inquiry/
├── app/
│   ├── page.tsx         # トップ・チャットUI
│   ├── lp/              # サービス紹介
│   ├── api/
│   │   ├── chat/        # 質問→Claude→回答
│   │   └── line-webhook/ # LINE Bot 受け口
├── lib/
│   ├── brand.ts         # ブランディング設定
│   └── ...
├── data/
│   └── knowledge.md     # クリチ製品情報・FAQ
└── docs/
```

---

## 🚀 開発

```bash
npm install
cp .env.example .env.local
# 環境変数を埋める
npm run dev
```

→ http://localhost:3000

---

## 🛠 技術スタック

| レイヤー | 技術 |
|---|---|
| フロント | Next.js 15 / TypeScript |
| AI | Claude Sonnet 4.5 + Haiku 4.5（RAG）|
| DB | Supabase（東京リージョン）|
| ホスティング | Vercel |
| LINE | Messaging API |
| 暗号化 | AES-256-GCM |

---

## 📜 ライセンス

Vsw株式会社 内部利用限定。
