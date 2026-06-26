/**
 * ブランディング設定の中央集権化。
 *
 * テンプレリポジトリとして他社展開するときは、env だけ書き換えれば
 * 主要テキスト・URL が切り替わるようにする。
 * （ロゴ・アバター・配色などは BRANDING.md を参照して個別差し替え）
 *
 * すべて NEXT_PUBLIC_ プレフィックスでクライアントからも参照可。
 */

export const BRAND = {
  // 会社情報
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "株式会社ラ・ヴィーチェ",
  companyGroupName: process.env.NEXT_PUBLIC_COMPANY_GROUP_NAME || "AMZ GROUP",
  companyShortName: process.env.NEXT_PUBLIC_COMPANY_SHORT_NAME || "La Viche",

  // サービス情報
  serviceName: process.env.NEXT_PUBLIC_SERVICE_NAME || "コンシェルジュ",
  serviceFullName: process.env.NEXT_PUBLIC_SERVICE_FULL_NAME || "La Viche Concierge",
  serviceTagline:
    process.env.NEXT_PUBLIC_SERVICE_TAGLINE ||
    "社内ルールAI先輩。規程を読んで、24時間優しく答えてくれる。",

  // AI アシスタント名
  assistantName: process.env.NEXT_PUBLIC_ASSISTANT_NAME || "ヴィーチェさん",
  assistantRole:
    process.env.NEXT_PUBLIC_ASSISTANT_ROLE || "La Viche / 3年目スタッフ",
  assistantPersonality:
    process.env.NEXT_PUBLIC_ASSISTANT_PERSONALITY ||
    "親しみやすい先輩。敬語ベースだが堅すぎない口調。",
  assistantGreeting:
    process.env.NEXT_PUBLIC_ASSISTANT_GREETING ||
    "こんにちは、ヴィーチェです。",

  // 開発・提供元
  developerCompany: process.env.NEXT_PUBLIC_DEVELOPER_COMPANY || "Vsw株式会社",
  developerShort: process.env.NEXT_PUBLIC_DEVELOPER_SHORT || "Vsw Inc.",

  // 外部リンク
  officialSiteUrl:
    process.env.NEXT_PUBLIC_OFFICIAL_SITE_URL || "https://la-viche.com/",
  academyUrl:
    process.env.NEXT_PUBLIC_ACADEMY_URL ||
    "https://laviche-academy.web.app/login.html",
  supportPhone:
    process.env.NEXT_PUBLIC_SUPPORT_PHONE || "029-856-7811",
  lineFriendUrl:
    process.env.NEXT_PUBLIC_LINE_FRIEND_URL ||
    "https://line.me/R/ti/p/@923fsjxp",
  lineAccountId: process.env.NEXT_PUBLIC_LINE_ACCOUNT_ID || "@923fsjxp",
  lineAccountName:
    process.env.NEXT_PUBLIC_LINE_ACCOUNT_NAME || "株式会社ラビーチェ",

  // ブランドカラー（CSS変数で使用・参考表示用）
  colorAccent: process.env.NEXT_PUBLIC_BRAND_COLOR_ACCENT || "#b0883c",
  colorAccentDeep:
    process.env.NEXT_PUBLIC_BRAND_COLOR_ACCENT_DEEP || "#8a6d38",
  colorBg: process.env.NEXT_PUBLIC_BRAND_COLOR_BG || "#faf8f3",
  colorInk: process.env.NEXT_PUBLIC_BRAND_COLOR_INK || "#2a2520",
} as const;

/**
 * ヘルパー：「会社名/サービス名/ブランド名」の表示テキスト。
 * 例：「ラ・ヴィーチェ コンシェルジュ」
 */
export function brandTitle(): string {
  return `${BRAND.companyShortName} ${BRAND.serviceName}`;
}

/**
 * ヘルパー：プレスフッターの著作権表記。
 * 例：「© 2026 La Viche / AMZ GROUP — Built by Vsw Inc.」
 */
export function brandFooterText(year = 2026): string {
  return `© ${year} ${BRAND.companyShortName} / ${BRAND.companyGroupName} — Built by ${BRAND.developerShort}`;
}
