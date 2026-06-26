# SETUP — 新規顧客セットアップ手順書

新規顧客への導入手順を **0 → 1** で網羅。所要時間 **3〜5時間**。

---

## 目次

1. [事前準備（顧客にもらう情報）](#1-事前準備)
2. [リポジトリ準備](#2-リポジトリ準備)
3. [LINE Developers セットアップ](#3-line-developers-セットアップ)
4. [Supabase セットアップ](#4-supabase-セットアップ)
5. [Anthropic API キー取得](#5-anthropic-api-キー取得)
6. [規程・FAQデータ準備](#6-規程faqデータ準備)
7. [Vercel デプロイ](#7-vercel-デプロイ)
8. [LINE Bot 連携設定](#8-line-bot-連携設定)
9. [ブランディング差し替え](#9-ブランディング差し替え)
10. [動作確認](#10-動作確認)
11. [顧客への引き渡し](#11-顧客への引き渡し)

---

## 1. 事前準備

顧客からヒアリングして受け取るもの：

- [ ] **会社名**（正式・略称）
- [ ] **担当者連絡先**（LINEグループ or メール）
- [ ] **規程・FAQ ファイル**（PDF / Word / 既存マニュアル類）
- [ ] **LINE公式アカウント**：既存か新規開設か
- [ ] **ロゴ・アイコン素材**（PNG / SVG）
- [ ] **ブランドカラー**
- [ ] **公式サイトURL**
- [ ] **電話番号**（リッチメニューの「電話で相談」用）
- [ ] **管理者（菊地さん側 + 顧客側）の LINE userId**

---

## 2. リポジトリ準備

### A. テンプレートからクローン

```bash
# テンプレリポジトリを fork or clone
git clone https://github.com/Vsw/concierge-ai-template.git ○○-concierge
cd ○○-concierge

# 顧客プロジェクトとして git 初期化
rm -rf .git
git init
git add .
git commit -m "init: ○○ concierge ベース作成"
```

### B. .env.local 作成

```bash
cp .env.example .env.local
# 後述の手順で各変数を埋めていく
```

### C. 依存インストール

```bash
npm install
```

---

## 3. LINE Developers セットアップ

**※ Login用と Messaging API用の 2つのチャネルが必要**

### A. プロバイダー作成

1. https://developers.line.biz/console/ にアクセス
2. プロバイダー作成（顧客の会社名で）

### B. LINE Login チャネル作成

1. プロバイダー → 「**新規チャネル作成**」 → **LINE Login**
2. 入力：
   - チャネル名：`○○ コンシェルジュ Login`
   - チャネル説明：適当に
   - アプリタイプ：**Webアプリ**
3. 作成後、「**LINEログイン設定**」タブ
   - **コールバックURL** に登録：
     ```
     https://○○-concierge.vercel.app/api/auth/line/callback
     ```
4. 「**チャネル基本設定**」タブ
   - **Channel ID** ← .env.local の `LINE_CHANNEL_ID` に
   - **チャネルシークレット** ← `LINE_CHANNEL_SECRET` に

### C. Messaging API チャネル作成

1. プロバイダー → 「**新規チャネル作成**」 → **Messaging API**
2. 入力：
   - チャネル名：`○○ コンシェルジュ Bot`
   - 業種：適当に
3. 作成後、「**Messaging API設定**」タブ
   - **チャネルアクセストークン（長期）** → 発行 → `LINE_CHANNEL_ACCESS_TOKEN` に
   - **Webhook URL**：後でVercelデプロイ後に設定
   - **Webhookの利用**：ON
   - **応答メッセージ**：OFF
   - **あいさつメッセージ**：OFF
4. 「**チャネル基本設定**」タブ
   - **チャネルシークレット** → `LINE_MESSAGING_CHANNEL_SECRET` に

### D. LINE公式アカウント Manager で応答設定

1. https://manager.line.biz にアクセス
2. 対象アカウント → 設定 → 応答設定
3. **応答モード**：Bot
4. **応答メッセージ**：OFF
5. **Webhook**：ON
6. **あいさつメッセージ**：OFF（推奨）

---

## 4. Supabase セットアップ

### A. プロジェクト作成

1. https://supabase.com にアクセス
2. **New project** → 顧客名で作成
3. リージョン：**Tokyo（ap-northeast-1）** ← 日本企業なら必須
4. 強力なDBパスワード設定

### B. API キー取得

Settings → API：
- **Project URL** ← `SUPABASE_URL` に
- **service_role secret** ← `SUPABASE_SERVICE_KEY` に

### C. テーブル作成

SQL Editor → New query で以下を実行：

```sql
-- 質問ログテーブル
create table if not exists chat_logs (
  id bigserial primary key,
  user_id text,
  user_name text,
  user_source text,
  question text not null,
  answer_preview text,
  citation text,
  input_tokens integer default 0,
  output_tokens integer default 0,
  cache_creation_tokens integer default 0,
  cache_read_tokens integer default 0,
  duration_ms integer default 0,
  rate_limited boolean default false,
  filtered boolean default false,
  filter_label text,
  created_at timestamptz default now()
);
create index if not exists chat_logs_created_at_idx on chat_logs(created_at desc);
create index if not exists chat_logs_user_id_idx on chat_logs(user_id);

-- LINE Bot ホワイトリスト
create table if not exists line_users (
  line_user_id text primary key,
  display_name text,
  is_verified boolean default false,
  verified_at timestamptz,
  shop_code text,
  created_at timestamptz default now(),
  blocked boolean default false,
  blocked_reason text,
  last_seen_at timestamptz default now()
);
create index if not exists line_users_verified_idx on line_users(is_verified);
create index if not exists line_users_blocked_idx on line_users(blocked);
```

### D. Storage バケット作成

Storage → New bucket：
- 名前：`knowledge`
- Public：**OFF**（プライベート）

---

## 5. Anthropic API キー取得

1. https://console.anthropic.com にログイン（or サインアップ）
2. Settings → **API Keys** → **Create Key**
3. ラベル：`○○-concierge`
4. 表示されたキー ← `ANTHROPIC_API_KEY` に

**予算上限設定（推奨）**：
- Settings → **Limits** → **Monthly spend limit** を設定（例：$50/月）
- 暴走時の青天井を防ぐ

---

## 6. 規程・FAQデータ準備

### A. knowledge.md 作成

`data/knowledge.md` のフォーマット：

```markdown
# ○○社内規程集

> 内部利用限定

## 収録規程一覧

- **001 就業規則**
- **002 給与規程**
- ...

---

## 001 就業規則

第1章 総則

（条文…）

第2章 服務

（条文…）
```

**重要ルール**：
- 規程ヘッダは `## 001 規程名` の形式
- 章は `第N章 タイトル`（RAG分割用）
- 出典タグで使う章タイトルは正確に

### B. 暗号化キーを生成 + 暗号化

```bash
node scripts/encrypt-knowledge.mjs
```

出力された `KNOWLEDGE_KEY=xxx` を .env.local にコピー。

### C. Supabase Storage にアップロード

```bash
node scripts/upload-knowledge.mjs
```

---

## 7. Vercel デプロイ

### A. プロジェクト作成

```bash
npm install -g vercel
vercel login
vercel link
```

または Vercel Dashboard で GitHub 連携。

### B. 環境変数登録

.env.local の中身を全て Vercel に登録：

```bash
# 一括登録例
for key in $(cat .env.local | grep -v "^#" | grep -v "^$" | cut -d= -f1); do
  value=$(grep "^${key}=" .env.local | cut -d= -f2- | sed 's/^"//;s/"$//')
  vercel env add $key production --value "$value" --no-sensitive --yes
done
```

### C. 本番デプロイ

```bash
vercel deploy --prod --yes
```

公開URLを記録：`https://○○-concierge.vercel.app`

---

## 8. LINE Bot 連携設定

### A. Webhook URL を LINE に登録

1. https://developers.line.biz → Messaging APIチャネル
2. Messaging API設定 → **Webhook URL** に登録：
   ```
   https://○○-concierge.vercel.app/api/line-webhook
   ```
3. **「検証」** ボタンを押下 → 「成功」を確認

### B. リッチメニュー設定（任意）

1. `scripts/line/richmenu.png` を顧客ブランドで差し替え
2. `scripts/line/setup-richmenu.mjs` のURIを顧客用に編集
3. 実行：
   ```bash
   node scripts/line/setup-richmenu.mjs
   ```

---

## 9. ブランディング差し替え

詳細は [BRANDING.md](./BRANDING.md) 参照。最低限：

1. **アバターSVG**：`app/components/ViBotAvatar.tsx`
2. **LP コピー**：`app/lp/page.tsx`
3. **配色**：`app/globals.css` の CSS変数（`--gold` 等）
4. **規程ビューア タイトル**：`app/knowledge/page.tsx`

---

## 10. 動作確認

### Web版

- [ ] `/login` でパスワード入力 → LINE Login → チャット画面
- [ ] チャットで質問 → 規程に基づく回答が返る
- [ ] 出典タグ表示 → クリックで規程ビューアにジャンプ
- [ ] `/knowledge` でパスワード入力 → 規程一覧表示
- [ ] `/lp` で全セクション表示
- [ ] `/admin` でログイン（自分のLINE userIdを ADMIN_USER_IDS に登録）

### LINE Bot

- [ ] LINE で友だち追加 → あいさつメッセージ届く
- [ ] 合言葉を送信 → 認証OKメッセージ
- [ ] 質問 → 回答が返る（出典付き）
- [ ] リッチメニュー表示

### 管理画面

- [ ] /admin で質問ログ・コストが見える
- [ ] LINEユーザー一覧が表示される
- [ ] ユーザー詳細ページで履歴確認できる
- [ ] PushMessage 機能でテスト送信できる

---

## 11. 顧客への引き渡し

### A. アクセス情報書

顧客に渡すドキュメント：

- 公開URL一覧（Web版 / LP / 規程ビューア / LINE）
- 合言葉（AMZ2026 → 顧客が決めた値）
- 管理者ログイン手順
- LINE公式アカウントの友だち追加QR
- 改修・問い合わせ窓口

### B. 運用マニュアル

- 合言葉の伝達フロー
- 退職時の対応（管理画面でブロック）
- 規程改訂時の更新依頼方法
- 月次レポートの見方

### C. 請求

- 初期費用：¥300,000〜
- 月額：¥30,000〜
- AI API 従量：別途実費 + 20% 管理手数料

---

## 🆘 トラブルシュート

| 症状 | 対処 |
|---|---|
| LINE Login で 400 redirect_uri | LINE_CHANNEL_ID/SECRETがLogin用か確認・Callback URL登録 |
| 合言葉認証で失敗 | line_users テーブル作成済か確認 |
| chat_logs に記録されない | Supabase Resume済か確認 |
| /admin で「権限なし」 | ADMIN_USER_IDS に自分のIDを登録・再ログイン |
| LINE Bot応答なし | 応答設定で Webhook ON / 応答メッセージ OFF |

---

## 📚 関連ドキュメント

- [README.md](./README.md) — テンプレ概要
- [BRANDING.md](./BRANDING.md) — ブランディング差し替えガイド
- [docs/CHECKLIST.md](./docs/CHECKLIST.md) — 受注→納品WBS
- [docs/SALES_PITCH.md](./docs/SALES_PITCH.md) — 営業資料
