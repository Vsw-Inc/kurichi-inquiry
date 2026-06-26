/**
 * Supabase chat_logs テーブルへのログ書き込み・読み取り。
 *
 * テーブル未作成・Supabase 障害時もアプリは落とさない（fire-and-forget）。
 * 書き込み失敗は console.warn のみで握りつぶす。
 */

export type ChatLogInsert = {
  user_id: string;
  user_name?: string | null;
  user_source?: string | null;
  question: string;
  answer_preview?: string | null;
  citation?: string | null;
  filtered?: boolean;
  filter_label?: string | null;
  rate_limited?: boolean;
  duration_ms?: number | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_tokens?: number | null;
  cache_read_tokens?: number | null;
};

// Claude Sonnet 4.5 料金（USD / 1M tokens）
export const PRICING = {
  input: 3.0,
  output: 15.0,
  cacheWrite: 3.75,
  cacheRead: 0.3,
};
export const USD_JPY = 155; // 円換算レート（概算）

/** トークン数からコスト（USD）を計算 */
export function calcCostUsd(t: {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_tokens?: number | null;
  cache_read_tokens?: number | null;
}): number {
  return (
    ((t.input_tokens || 0) * PRICING.input +
      (t.output_tokens || 0) * PRICING.output +
      (t.cache_creation_tokens || 0) * PRICING.cacheWrite +
      (t.cache_read_tokens || 0) * PRICING.cacheRead) /
    1_000_000
  );
}

