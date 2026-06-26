import fs from "node:fs/promises";
import path from "node:path";

let cached: string | null = null;

/**
 * 平文 knowledge.md を読み込む。
 * Vercel Serverless でも data/ がバンドルされるよう、
 * next.config.mjs の outputFileTracingIncludes で data/** を含める。
 *
 * フォールバックとして複数パスを試す（環境差異吸収）。
 */
export async function loadKnowledge(): Promise<string> {
  if (cached !== null) return cached;

  const candidates = [
    path.join(process.cwd(), "data", "knowledge.md"),
    path.join(process.cwd(), "data/knowledge.md"),
    // Vercel Serverless での relative resolution用
    path.resolve("./data/knowledge.md"),
  ];

  for (const p of candidates) {
    try {
      const content = await fs.readFile(p, "utf-8");
      if (content && content.length > 0) {
        cached = content;
        return cached;
      }
    } catch {
      // 次の候補を試す
    }
  }

  console.warn("[loadKnowledge] knowledge.md not found in any candidate path");
  cached = "";
  return cached;
}
