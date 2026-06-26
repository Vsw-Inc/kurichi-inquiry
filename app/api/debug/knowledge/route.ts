/**
 * デバッグ用：knowledge.md が読めているか確認。
 * 本番で /api/debug/knowledge を叩いて状況を見る。
 */
import { loadKnowledge } from "../../../../lib/loadKnowledge";
import { splitIntoChunks } from "../../../../lib/regChunks";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result: any = {
    cwd: process.cwd(),
    timestamp: new Date().toISOString(),
  };

  // 各候補パスの存在確認
  const candidates = [
    path.join(process.cwd(), "data", "knowledge.md"),
    path.join(process.cwd(), "data/knowledge.md"),
    path.resolve("./data/knowledge.md"),
  ];
  result.pathChecks = await Promise.all(
    candidates.map(async (p) => {
      try {
        const stat = await fs.stat(p);
        return { path: p, exists: true, size: stat.size };
      } catch (e: any) {
        return { path: p, exists: false, error: e?.code || "unknown" };
      }
    })
  );

  // loadKnowledge() で実際に取得
  try {
    const content = await loadKnowledge();
    result.loadKnowledge = {
      length: content.length,
      head100: content.substring(0, 100),
    };
  } catch (e: any) {
    result.loadKnowledge = { error: e?.message };
  }

  // splitIntoChunks の結果
  try {
    const content = await loadKnowledge();
    const chunks = splitIntoChunks(content);
    result.chunks = {
      total: chunks.length,
      sections: Array.from(new Set(chunks.map((c) => c.id.split("-")[0]))).length,
      sample: chunks.slice(0, 3).map((c) => ({ id: c.id, reg: c.reg, chapter: c.chapter })),
    };
  } catch (e: any) {
    result.chunks = { error: e?.message };
  }

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
