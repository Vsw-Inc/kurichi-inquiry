/**
 * レート制限（Supabase 永続化版）。
 * chat_logs テーブルの直近リクエスト数でカウントするため、
 * Vercel の複数 Lambda インスタンス間でも一貫して効く。
 *
 * 制限：
 *   - 1分間に 10回まで
 *   - 1日（24h）に 100回まで
 *
 * Supabase 未設定時（ローカル開発）は素通り。
 */

const PER_MINUTE_LIMIT = 10;
const PER_DAY_LIMIT = 100;
const MIN_WINDOW_MS = 60 * 1000;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: "per_minute" | "per_day"; retryAfterSec: number };

function getCfg() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

async function countSince(
  cfg: { url: string; key: string },
  userId: string,
  sinceIso: string
): Promise<number> {
  const res = await fetch(
    `${cfg.url}/rest/v1/chat_logs?select=id&user_id=eq.${encodeURIComponent(
      userId
    )}&created_at=gte.${encodeURIComponent(sinceIso)}`,
    {
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        Prefer: "count=exact",
        Range: "0-0",
      },
      cache: "no-store",
    }
  );
  // Content-Range: 0-0/42 の 42 が総件数
  const cr = res.headers.get("content-range");
  if (cr && cr.includes("/")) {
    const n = parseInt(cr.split("/")[1], 10);
    if (!isNaN(n)) return n;
  }
  return 0;
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const cfg = getCfg();
  if (!cfg) return { ok: true }; // ローカル開発時は素通り

  try {
    const now = Date.now();
    const minAgo = new Date(now - MIN_WINDOW_MS).toISOString();
    const dayAgo = new Date(now - DAY_WINDOW_MS).toISOString();

    const [minCount, dayCount] = await Promise.all([
      countSince(cfg, userId, minAgo),
      countSince(cfg, userId, dayAgo),
    ]);

    if (minCount >= PER_MINUTE_LIMIT) {
      return { ok: false, reason: "per_minute", retryAfterSec: 60 };
    }
    if (dayCount >= PER_DAY_LIMIT) {
      return { ok: false, reason: "per_day", retryAfterSec: 3600 };
    }
    return { ok: true };
  } catch (e: any) {
    // 障害時は素通り（可用性優先）。乱用は管理画面で検知。
    console.warn("[rateLimit] error, allowing:", e?.message ?? e);
    return { ok: true };
  }
}
