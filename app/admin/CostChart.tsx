import type { ChatStats } from "../../lib/chatLog";

const COLORS = {
  input: "#c8a570",
  output: "#7fae6b",
  cacheWrite: "#d97a6c",
  cacheRead: "#6ba0c8",
};

const LABELS = {
  input: "入力",
  output: "出力",
  cacheWrite: "キャッシュ書込",
  cacheRead: "キャッシュ読込",
};

export default function CostChart({ stats }: { stats: ChatStats }) {
  const bd = stats.costBreakdownJpy;
  const segments = [
    { key: "input" as const, value: bd.input },
    { key: "output" as const, value: bd.output },
    { key: "cacheWrite" as const, value: bd.cacheWrite },
    { key: "cacheRead" as const, value: bd.cacheRead },
  ];
  const total = segments.reduce((s, x) => s + x.value, 0);

  // conic-gradient の stops を生成
  let acc = 0;
  const stops: string[] = [];
  for (const seg of segments) {
    const pct = total > 0 ? (seg.value / total) * 100 : 0;
    stops.push(`${COLORS[seg.key]} ${acc}% ${acc + pct}%`);
    acc += pct;
  }
  if (total === 0) stops.push("rgba(200,165,112,0.15) 0% 100%");
  const pieStyle = { background: `conic-gradient(${stops.join(", ")})` };

  // 日別棒グラフの最大値
  const maxDaily = Math.max(...stats.daily.map((d) => d.costJpy), 1);

  return (
    <div className="ad-chart-grid">
      {/* 円グラフ：コスト内訳 */}
      <div className="ad-chart-card">
        <div className="ad-chart-title">コスト内訳（累計）</div>
        <div className="ad-pie-wrap">
          <div className="ad-pie" style={pieStyle}>
            <div className="ad-pie-hole">
              <div className="ad-pie-total">¥{Math.round(stats.costJpyTotal).toLocaleString()}</div>
              <div className="ad-pie-sub">累計</div>
            </div>
          </div>
          <ul className="ad-legend">
            {segments.map((seg) => {
              const pct = total > 0 ? (seg.value / total) * 100 : 0;
              return (
                <li key={seg.key}>
                  <span className="ad-legend-dot" style={{ background: COLORS[seg.key] }} />
                  <span className="ad-legend-label">{LABELS[seg.key]}</span>
                  <span className="ad-legend-val">
                    ¥{Math.round(seg.value).toLocaleString()}
                    <small>（{pct.toFixed(0)}%）</small>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* 棒グラフ：日別コスト推移（過去7日）*/}
      <div className="ad-chart-card">
        <div className="ad-chart-title">日別コスト（過去7日）</div>
        <div className="ad-bars">
          {stats.daily.map((d, i) => {
            const h = (d.costJpy / maxDaily) * 100;
            return (
              <div className="ad-bar-col" key={i}>
                <div className="ad-bar-val">
                  {d.costJpy > 0 ? `¥${Math.round(d.costJpy)}` : ""}
                </div>
                <div className="ad-bar-track">
                  <div
                    className="ad-bar-fill"
                    style={{ height: `${Math.max(h, d.costJpy > 0 ? 4 : 0)}%` }}
                    title={`${d.label}: ¥${Math.round(d.costJpy)} / ${d.count}件`}
                  />
                </div>
                <div className="ad-bar-label">{d.label}</div>
                <div className="ad-bar-count">{d.count > 0 ? `${d.count}件` : "—"}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
