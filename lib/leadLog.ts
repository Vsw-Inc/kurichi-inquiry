/**
 * リードログ取得（Supabase の leads テーブル）。
 * /admin で一覧表示用。
 */
function cfg() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function authHeaders(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export type LeadRow = {
  id: number;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  type: string | null;
  message: string;
  created_at: string;
};

export async function fetchLeads(limit = 50): Promise<LeadRow[]> {
  const c = cfg();
  if (!c) return [];
  try {
    const url = `${c.url}/rest/v1/leads?select=*&order=created_at.desc&limit=${limit}`;
    const r = await fetch(url, { headers: authHeaders(c.key), cache: "no-store" });
    if (!r.ok) return [];
    return (await r.json()) as LeadRow[];
  } catch {
    return [];
  }
}

export async function countLeads(
  filter: "all" | "today" = "all"
): Promise<number> {
  const c = cfg();
  if (!c) return 0;
  try {
    let q = `${c.url}/rest/v1/leads?select=id`;
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
