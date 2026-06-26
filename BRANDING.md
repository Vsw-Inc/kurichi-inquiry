# BRANDING — ブランディング差し替えガイド

「○○社っぽさ」を出すためにカスタマイズすべきポイントを網羅。

---

## ⚡ クイック差し替え（30分で見栄え変わる）

`.env.local` の `NEXT_PUBLIC_*` 系を変えるだけで主要テキストは切替可能。

| 変数 | 例 | 影響箇所 |
|---|---|---|
| `NEXT_PUBLIC_COMPANY_NAME` | 株式会社△△ | LP / 規程ビューア / フッター |
| `NEXT_PUBLIC_ASSISTANT_NAME` | △△くん | チャット画面 / LP / Bot応答 |
| `NEXT_PUBLIC_ASSISTANT_GREETING` | "こんにちは、△△です。" | チャット画面 hero |
| `NEXT_PUBLIC_OFFICIAL_SITE_URL` | https://△△.co.jp | リッチメニュー / footer |
| `NEXT_PUBLIC_SUPPORT_PHONE` | 03-1234-5678 | リッチメニュー / footer |
| `NEXT_PUBLIC_BRAND_COLOR_ACCENT` | #c8a570 | 各CSS（手動置換も必要）|

---

## 🎨 配色テーマ変更

### CSS変数を変える（推奨）

`app/globals.css` の `:root` を編集：

```css
:root {
  --bg: #faf8f3;        /* 背景（白っぽいクリーム） */
  --ink: #2a2520;       /* 文字色（濃い茶） */
  --gold: #b0883c;      /* アクセント1 */
  --gold-deep: #8a6d38; /* アクセント2 */
  --yellow: #e0a93c;    /* ホバー時 */
  --line: rgba(176, 136, 60, 0.18);
}
```

### 業種別おすすめ配色

| 業種 | 推奨カラー |
|---|---|
| 💆 美容・サロン | ベージュ × ローズゴールド `#c9a8a3` |
| 🍴 飲食 | 朱赤 × 木目 `#a14842` |
| 🏗 建設 | チャコール × オレンジ `#d2691e` |
| 🏢 オフィス系 | ネイビー × 銀 `#1a3a5c` |
| 💆 介護 | ミントグリーン × 白 `#7cb8a5` |

---

## 🌿 アバターキャラクター

### 既存：`ヴィーチェさん`（葉のブローチをつけた3年目スタッフ）

`app/components/ViBotAvatar.tsx` で SVG として定義済み。

### 差し替え方法

**選択肢 A**：SVGを手書きで書き換え
- `<svg>` 内のpath/circle/ellipseを編集
- カラーコードも変更

**選択肢 B**：別のアバター（Midjourney/DALL-E等で生成）
- PNG画像を `public/avatar/` に置く
- `ViBotAvatar.tsx` を `<img src={...}>` に書き換え

**選択肢 C**：絵文字や図形アイコン
- シンプルに `<div>` で円形アイコン作成
- 最低限のコストでブランド感

### キャラ設定（システムプロンプトに反映）

`app/api/chat/route.ts` の `SYSTEM_BASE`：

```typescript
const SYSTEM_BASE = `あなたは○○の先輩スタッフ「△△」です。
# 役割
- ○○のバイト・社員からの質問に答える
- 敬語ベースだが堅すぎない、親しみのある先輩口調
...
`;
```

`app/api/line-webhook/route.ts` の `SYSTEM_PROMPT` も同様に。

---

## 📝 LP（/lp）のテキスト差し替え

`app/lp/page.tsx` を編集：

### 主要セクション

| セクション | 何を書き換える |
|---|---|
| **HERO** | 「○○のバイト・社員のための、社内ルールAI先輩」 |
| **01 ABOUT** | 業種特有の課題と効果（例：シフト交代・接客マニュアル等）|
| **02 FEATURES** | 8カードのうち業種にハマるもの選定 |
| **03 HOW IT WORKS** | LINE→合言葉→質問の流れ（基本同じ）|
| **04 MEET** | アシスタント名・由来・口ぐせ |
| **05 EFFECT** | 業種別効果（例：定着率↑・問い合わせ削減）|
| **06 SPEC** | 規程数を顧客の本数に |

