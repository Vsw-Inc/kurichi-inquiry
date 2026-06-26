/**
 * knowledge.md を「セクション × 章」単位のチャンクに分割するRAGユーティリティ。
 * クリチ向けにシンプル化。
 */

export type Chunk = {
  id: string;
  reg: string;
  chapter: string;
  body: string;
};

const SECTION_NAMES: { pattern: RegExp; name: string; no: string }[] = [
  { pattern: /001\s*ブランド概要/, name: "ブランド概要", no: "001" },
  { pattern: /002\s*店舗.?営業情報/, name: "店舗・営業情報", no: "002" },
  { pattern: /003\s*メニュー.?価格/, name: "メニュー・価格", no: "003" },
  { pattern: /004\s*卸.?取引相談/, name: "卸・取引相談", no: "004" },
  { pattern: /005\s*取材.?コラボ.?メディア/, name: "取材・コラボ・メディア", no: "005" },
  { pattern: /006\s*イベント出店.?移動販売/, name: "イベント・移動販売", no: "006" },
  { pattern: /007\s*SNS.?公式情報/, name: "SNS・公式情報", no: "007" },
  { pattern: /008\s*よくある質問|FAQ/, name: "FAQ", no: "008" },
];

export function splitIntoChunks(knowledge: string): Chunk[] {
  const lines = knowledge.split("\n");
  const chunks: Chunk[] = [];

  type Block = { regName: string; regNo: string; lines: string[] };
  const blocks: Block[] = [];
  let cur: Block | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      const heading = line.replace(/^##\s*/, "").trim();
      const matched = SECTION_NAMES.find((r) => r.pattern.test(heading));
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

  for (const block of blocks) {
    let chapTitle = "概要";
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
      const q = line.match(/^###\s*(Q\d+\..*?)$/);
      if (m) {
        flush();
        chapIdx++;
        chapTitle = `第${m[1]}章 ${m[2].trim()}`.trim();
        chapBody = [];
      } else if (q) {
        flush();
        chapIdx++;
        chapTitle = q[1].trim();
        chapBody = [];
      } else {
        chapBody.push(line);
      }
    }
    flush();
  }

  return chunks;
}

export function buildTOC(chunks: Chunk[]): string {
  return chunks.map((c) => `[${c.id}] ${c.reg} / ${c.chapter}`).join("\n");
}

export function pickChunks(chunks: Chunk[], ids: string[]): string {
  const set = new Set(ids);
  const picked = chunks.filter((c) => set.has(c.id));
  return picked.map((c) => c.body).join("\n\n---\n\n");
}
