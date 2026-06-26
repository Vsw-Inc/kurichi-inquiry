#!/usr/bin/env node
/**
 * 規程ファイル data/knowledge.md を AES-256-GCM で暗号化し、
 * data/knowledge.md.enc を生成する。
 * 復号化キーは新規発行されて stdout に出力されるので、
 * Vercel 環境変数 KNOWLEDGE_KEY に設定する。
 *
 * Usage:
 *   node scripts/encrypt-knowledge.mjs              # 新キーを発行して暗号化
 *   KEY=xxx node scripts/encrypt-knowledge.mjs     # 既存キーで再暗号化
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "data", "knowledge.md");
const DST = path.join(ROOT, "data", "knowledge.md.enc");

async function main() {
  const plaintext = await fs.readFile(SRC);

  // 既存キーが指定されていればそれを使用、なければ新規発行
  let key;
  if (process.env.KEY) {
    key = Buffer.from(process.env.KEY, "hex");
    if (key.length !== 32) {
      console.error("ERROR: KEY must be 32 bytes (64 hex chars)");
      process.exit(1);
    }
  } else {
    key = crypto.randomBytes(32);
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  // 形式: [12 bytes IV][16 bytes Auth Tag][暗号文]
  const out = Buffer.concat([iv, tag, enc]);
  await fs.writeFile(DST, out);

  console.log("✓ Encrypted:", path.relative(ROOT, DST));
  console.log("  Original size :", plaintext.length, "bytes");
  console.log("  Encrypted size:", out.length, "bytes");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("KNOWLEDGE_KEY=" + key.toString("hex"));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("次の手順：");
  console.log("1. 上記 KNOWLEDGE_KEY の値をコピー");
  console.log("2. Vercel ダッシュボード → Settings → Environment Variables");
  console.log("3. Name: KNOWLEDGE_KEY / Value: 上記の hex 文字列");
  console.log("4. Production / Preview / Development すべてにチェック");
  console.log("5. Save → 次のデプロイから有効");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
