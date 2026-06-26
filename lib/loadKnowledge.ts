import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

let cached: string | null = null;

/**
 * 規程データを取得する。優先順位：
 * 1. Supabase Storage（東京リージョン）+ KNOWLEDGE_KEY で復号化
 *    → 本番想定：データが日本国内に物理保管される
 * 2. data/knowledge.md.enc（GitHub commit済）+ KNOWLEDGE_KEY で復号化
 *    → fallback：Supabase 障害時 / Supabase 未設定時
 * 3. data/knowledge.md（ローカル平文・gitignore済）
 *    → 開発時 fallback
 *
 * 起動後にキャッシュ。ファイル変更時はサーバー再起動が必要。
 */
export async function loadKnowledge(): Promise<string> {
  if (cached !== null) return cached;

  const key = process.env.KNOWLEDGE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const supabaseBucket = process.env.SUPABASE_BUCKET || "knowledge";
  const supabaseFile = process.env.SUPABASE_FILE || "knowledge.md.enc";

  // 1. Supabase Storage から取得（最優先・日本国内）
  if (supabaseUrl && supabaseKey && key) {
    try {
      const url = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${supabaseBucket}/${supabaseFile}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${supabaseKey}` },
        // Vercel edge cache を避けるため
        cache: "no-store",
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const dec = decryptBlob(buf, key);
        if (dec) {
          cached = dec;
          return cached;
        }
      } else {
        console.warn(
          "[loadKnowledge] Supabase fetch failed:",
          res.status,
          res.statusText
        );
      }
    } catch (e: any) {
      console.warn("[loadKnowledge] Supabase fetch error:", e?.message ?? e);
    }
  }

  const cwd = process.cwd();
  const encPath = path.join(cwd, "data", "knowledge.md.enc");
  const plainPath = path.join(cwd, "data", "knowledge.md");

  // 2. ローカル/Git の .enc を復号化（Supabase fallback）
  if (key) {
    try {
      const blob = await fs.readFile(encPath);
      const dec = decryptBlob(blob, key);
      if (dec) {
        cached = dec;
        return cached;
      }
    } catch {}
  }

  // 3. 平文ファイル（dev fallback）
  try {
    cached = await fs.readFile(plainPath, "utf-8");
    return cached;
  } catch {}

  cached = "";
  return cached;
}

function decryptBlob(blob: Buffer, keyHex: string): string | null {
  try {
    const iv = blob.subarray(0, 12);
    const tag = blob.subarray(12, 28);
    const enc = blob.subarray(28);
    const keyBuf = Buffer.from(keyHex, "hex");
    if (keyBuf.length !== 32) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuf, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return dec.toString("utf-8");
  } catch (e: any) {
    console.error("[loadKnowledge] decrypt failed:", e?.message ?? e);
    return null;
  }
}
