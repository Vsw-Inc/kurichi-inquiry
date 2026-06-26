/**
 * 規程を「規程 × 章」単位のチャンクに分割する。
 * RAG（関連章だけをAIに渡す）のためのユーティリティ。
 */

export type Chunk = {
  id: string; // 例 "001-3"
  reg: string; // 規程名（例「パート・アルバイト就業規則」）
  chapter: string; // 章見出し（例「第4章 勤務」）
  body: string; // 章本文
};

const REG_NAMES: { pattern: RegExp; name: string; no: string }[] = [
  { pattern: /001\s*就業規則/, name: "就業規則", no: "001" },
  { pattern: /002\s*給与規程/, name: "給与規程", no: "002" },
  { pattern: /003\s*パート.?アルバイト就業規則/, name: "パート・アルバイト就業規則", no: "003" },
  { pattern: /004\s*育児介護休業規程/, name: "育児介護休業規程", no: "004" },
  { pattern: /005\s*慶弔見舞金規程/, name: "慶弔見舞金規程", no: "005" },
  { pattern: /006\s*総務マニュアル/, name: "総務マニュアル", no: "006" },
  { pattern: /007\s*エニタイム業務FAQ/, name: "エニタイム業務FAQ", no: "007" },
  { pattern: /008\s*SOELU店舗運用FAQ/, name: "SOELU店舗運用FAQ", no: "008" },
];

/**
 * knowledge.md 全文を章チャンクに分割。
 */
export function splitIntoChunks(knowledge: string): Chunk[] {
  const lines = knowledge.split("\n");
  const chunks: Chunk[] = [];

  // まず "## " で規程ブロックに分割
  type Block = { regName: string; regNo: string; lines: string[] };
  const blocks: Block[] = [];
  let cur: Block | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      const heading = line.replace(/^##\s*/, "").trim();
      const matched = REG_NAMES.find((r) => r.pattern.test(heading));
      cur = {
        regName: matched ? matched.name : heading,
        regNo: matched ? matched.no : String(blocks.length + 1).padStart(3, "0"),
        lines: [],
      };
      blocks.push(cur);
    } else if (cur) {
      cur.lines.push(line);
    }
  }

  // 各規程ブロックを「第X章」で章分割
  for (const block of blocks) {
    let chapTitle = "総則";
    let chapBody: string[] = [];
    let chapIdx = 0;

    const flush = () => {
      const body = chapBody.join("\n").trim();
      if (body) {
        chunks.push({
          id: `${block.regNo}-${chapIdx}`,
          reg: block.regName,
          chapter: chapTitle,
          body: `【${block.regName} ${chapTitle}】\n${body}`,
        });
      }
    };

    for (const line of block.lines) {
      const m = line.match(/^第\s*([０-９0-9一二三四五六七八九十]+)\s*章\s*(.*)$/);
      if (m) {
        flush();
        chapIdx++;
        chapTitle = `第${m[1]}章 ${m[2].trim()}`.trim();
        chapBody = [];
      } else {
        chapBody.push(line);
      }
    }
    flush();
  }

  return chunks;
}

/**
 * チャンク一覧から「目次（ルーティング用）」テキストを生成。
 * AIが「どの章を見るべきか」を判定するための軽量データ。
 */
export function buildTOC(chunks: Chunk[]): string {
  return chunks.map((c) => `[${c.id}] ${c.reg} / ${c.chapter}`).join("\n");
}

/**
 * 指定IDのチャンク本文を結合。
 */
export function pickChunks(chunks: Chunk[], ids: string[]): string {
  const set = new Set(ids);
  const picked = chunks.filter((c) => set.has(c.id));
  return picked.map((c) => c.body).join("\n\n---\n\n");
}
