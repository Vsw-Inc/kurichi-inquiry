/**
 * LINE Bot ユーザー認証管理（Supabase 経由）。
 *
 * 「友だち追加だけでは質問不可。合言葉を送って認証して初めて質問可」
 * という運用を実現する。
 *
 * Supabase が未設定 or 疎通不能の場合は「全員未認証扱い」で安全側にフェイルセーフ。
 * （誤って認証情報を失っても、勝手に質問させない方を優先）
 */

const TABLE = "line_users";

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
    Prefer: "return=representation",
    ...extra,
  };
}

export type LineUser = {
  line_user_id: string;
  display_name?: string | null;
  is_verified: boolean;
  verified_at?: string | null;
  shop_code?: string | null;
  blocked?: boolean;
  blocked_reason?: string | null;
};

/**
 * 認証済みか確認。
 * - Supabase未設定 → false（安全側）
 * - レコードなし → false
 * - blocked=true → false
 */
export async function isVerified(lineUserId: string): Promise<boolean> {
  const ep = endpoint();
  if (!ep) return false;
  try {
    const url = `${ep.url}/rest/v1/${TABLE}?line_user_id=eq.${encodeURIComponent(lineUserId)}&select=is_verified,blocked&limit=1`;
    const r = await fetch(url, { headers: headers(ep.key), cache: "no-store" });
    if (!r.ok) return false;
    const rows = (await r.json()) as Array<{ is_verified?: boolean; blocked?: boolean }>;
    if (!rows.length) return false;
    return !!rows[0].is_verified && !rows[0].blocked;
  } catch (e: any) {
    console.warn("[lineWhitelist.isVerified] error:", e?.message ?? e);
    return false;
  }
}

/**
 * 認証する（合言葉が一致した時に呼ぶ）。
 * 既存レコードがあれば update、無ければ insert (upsert)。
 */
