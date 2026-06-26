/**
 * ナレッジ取得：knowledgeText.ts（自動生成）からimportする。
 * Vercel Serverless でも確実にバンドルに含まれる。
 *
 * knowledgeText.ts は scripts/build-knowledge.mjs により data/knowledge.md から生成。
 * package.json の prebuild フックで毎ビルド自動更新される。
 */
import { KNOWLEDGE_TEXT } from "./knowledgeText";

export async function loadKnowledge(): Promise<string> {
  return KNOWLEDGE_TEXT;
}
