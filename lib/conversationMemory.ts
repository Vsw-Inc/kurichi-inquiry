/**
 * クリチBot 会話記憶（Phase A）
 *
 * - LINE user_id ごとに「要約情報」のみ保存
 * - 生ログは chat_logs に別途記録される
 * - Supabase未設定時は何もしない（fire-and-forget）
 * - 表示文に個人情報を出しすぎないこと（呼び出し側で抑制）
 */
import type Anthropic from "@anthropic-ai/sdk";

const TABLE = "line_conversations";

function endpoint() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function headers(key: string, extra: Record<string, string> = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export type ConversationMemory = {
  user_id: string;
  user_type?: string | null;
  name?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  interest?: string | null;
  last_topic?: string | null;
  requested_quantity?: string | null;
  desired_date?: string | null;
  location?: string | null;
  preferred_contact?: string | null;
  important_notes?: string[] | null;
  handoff_required?: boolean;
  handoff_category?: string | null;
  handoff_priority?: string | null;
  last_summary?: string | null;
  message_count?: number;
  first_contacted_at?: string | null;
  last_contacted_at?: string | null;
};

/** 既存の記憶を取得（無ければ null）。 */
export async function getMemory(
  userId: string
): Promise<ConversationMemory | null> {
  const ep = endpoint();
  if (!ep || !userId) return null;
  try {
    const url = `${ep.url}/rest/v1/${TABLE}?user_id=eq.${encodeURIComponent(
      userId
    )}&limit=1`;
    const r = await fetch(url, {
      headers: headers(ep.key),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const rows = (await r.json()) as ConversationMemory[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * upsert 形式で記憶を保存。
 * 既存があれば PATCH、無ければ INSERT。
 * 引数の null/undefined は無視（既存値を保持）。
 */
export async function upsertMemory(
  userId: string,
  updates: Partial<ConversationMemory>
): Promise<void> {
  const ep = endpoint();
  if (!ep || !userId) return;
  try {
    const clean: any = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined) continue;
      if (v === null) continue;
      if (typeof v === "string" && v.trim() === "") continue;
      clean[k] = v;
    }
    clean.user_id = userId;
    clean.last_contacted_at = new Date().toISOString();
    clean.updated_at = new Date().toISOString();

    const url = `${ep.url}/rest/v1/${TABLE}?on_conflict=user_id`;
    const r = await fetch(url, {
      method: "POST",
      headers: headers(ep.key, {
        Prefer: "resolution=merge-duplicates,return=minimal",
      }),
      body: JSON.stringify(clean),
    });
    if (!r.ok) {
      console.warn("[conversationMemory.upsert] failed:", r.status);
    }
  } catch (e: any) {
    console.warn("[conversationMemory.upsert] error:", e?.message ?? e);
  }
}

/**
 * AIプロンプト用：記憶を自然な文章で要約。
 * 個人情報をそのまま並べないため、必要最低限の文脈だけ提示。
 */
export function memoryToSystemHint(mem: ConversationMemory | null): string {
  if (!mem) return "";
  const lines: string[] = [];
  if (mem.user_type && mem.user_type !== "不明") {
    lines.push(`ユーザー区分：${mem.user_type}`);
  }
  if (mem.interest) lines.push(`関心：${mem.interest}`);
  if (mem.last_topic) lines.push(`前回の話題：${mem.last_topic}`);
  if (mem.requested_quantity) lines.push(`希望数量：${mem.requested_quantity}`);
  if (mem.desired_date) lines.push(`希望時期：${mem.desired_date}`);
  if (mem.location) lines.push(`場所：${mem.location}`);
  if (mem.last_summary) lines.push(`前回の要約：${mem.last_summary}`);
  if (mem.handoff_required) {
    lines.push(
      `担当者引き継ぎ中：${mem.handoff_category || "—"}（優先度 ${
        mem.handoff_priority || "—"
      }）`
    );
  }
  if (lines.length === 0) return "";
  return [
    "# 過去の会話メモ（このユーザーは過去にあなたと話している）",
    ...lines,
    "",
    "個人情報をそのまま列挙せず、自然に踏まえて返答してください。",
    "「前回はこのお話でしたね」のように軽く触れる程度でOK。",
  ].join("\n");
}

const EXTRACT_SYSTEM = `あなたはお客様サポートの記録係です。
お客様の最新メッセージと既存メモを読み、保存に値する重要情報だけJSONで返してください。

# 出力フォーマット（JSON のみ、コードブロック禁止）
{
  "user_type": "一般客 | 法人 | メディア | イベント関係者 | 不明",
  "name": "わかれば",
  "company": "わかれば",
  "email": "わかれば",
  "phone": "わかれば",
  "interest": "購入 | 卸し | 取材 | コラボ | イベント出店 | その他",
  "last_topic": "今回の話題を1行で",
  "requested_quantity": "わかれば",
  "desired_date": "わかれば",
  "location": "わかれば",
  "preferred_contact": "LINE | メール | 電話",
  "last_summary": "今回の会話の要約 1〜2文",
  "important_notes_add": ["担当者が知るべきメモがあれば（無ければ空配列）"]
}

# ルール
- 不明な項目は空文字 "" または null
- ハルシネーションしない（メッセージにない情報を勝手に作らない）
- 個人特定情報は本人が自己申告した内容のみ拾う
- last_summary は中立的に。例：「冷凍便での卸し可否を相談中」`;

/**
 * Claude（Haikuで安価）で会話から記憶を抽出。
 * 失敗時は null（既存記憶のみ維持・タイムスタンプ更新は呼び出し側で）。
 */
export async function extractMemoryUpdate(
  client: Anthropic,
  userText: string,
  botReply: string,
  existing: ConversationMemory | null
): Promise<Partial<ConversationMemory> | null> {
  try {
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: EXTRACT_SYSTEM,
      messages: [
        {
          role: "user",
          content:
            (existing
              ? `# 既存メモ\n${JSON.stringify(existing, null, 2)}\n\n`
              : "# 既存メモ\nなし\n\n") +
            `# 今回のユーザー発言\n${userText}\n\n` +
            `# AIの返答\n${botReply}`,
        },
      ],
    });
    const text =
      res.content[0] && res.content[0].type === "text"
        ? res.content[0].text.trim()
        : "";
    // コードブロック除去
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    // important_notes_add を既存に追加
    const importantNotesAdd: string[] = Array.isArray(parsed.important_notes_add)
      ? parsed.important_notes_add.filter((s: any) => typeof s === "string" && s.trim())
      : [];
    delete parsed.important_notes_add;
    const merged: Partial<ConversationMemory> = parsed;
    if (importantNotesAdd.length > 0) {
      const existingNotes = existing?.important_notes ?? [];
      merged.important_notes = [...existingNotes, ...importantNotesAdd].slice(-20);
    }
    if (typeof merged.message_count !== "number") {
      merged.message_count = (existing?.message_count ?? 0) + 1;
    }
    return merged;
  } catch (e: any) {
    console.warn("[conversationMemory.extract] failed:", e?.message ?? e);
    return null;
  }
}

/** 一覧（管理画面用）— handoff_required=true を優先表示 */
export async function listMemories(
  limit = 100
): Promise<ConversationMemory[]> {
  const ep = endpoint();
  if (!ep) return [];
  try {
    const url = `${ep.url}/rest/v1/${TABLE}?select=*&order=handoff_required.desc.nullslast,last_contacted_at.desc.nullslast&limit=${limit}`;
    const r = await fetch(url, { headers: headers(ep.key), cache: "no-store" });
    if (!r.ok) return [];
    return (await r.json()) as ConversationMemory[];
  } catch {
    return [];
  }
}
