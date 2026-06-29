/**
 * チャットログを Supabase に記録（ラ・ヴィーチェと共用テーブル）。
 * user_source="kurichi-line" / "kurichi-lead" で識別。
 *
 * Supabase 未設定時は何もしない（fire-and-forget）。
 */

type Cfg = { url: string; key: string };

function cfg(): Cfg | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function authHeaders(key: string, extra: Record<string, string> = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
    ...extra,
  };
}

export type ChatLogInsert = {
  user_id?: string;
  user_name?: string;
  user_source?: string;
  question: string;
  answer_preview?: string;
  citation?: string | null;
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_tokens?: number;
  cache_read_tokens?: number;
  duration_ms?: number;
  filtered?: boolean;
  filter_label?: string;
  rate_limited?: boolean;
};

export async function logChat(row: ChatLogInsert): Promise<void> {
  const c = cfg();
  if (!c) return;
  try {
    await fetch(`${c.url}/rest/v1/chat_logs`, {
      method: "POST",
      headers: authHeaders(c.key),
      body: JSON.stringify(row),
    });
  } catch (e: any) {
    console.warn("[chatLog] insert failed:", e?.message ?? e);
  }
}

export type ChatLogRow = ChatLogInsert & {
  id: number;
  created_at: string;
};

/** クリチ関連のチャットログを取得（直近 N 件）。 */
export async function fetchKurichiChats(limit = 50): Promise<ChatLogRow[]> {
  const c = cfg();
  if (!c) return [];
  try {
    const url =
      `${c.url}/rest/v1/chat_logs?select=*` +
      `&user_source=like.kurichi%25` +
      `&order=created_at.desc&limit=${limit}`;
    const r = await fetch(url, { headers: authHeaders(c.key), cache: "no-store" });
    if (!r.ok) return [];
    return (await r.json()) as ChatLogRow[];
  } catch {
    return [];
  }
}

/** 指定 LINE userId のチャット履歴を時系列で取得（古い順）。 */
export async function fetchChatsByUser(userId: string, limit = 200): Promise<ChatLogRow[]> {
  const c = cfg();
  if (!c) return [];
  try {
    const url =
      `${c.url}/rest/v1/chat_logs?select=*` +
      `&user_source=like.kurichi%25` +
      `&user_id=eq.${encodeURIComponent(userId)}` +
      `&order=created_at.asc&limit=${limit}`;
    const r = await fetch(url, { headers: authHeaders(c.key), cache: "no-store" });
    if (!r.ok) return [];
    return (await r.json()) as ChatLogRow[];
  } catch {
    return [];
  }
}

export type UserSummary = {
  user_id: string;
  user_name: string | null;
  last_question: string;
  last_at: string;
  message_count: number;
};

/** クリチでチャットしたユーザーのサマリ一覧（最新発言が新しい順）。 */
export async function fetchUsersList(limit = 100): Promise<UserSummary[]> {
  const c = cfg();
  if (!c) return [];
  try {
    const url =
      `${c.url}/rest/v1/chat_logs?select=user_id,user_name,question,created_at` +
      `&user_source=like.kurichi%25` +
      `&user_id=not.is.null` +
      `&order=created_at.desc&limit=1000`;
    const r = await fetch(url, { headers: authHeaders(c.key), cache: "no-store" });
    if (!r.ok) return [];
    const rows = (await r.json()) as Array<{
      user_id: string;
      user_name: string | null;
      question: string;
      created_at: string;
    }>;
    const map = new Map<string, UserSummary>();
    for (const row of rows) {
      if (!row.user_id) continue;
      const cur = map.get(row.user_id);
      if (cur) {
        cur.message_count += 1;
      } else {
        map.set(row.user_id, {
          user_id: row.user_id,
          user_name: row.user_name,
          last_question: row.question,
          last_at: row.created_at,
          message_count: 1,
        });
      }
    }
    return Array.from(map.values())
      .sort((a, b) => (a.last_at < b.last_at ? 1 : -1))
      .slice(0, limit);
  } catch {
    return [];
  }
}

/** クリチ関連のチャット件数（軽量カウント）。 */
export async function countKurichiChats(
  filter: "all" | "today" = "all"
): Promise<number> {
  const c = cfg();
  if (!c) return 0;
  try {
    let q = `${c.url}/rest/v1/chat_logs?select=id&user_source=like.kurichi%25`;
    if (filter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      q += `&created_at=gte.${today.toISOString()}`;
    }
    q += `&limit=1`;
    const r = await fetch(q, {
      headers: { ...authHeaders(c.key), Prefer: "count=exact" },
      cache: "no-store",
    });
    const range = r.headers.get("content-range");
    if (!range) return 0;
    const m = range.match(/\/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  } catch {
    return 0;
  }
}
