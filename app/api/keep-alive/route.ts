/**
 * Supabase Keep-Alive エンドポイント。
 *
 * Vercel Cron から毎日1回叩かれて、Supabase に軽量 SELECT を投げる。
 * これで「7日無アクセスで paused」を防ぎ、無料プラン継続を可能にする。
 *
 * 副次効果：
 *  - Supabase 疎通の死活監視（ログで失敗を検知できる）
 *  - 必要なら認証チェックを CRON_SECRET で追加可
 */
export const runtime = "nodejs";

export async function GET(req: Request) {
  // Vercel Cron は Authorization: Bearer <CRON_SECRET> を付ける（任意設定）
  // 設定があれば検証、なければスキップ（本番では設定推奨）
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return new Response(
      JSON.stringify({ ok: false, error: "supabase not configured" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 既存テーブル（chat_logs）に軽量 SELECT して疎通確認
  const started = Date.now();
  try {
    const r = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/chat_logs?select=id&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
      }
    );
    const elapsed = Date.now() - started;
    return new Response(
      JSON.stringify({
        ok: r.ok,
        status: r.status,
        elapsed_ms: elapsed,
        at: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e?.message ?? String(e),
        elapsed_ms: Date.now() - started,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}