---

## 🏷 サービス名（タイトルバー・SEO）

各ページの metadata：

```typescript
// app/layout.tsx
export const metadata = {
  title: "○○ コンシェルジュ",
  description: "○○の社内ルールAI先輩",
};
```

各ページ（/lp /admin /knowledge等）の export const metadata も同様。

---

## 📱 LINE 公式アカウント

### アカウント名

LINE Official Account Manager → 基本情報 → アカウント名変更。

### アイコン

LINE Official Account Manager → 基本情報 → プロフィール画像。
- 推奨サイズ：640×640 PNG

### あいさつメッセージ

通常は OFF 推奨（Botの GREETING が届くため）。

### リッチメニュー

`scripts/line/setup-richmenu.mjs` 内のURI を顧客用に書き換え：

```javascript
{
  bounds: { x: 0, y: 0, width: 833, height: 843 },
  action: {
    type: "uri",
    uri: "https://○○.com/", // ← 顧客のURL
    label: "公式サイト",
  },
},
```

`scripts/line/richmenu.png` は Python スクリプトで再生成可能（雛形あり）。

---

## 🗂 規程・FAQ データ

### 必須：`data/knowledge.md`

```markdown
# ○○社内規程集

## 収録規程一覧
- **001 ○○規程**
- **002 △△規程**

---

## 001 ○○規程

第1章 総則
（条文）

第2章 ◯◯
（条文）
```

### RAG判定の調整

`lib/regChunks.ts` の `REG_NAMES` を顧客の規程番号で更新：

```typescript
const REG_NAMES = [
  { pattern: /001\s*○○規程/, name: "○○規程", no: "001" },
  { pattern: /002\s*△△規程/, name: "△△規程", no: "002" },
  // ...
];
```

`app/page.tsx` の `citationAnchor` も同様に更新。

---

## 🔐 セキュリティ関連の表記変更

- `app/privacy/page.tsx`：会社名・運営社名
- `app/terms/page.tsx`：会社名・利用者範囲
- `app/login/page.tsx`：「○○関係者限定です」

`grep -r "ラ・ヴィーチェ" app/` で残りハードコードを検索して差し替え。

---

## 🎯 差し替えチェックリスト（最低限）

- [ ] `.env.local` の `NEXT_PUBLIC_*` 全部
- [ ] `app/globals.css` の `:root` 配色
- [ ] `app/components/ViBotAvatar.tsx` キャラ
- [ ] `app/lp/page.tsx` のテキスト
- [ ] `app/layout.tsx` の metadata
- [ ] `data/knowledge.md` の規程・FAQ
- [ ] `lib/regChunks.ts` の REG_NAMES
- [ ] `app/page.tsx` の citationAnchor
- [ ] `app/api/chat/route.ts` の SYSTEM_BASE
- [ ] `app/api/line-webhook/route.ts` の SYSTEM_PROMPT / GREETING / AUTH_*
- [ ] LINE公式アカウント名・アイコン
- [ ] リッチメニュー画像・URL
- [ ] `app/privacy/page.tsx` / `app/terms/page.tsx`
- [ ] favicon（`app/favicon.ico`）

---

## 💡 上級カスタマイズ

- **業種別の効果KPI**：管理画面に「シフト交代の問い合わせ件数」等を追加
- **多言語対応**：英語・中国語・ベトナム語等
- **シングルサインオン**：Google Workspace / Microsoft Entra ID 等
- **音声入出力**：高齢者向けに音声UI
- **印刷フォーマット**：規程ビューアから PDF 出力

→ 別途見積もり。

---

## 📚 参考

- [SETUP.md](./SETUP.md) — 新規顧客セットアップ手順
- [README.md](./README.md) — テンプレ概要
- [docs/CHECKLIST.md](./docs/CHECKLIST.md) — 受注→納品WBS
