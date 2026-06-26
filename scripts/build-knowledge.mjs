#!/usr/bin/env node
/**
 * data/knowledge.md を lib/knowledgeText.ts として生成する。
 *
 * Vercel Serverless では fs.readFile が data/ をバンドルに含めない問題があるため、
 * ビルド前にTypeScriptモジュールに変換することで確実にバンドルさせる。
 *
 * 実行：
 *   node scripts/build-knowledge.mjs
 *
 * 自動実行：package.json の prebuild フックで毎ビルド時に実行。
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "data", "knowledge.md");
const DST = path.join(ROOT, "lib", "knowledgeText.ts");

async function main() {
  const md = await fs.readFile(SRC, "utf-8");
  // バックティック・バックスラッシュ・${ をエスケープ
  const escaped = md
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");

  const out = `/**
 * 自動生成ファイル — 編集禁止
 * 生成元：data/knowledge.md
 * スクリプト：scripts/build-knowledge.mjs
 * 生成日時：${new Date().toISOString()}
 */
export const KNOWLEDGE_TEXT = \`${escaped}\`;
`;
  await fs.writeFile(DST, out);
  console.log(`✓ ${path.relative(ROOT, DST)} 生成完了（${md.length} chars）`);
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