export async function verifyUser(opts: {
  lineUserId: string;
  displayName?: string;
  shopCode: string;
}): Promise<boolean> {
  const ep = endpoint();
  if (!ep) return false;
  try {
    const body = {
      line_user_id: opts.lineUserId,
      display_name: opts.displayName ?? null,
      is_verified: true,
      verified_at: new Date().toISOString(),
      shop_code: opts.shopCode,
      last_seen_at: new Date().toISOString(),
      blocked: false,
      blocked_reason: null,
    };
    const url = `${ep.url}/rest/v1/${TABLE}?on_conflict=line_user_id`;
    const r = await fetch(url, {
      method: "POST",
      headers: headers(ep.key, { Prefer: "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify(body),
    });
    return r.ok;
  } catch (e: any) {
    console.warn("[lineWhitelist.verifyUser] error:", e?.message ?? e);
    return false;
  }
}

/**
 * last_seen_at の更新（軽量・fire-and-forget OK）。
 */
export async function touch(lineUserId: string): Promise<void> {
  const ep = endpoint();
  if (!ep) return;
  try {
    const url = `${ep.url}/rest/v1/${TABLE}?line_user_id=eq.${encodeURIComponent(lineUserId)}`;
    await fetch(url, {
      method: "PATCH",
      headers: headers(ep.key, { Prefer: "return=minimal" }),
      body: JSON.stringify({ last_seen_at: new Date().toISOString() }),
    });
  } catch {}
}

/**
 * 未認証ユーザーの初回エントリ作成（友だち追加時）。
 * 既に居れば何もしない。
 */
export async function createPendingUser(opts: {
  lineUserId: string;
  displayName?: string;
}): Promise<void> {
  const ep = endpoint();
  if (!ep) return;
  try {
    const body = {
      line_user_id: opts.lineUserId,
      display_name: opts.displayName ?? null,
      is_verified: false,
    };
    const url = `${ep.url}/rest/v1/${TABLE}?on_conflict=line_user_id`;
    await fetch(url, {
      method: "POST",
      headers: headers(ep.key, { Prefer: "resolution=ignore-duplicates,return=minimal" }),
      body: JSON.stringify(body),
    });
  } catch {}
}

/**
 * 全 LINE ユーザー一覧を取得（管理画面表示用）。
 * 最終アクセス時刻が新しい順。
 */
export type LineUserRow = {
  line_user_id: string;
  display_name: string | null;
  is_verified: boolean;
  verified_at: string | null;
  shop_code: string | null;
  created_at: string;
  last_seen_at: string | null;
  blocked: boolean;
  blocked_reason: string | null;
};

export async function listUsers(limit = 200): Promise<LineUserRow[]> {
  const ep = endpoint();
  if (!ep) return [];
  try {
    const url = `${ep.url}/rest/v1/${TABLE}?select=*&order=last_seen_at.desc.nullslast&limit=${limit}`;
    const r = await fetch(url, { headers: headers(ep.key), cache: "no-store" });
    if (!r.ok) return [];
    return (await r.json()) as LineUserRow[];
  } catch (e: any) {
    console.warn("[lineWhitelist.listUsers] error:", e?.message ?? e);
    return [];
  }
}

/**
 * 件数集計。
 */
export type LineUserCounts = {
  total: number;
  verified: number;
  pending: number;
  blocked: number;
};

export async function countUsers(): Promise<LineUserCounts> {
  const empty = { total: 0, verified: 0, pending: 0, blocked: 0 };
  const ep = endpoint();
  if (!ep) return empty;
  try {
    const fetchCount = async (filter: string): Promise<number> => {
      const url = `${ep.url}/rest/v1/${TABLE}?select=line_user_id&${filter}&limit=1`;
      const r = await fetch(url, {
        headers: { ...headers(ep.key), Prefer: "count=exact" },
        cache: "no-store",
      });
      const range = r.headers.get("content-range");
      if (!range) return 0;
      const m = range.match(/\/(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    };
    const total = await fetchCount("line_user_id=not.is.null");
    const verified = await fetchCount("is_verified=eq.true&blocked=eq.false");
    const pending = await fetchCount("is_verified=eq.false");
    const blocked = await fetchCount("blocked=eq.true");
    return { total, verified, pending, blocked };
  } catch (e: any) {
    console.warn("[lineWhitelist.countUsers] error:", e?.message ?? e);
    return empty;
  }
}

/**
 * 1ユーザーの詳細を取得（管理画面の詳細ページ用）。
 */
export async function getUser(lineUserId: string): Promise<LineUserRow | null> {
  const ep = endpoint();
  if (!ep) return null;
  try {
    const url = `${ep.url}/rest/v1/${TABLE}?line_user_id=eq.${encodeURIComponent(lineUserId)}&select=*&limit=1`;
    const r = await fetch(url, { headers: headers(ep.key), cache: "no-store" });
    if (!r.ok) return null;
    const rows = (await r.json()) as LineUserRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * display_name を更新（LINE Profile API取得時に呼ぶ）。
 */
export async function updateDisplayName(
  lineUserId: string,
  displayName: string
): Promise<void> {
  const ep = endpoint();
  if (!ep) return;
  try {
    const url = `${ep.url}/rest/v1/${TABLE}?line_user_id=eq.${encodeURIComponent(lineUserId)}`;
    await fetch(url, {
      method: "PATCH",
      headers: headers(ep.key, { Prefer: "return=minimal" }),
      body: JSON.stringify({ display_name: displayName }),
    });
  } catch {}
}

/**
 * 合言葉チェック。SHOP_CODE / KNOWLEDGE_PASSWORD / LINE_VERIFY_PASSWORD のいずれかに
 * （前後空白除去・大文字小文字区別なし）一致したら認証扱い。
 */
export function checkPassword(text: string): { ok: boolean; matched?: string } {
  const cleaned = text.trim();
  if (!cleaned) return { ok: false };
  const candidates = [
    process.env.LINE_VERIFY_PASSWORD, // 専用がある場合
    process.env.SHOP_CODE,            // 既存の店舗コード（AMZ2026）
    process.env.KNOWLEDGE_PASSWORD,   // 規程ビューア(amz2026)
  ].filter(Boolean) as string[];

  for (const pw of candidates) {
    if (cleaned.toLowerCase() === pw.toLowerCase()) {
      return { ok: true, matched: pw };
    }
  }
  return { ok: false };
}