export type ChatLogRow = ChatLogInsert & {
  id: number;
  created_at: string;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

/**
 * 質問ログを記録（fire-and-forget）。
 * 戻り値を await しなくても良い設計。エラー時は console.warn のみ。
 */
export async function logChat(row: ChatLogInsert): Promise<void> {
  const cfg = getSupabaseConfig();
  if (!cfg) return; // Supabase 未設定なら無視

  try {
    const res = await fetch(`${cfg.url}/rest/v1/chat_logs`, {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.warn("[chatLog] insert failed:", res.status, txt);
    }
  } catch (e: any) {
    console.warn("[chatLog] error:", e?.message ?? e);
  }
}

/**
 * 最新の質問ログを取得（管理画面用）。
 */
export async function fetchRecentLogs(limit = 50): Promise<ChatLogRow[]> {
  const cfg = getSupabaseConfig();
  if (!cfg) return [];

  try {
    const url = `${cfg.url}/rest/v1/chat_logs?select=*&order=created_at.desc&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn("[chatLog] fetch failed:", res.status);
      return [];
    }
    return (await res.json()) as ChatLogRow[];
  } catch (e: any) {
    console.warn("[chatLog] fetch error:", e?.message ?? e);
    return [];
  }
}

/**
 * 指定ユーザーの質問履歴を取得（管理画面ユーザー詳細用）。
 */
export async function fetchUserLogs(
  userId: string,
  limit = 200
): Promise<ChatLogRow[]> {
  const cfg = getSupabaseConfig();
  if (!cfg) return [];
  try {
    const url = `${cfg.url}/rest/v1/chat_logs?select=*&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as ChatLogRow[];
  } catch {
    return [];
  }
}

/**
 * 指定ユーザーの質問件数を取得（軽量カウント）。
 */
export async function fetchUserQuestionCount(userId: string): Promise<number> {
  const cfg = getSupabaseConfig();
  if (!cfg) return 0;
  try {
    const url = `${cfg.url}/rest/v1/chat_logs?select=id&user_id=eq.${encodeURIComponent(userId)}&limit=1`;
    const res = await fetch(url, {
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        Prefer: "count=exact",
      },
      cache: "no-store",
    });
    const range = res.headers.get("content-range");
    if (!range) return 0;
    const m = range.match(/\/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  } catch {
    return 0;
  }
}

export type ChatStats = {
  total: number;
  today: number;
  filtered: number;
  uniqueUsers: number;
  costUsdTotal: number;
  costJpyTotal: number;
  costJpyToday: number;
  tokensTotal: number;
  avgCostJpy: number;
  // コスト内訳（円・累計）
  costBreakdownJpy: {
    input: number;
    output: number;
    cacheWrite: number;
    cacheRead: number;
  };
  // 日別推移（過去7日・古い順）
  daily: Array<{ label: string; costJpy: number; count: number }>;
};

/**
 * 統計情報を取得（管理画面用）。
 * 全ログを1回取得して JS 側で集計（数千件まで実用範囲）。
 */
export async function fetchStats(): Promise<ChatStats> {
  const empty: ChatStats = {
    total: 0,
    today: 0,
    filtered: 0,
    uniqueUsers: 0,
    costUsdTotal: 0,
    costJpyTotal: 0,
    costJpyToday: 0,
    tokensTotal: 0,
    avgCostJpy: 0,
    costBreakdownJpy: { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 },
    daily: [],
  };
  const cfg = getSupabaseConfig();
  if (!cfg) return empty;

  try {
    // 今日（JST 0時以降）の境界
    const jstToday = new Date();
    jstToday.setUTCHours(15, 0, 0, 0); // JST 0:00 = UTC 15:00（前日）
    if (jstToday.getTime() > Date.now()) {
      jstToday.setUTCDate(jstToday.getUTCDate() - 1);
    }
    const todayMs = jstToday.getTime();

    // 全ログ取得（集計用フィールドのみ）
    const res = await fetch(
      `${cfg.url}/rest/v1/chat_logs?select=user_id,filtered,created_at,input_tokens,output_tokens,cache_creation_tokens,cache_read_tokens&limit=10000`,
      {
        headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return empty;
    const rows = (await res.json()) as any[];

    let today = 0;
    let filtered = 0;
    let costUsdTotal = 0;
    let costUsdToday = 0;
    let tokensTotal = 0;
    const users = new Set<string>();
    // コスト内訳（USD）
    const bd = { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 };
    // 日別マップ（JST日付 → {cost(USD), count}）
    const dailyMap = new Map<string, { cost: number; count: number }>();

    const jstDateLabel = (iso: string) => {
      const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000); // UTC→JST
      return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
    };

    for (const r of rows) {
      users.add(r.user_id);
      if (r.filtered) filtered++;
      const c = calcCostUsd(r);
      costUsdTotal += c;
      bd.input += ((r.input_tokens || 0) * PRICING.input) / 1_000_000;
      bd.output += ((r.output_tokens || 0) * PRICING.output) / 1_000_000;
      bd.cacheWrite +=
        ((r.cache_creation_tokens || 0) * PRICING.cacheWrite) / 1_000_000;
      bd.cacheRead +=
        ((r.cache_read_tokens || 0) * PRICING.cacheRead) / 1_000_000;
      tokensTotal +=
        (r.input_tokens || 0) +
        (r.output_tokens || 0) +
        (r.cache_creation_tokens || 0) +
        (r.cache_read_tokens || 0);
      if (new Date(r.created_at).getTime() >= todayMs) {
        today++;
        costUsdToday += c;
      }
      // 日別集計
      const label = jstDateLabel(r.created_at);
      const cur = dailyMap.get(label) || { cost: 0, count: 0 };
      cur.cost += c;
      cur.count += 1;
      dailyMap.set(label, cur);
    }

    const total = rows.length;
    const costJpyTotal = costUsdTotal * USD_JPY;

    // 過去7日分の日別（古い順）
    const daily: Array<{ label: string; costJpy: number; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() + 9 * 3600 * 1000 - i * 86400 * 1000);
      const label = `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
      const v = dailyMap.get(label);
      daily.push({
        label,
        costJpy: v ? v.cost * USD_JPY : 0,
        count: v ? v.count : 0,
      });
    }

    return {
      total,
      today,
      filtered,
      uniqueUsers: users.size,
      costUsdTotal,
      costJpyTotal,
      costJpyToday: costUsdToday * USD_JPY,
      tokensTotal,
      avgCostJpy: total > 0 ? costJpyTotal / total : 0,
      costBreakdownJpy: {
        input: bd.input * USD_JPY,
        output: bd.output * USD_JPY,
        cacheWrite: bd.cacheWrite * USD_JPY,
        cacheRead: bd.cacheRead * USD_JPY,
      },
      daily,
    };
  } catch (e: any) {
    console.warn("[chatLog] stats error:", e?.message ?? e);
    return empty;
  }
}
