#!/usr/bin/env node
/**
 * 暗号化された規程 data/knowledge.md.enc を
 * Supabase Storage（東京リージョン）にアップロードする。
 *
 * 事前準備：
 *   .env.local に以下を設定
 *     SUPABASE_URL=https://xxx.supabase.co
 *     SUPABASE_SERVICE_KEY=eyJ...（service_role key）
 *     SUPABASE_BUCKET=knowledge（任意）
 *
 *   Supabase ダッシュボードで Storage → bucket 作成
 *     名前: knowledge / Public: OFF（プライベート）
 *
 * Usage:
 *   node scripts/upload-knowledge.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// .env.local を簡易ロード
async function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  try {
    const raw = await fs.readFile(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim();
      }
    }
  } catch {}
}

async function main() {
  await loadEnv();

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const bucket = process.env.SUPABASE_BUCKET || "knowledge";
  const filename = process.env.SUPABASE_FILE || "knowledge.md.enc";

  if (!url || !key) {
    console.error("ERROR: SUPABASE_URL と SUPABASE_SERVICE_KEY を .env.local に設定してください");
    console.error("");
    console.error("Supabase ダッシュボード → Settings → API から取得：");
    console.error("  - Project URL");
    console.error("  - service_role secret key");
    process.exit(1);
  }

  const encPath = path.join(ROOT, "data", "knowledge.md.enc");
  const data = await fs.readFile(encPath);
  console.log(`Source: ${path.relative(ROOT, encPath)} (${data.length} bytes)`);

  // bucket 存在確認 + 作成
  const baseUrl = url.replace(/\/$/, "");
  console.log(`Target: ${baseUrl}/storage/v1/object/${bucket}/${filename}`);

  // bucket 一覧
  const listRes = await fetch(`${baseUrl}/storage/v1/bucket`, {
    headers: { Authorization: `Bearer ${key}`, apikey: key },
  });
  if (!listRes.ok) {
    console.error("ERROR: Bucket list failed:", listRes.status, await listRes.text());
    process.exit(1);
  }
  const buckets = await listRes.json();
  const exists = Array.isArray(buckets) && buckets.some((b) => b.name === bucket);

  if (!exists) {
    console.log(`Creating bucket "${bucket}" (private)...`);
    const createRes = await fetch(`${baseUrl}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: bucket, name: bucket, public: false }),
    });
    if (!createRes.ok) {
      console.error("ERROR: Bucket create failed:", createRes.status, await createRes.text());
      process.exit(1);
    }
    console.log("✓ Bucket created");
  } else {
    console.log(`✓ Bucket "${bucket}" already exists`);
  }

  // ファイルアップロード（upsert）
  const uploadRes = await fetch(
    `${baseUrl}/storage/v1/object/${bucket}/${filename}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/octet-stream",
        "x-upsert": "true",
      },
      body: data,
    }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    console.error("ERROR: Upload failed:", uploadRes.status, errText);
    process.exit(1);
  }

  const result = await uploadRes.json();
  console.log("");
  console.log("✓ Upload successful:", result);
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("次の手順：");
  console.log("");
  console.log("1. Vercel 環境変数に以下を追加：");
  console.log(`   SUPABASE_URL=${url}`);
  console.log(`   SUPABASE_SERVICE_KEY=${key.substring(0, 20)}...`);
  console.log(`   SUPABASE_BUCKET=${bucket}`);
  console.log("");
  console.log("2. Vercel で再デプロイ");
  console.log("");
  console.log("3. https://laviche-concierge.vercel.app/ で動作確認");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
