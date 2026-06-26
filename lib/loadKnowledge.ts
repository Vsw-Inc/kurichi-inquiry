import fs from "node:fs/promises";
import path from "node:path";

let cached: string | null = null;

/**
 * 平文 knowledge.md を読み込む。
 * 機密度が低いため暗号化せず、リポジトリ内に直接保持する。
 * 起動後にキャッシュ。
 */
export async function loadKnowledge(): Promise<string> {
  if (cached !== null) return cached;
  const cwd = process.cwd();
  const plainPath = path.join(cwd, "data", "knowledge.md");
  try {
    cached = await fs.readFile(plainPath, "utf-8");
    return cached;
  } catch {
    cached = "";
    return cached;
  }
}
