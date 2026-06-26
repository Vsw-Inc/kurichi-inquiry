import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "クリチちゃん Inquiry AI — by Vsw株式会社",
  description:
    "NY発・大阪生まれのクリームチーズバーガー「#クリチ」公式のAI問い合わせコンシェルジュ。24時間自動応答＋営業連携。",
  openGraph: {
    title: "クリチちゃん Inquiry AI",
    description: "#クリチ公式 お問い合わせAIコンシェルジュ",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&family=Cormorant+Garamond:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
