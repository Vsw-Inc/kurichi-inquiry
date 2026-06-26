/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercel Serverless 関数に data/ ディレクトリを含める
  // （knowledge.md など fs.readFile で参照するファイル）
  outputFileTracingIncludes: {
    "/admin/knowledge": ["./data/**/*"],
    "/api/line-webhook": ["./data/**/*"],
  },
};

export default nextConfig;
