/**
 * knowledge.md を「セクション × 章/Q&A」単位のチャンクに分割するRAGユーティリティ。
 *
 * 入力フォーマット（クリチ正式版）：
 *   # 1. ブランド基本情報         ← セクション（regNo=1）
 *   ## 1-1. ブランド名            ← サブ章
 *   ## 1-2. #クリチとは          ← サブ章
 *
 *   # 16. よくある質問と回答      ← セクション
 *   ## Q1. #クリチって何ですか？  ← Q&A 章
 *   ## Q2. 普通のハンバーガーですか？
 *
 *   # 23. 代表的な短文回答集      ← セクション
 *   ## #クリチとは？              ← 章（番号なし）
 */

export type Chunk = {
  id: string;       // 例 "001-2"
  reg: string;      // セクション名
  chapter: string;  // 章タイトル
  body: string;     // 章本文
};

/**
 * knowledge.md 全文を章チャンクに分割。
 */
export function splitIntoChunks(knowledge: string): Chunk[] {
  const lines = knowledge.split("\n");
  const chunks: Chunk[] = [];

  type Block = { regName: string; regNo: string; lines: string[] };
  const blocks: Block[] = [];
  let cur: Block | null = null;

  for (const line of lines) {
    const m1 = line.match(/^#\s+(\d+)\.\s*(.+?)\s*$/); // "# 1. タイトル"
    const m2 = line.match(/^##\s+(.+?)\s*$/);          // "## サブヘッダ"

    if (m1) {
      const regNo = String(parseInt(m1[1], 10)).padStart(3, "0");
      cur = { regName: m1[2].trim(), regNo, lines: [] };
      blocks.push(cur);
    } else if (cur) {
      cur.lines.push(line);
    } else if (m2) {
      // セクション宣言前の見出し（章0など）→ "## 0. このRAGの目的" は ## なのでここに来る
      // セクション未定義の場合は黙って無視（または最初のサブとして取り込む）
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
      // "## 1-1. サブタイトル"
      const subSec = line.match(/^##\s+(\d+-\d+)\.\s*(.+?)\s*$/);
      // "## Q1. 質問文"（FAQ）
      const qaHead = line.match(/^##\s+(Q\d+)\.\s*(.+?)\s*$/);
      // "## 任意のタイトル"（番号なし、短文集など）
      const plainSub = line.match(/^##\s+(.+?)\s*$/);

      if (subSec) {
        flush();
        chapIdx++;
        chapTitle = `${subSec[1]} ${subSec[2].trim()}`;
        chapBody = [];
        continue;
      }
      if (qaHead) {
        flush();
        chapIdx++;
        chapTitle = `${qaHead[1]} ${qaHead[2].trim()}`;
        chapBody = [];
        continue;
      }
      if (plainSub) {
        flush();
        chapIdx++;
        chapTitle = plainSub[1].trim();
        chapBody = [];
        continue;
      }
      chapBody.push(line);
    }
    flush();
  }

  return chunks;
}

/** AI ルーター用：[id] セクション / 章タイトル の目次文字列。 */
export function buildTOC(chunks: Chunk[]): string {
  return chunks.map((c) => `[${c.id}] ${c.reg} / ${c.chapter}`).join("\n");
}

/** 指定IDのチャンク本文を結合（RAG コンテキスト用）。 */
export function pickChunks(chunks: Chunk[], ids: string[]): string {
  const set = new Set(ids);
  const picked = chunks.filter((c) => set.has(c.id));
  return picked.map((c) => c.body).join("\n\n---\n\n");
}
