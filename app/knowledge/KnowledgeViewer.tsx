"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type Reg = {
  id: string;
  title: string;
  desc: string;
  date: string;
  charCount: number;
  body: string;
};

type Chapter = { id: string; title: string };

function parseChapters(body: string): Chapter[] {
  const chapters: Chapter[] = [];
  const lines = body.split("\n");
  let chIdx = 0;
  for (const raw of lines) {
    const line = raw.trim();
    // 「第X章 タイトル」
    const m = line.match(/^第\s*([０-９0-9一二三四五六七八九十]+)\s*章\s*(.*)$/);
    if (m) {
      chapters.push({
        id: `ch-${chIdx++}`,
        title: `第${m[1]}章 ${m[2].trim()}`,
      });
      continue;
    }
    // FAQで章が無い場合の代替：「## 規程名」直下の `### Q. …` を1つの章扱い
    // ※ knowledge.md は ## 規程名 ＞ 第X章 で分割されているので通常はここに来ない
  }
  return chapters;
}

function renderBody(body: string, query: string): React.JSX.Element[] {
  const out: React.JSX.Element[] = [];
  let chIdx = 0;
  // Q&A 連結用：直前が Q. かどうかで A. の見せ方を変える
  let pendingQ: { qLabel: string; qText: string; qKey: string } | null = null;

  const flushQ = (idx: number) => {
    if (pendingQ) {
      out.push(
        <div key={`q-${pendingQ.qKey}`} className="kb-q">
          <span className="kb-q-label">{pendingQ.qLabel}</span>
          <span className="kb-q-text">{highlight(pendingQ.qText, query)}</span>
        </div>
      );
      pendingQ = null;
    }
  };

  body.split("\n").forEach((line, idx) => {
    const stripped = line.trim();
    if (!stripped) {
      flushQ(idx);
      out.push(<br key={`br-${idx}`} />);
      return;
    }

    // 引用ブロック（> ...）
    const quoteMatch = stripped.match(/^>\s*(.+)$/);
    if (quoteMatch) {
      flushQ(idx);
      out.push(
        <p key={`q-${idx}`} className="kb-quote">
          {highlight(quoteMatch[1], query)}
        </p>
      );
      return;
    }

    // 章見出し（第X章）
    const chMatch = stripped.match(
      /^第\s*([０-９0-9一二三四五六七八九十]+)\s*章\s*(.*)$/
    );
    if (chMatch) {
      flushQ(idx);
      const cid = `ch-${chIdx++}`;
      out.push(
        <h2 key={`h2-${idx}`} id={cid} className="kb-h2">
          第{chMatch[1]}章{" "}
          <span>{highlight(chMatch[2], query)}</span>
        </h2>
      );
      return;
    }

    // Markdown ### サブ見出し
    const mdH3 = stripped.match(/^###\s+(.+)$/);
    if (mdH3) {
      flushQ(idx);
      const sub = mdH3[1].trim();
      // ### Q1. 〜 / ### Q. 〜 はQ&A形式へ
      const qHead = sub.match(/^(Q\d*[\.．])\s*(.+)$/);
      if (qHead) {
        flushQ(idx);
        pendingQ = {
          qLabel: qHead[1].replace("．", "."),
          qText: qHead[2],
          qKey: String(idx),
        };
        return;
      }
      // 通常のサブ見出し（### 1-1. レジ開局時… 等）
      out.push(
        <h3 key={`h3-${idx}`} className="kb-h3-sub">
          {highlight(sub, query)}
        </h3>
      );
      return;
    }

    // Markdown ## 見出し（規程ヘッダはここに来ないが念のため）
    const mdH2 = stripped.match(/^##\s+(.+)$/);
    if (mdH2) {
      flushQ(idx);
      out.push(
        <h2 key={`h2md-${idx}`} className="kb-h2">
          {highlight(mdH2[1], query)}
        </h2>
      );
      return;
    }

    // 第X節
    const secMatch = stripped.match(
      /^第\s*([０-９0-9一二三四五六七八九十]+)\s*節\s*(.*)$/
    );
    if (secMatch) {
      flushQ(idx);
      out.push(
        <h3 key={`h3-${idx}`} className="kb-h3">
          第{secMatch[1]}節{" "}
          <span>{highlight(secMatch[2], query)}</span>
        </h3>
      );
      return;
    }

    // （条文タイトル）
    const artMatch = stripped.match(/^（(.+)）$/);
    if (artMatch) {
      flushQ(idx);
      out.push(
        <h4 key={`h4-${idx}`} className="kb-h4">
          {highlight(artMatch[1], query)}
        </h4>
      );
      return;
    }

    // A. 〜 （直前が Q. なら Q+A の対として描画）
    const aMatch = stripped.match(/^A[\.．]\s*(.+)$/);
    if (aMatch) {
      const qHead = pendingQ;
      pendingQ = null;
      out.push(
        <div key={`qa-${idx}`} className={`kb-qa${qHead ? " has-q" : ""}`}>
          {qHead && (
            <div className="kb-qa-q">
              <span className="kb-qa-q-label">{qHead.qLabel}</span>
              <span className="kb-qa-q-text">{highlight(qHead.qText, query)}</span>
            </div>
          )}
          <div className="kb-qa-a">
            <span className="kb-qa-a-label">A</span>
            <span className="kb-qa-a-text">{highlight(aMatch[1], query)}</span>
          </div>
        </div>
      );
      return;
    }

    // Q. xxx（### なし版）
    const qPlain = stripped.match(/^(Q\d*[\.．])\s*(.+)$/);
    if (qPlain) {
      flushQ(idx);
      pendingQ = {
        qLabel: qPlain[1].replace("．", "."),
        qText: qPlain[2],
        qKey: String(idx),
      };
      return;
    }

    // 番号付き（"1. xxx"）
    const numMatch = stripped.match(/^(\d+)[\.．]\s*(.+)$/);
    if (numMatch) {
      flushQ(idx);
      out.push(
        <p key={`p-${idx}`} className="kb-num">
          <span className="kb-n">{numMatch[1]}</span>
          {highlight(numMatch[2], query)}
        </p>
      );
      return;
    }

    // 通常パラグラフ
    flushQ(idx);
    out.push(
      <p key={`p-${idx}`} className="kb-p">
        {highlight(stripped, query)}
      </p>
    );
  });

  flushQ(-1);
  return out;
}

function highlight(text: string, query: string): React.JSX.Element | string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <mark key={i} className="kb-hit">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export default function KnowledgeViewer({ regs }: { regs: Reg[] }) {
  // デフォルトは "003 パート・アルバイト就業規則"
  const defaultIdx = regs.findIndex((r) => r.title.includes("パート"));
  const [active, setActive] = useState(defaultIdx >= 0 ? defaultIdx : 0);
  const [query, setQuery] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  // URLハッシュから初期表示規程を決める（例：#003）
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const idx = regs.findIndex((r) => r.id === hash || r.title.includes(hash));
    if (idx >= 0) {
      setActive(idx);
      // スクロールは少し遅らせる
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }, 50);
    }
  }, [regs]);

  const current = regs[active];
  const chapters = useMemo(() => parseChapters(current.body), [current.body]);
  const rendered = useMemo(
    () => renderBody(current.body, query),
    [current.body, query]
  );

  const totalChars = regs.reduce((s, r) => s + r.charCount, 0);
  const totalChapters = regs.reduce(
    (s, r) => s + parseChapters(r.body).length,
    0
  );

  return (
    <div className="kb">
      <header className="kb-head">
        <div className="kb-head-eyebrow">― VICHESAN KNOWLEDGE BASE</div>
        <h1 className="serif">
          ヴィーチェさんが見ている、<em>規程データ。</em>
        </h1>
        <div className="kb-head-meta">
          <span>
            <b>UPDATED</b>2026/05/14
          </span>
          <span>
            <b>RAG</b>Claude Sonnet 4.5 (Vsw株式会社)
          </span>
          <span>
            <b>STATUS</b>進行中
          </span>
        </div>
        <p className="kb-head-info">
          チャット応答末尾の <code>[CITE: ●●規程 第◯章]</code> の根拠を、
          このページで突き合わせて確認いただけます。Prompt Caching
          で大型コンテキストを効率化しています。
        </p>
      </header>

      <div className="kb-kpi">
        <div className="kb-kpi-card">
          <div className="kb-kpi-num">
            {regs.length}
            <em>本</em>
          </div>
          <div className="kb-kpi-label">規程</div>
        </div>
        <div className="kb-kpi-card">
          <div className="kb-kpi-num">
            {totalChapters}
            <em>章</em>
          </div>
          <div className="kb-kpi-label">章 総数</div>
        </div>
        <div className="kb-kpi-card">
          <div className="kb-kpi-num">
            {(totalChars / 1000).toFixed(0)}
            <em>K字</em>
          </div>
          <div className="kb-kpi-label">総文字数</div>
        </div>
        <div className="kb-kpi-card">
          <div className="kb-kpi-num">
            2024/04<em></em>
          </div>
          <div className="kb-kpi-label">最新改訂</div>
        </div>
      </div>

      <div className="kb-search-wrap">
        <input
          type="text"
          className="kb-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 キーワード検索（例：早退・有給・給料日・育休・セクハラ）"
        />
      </div>

      <nav className="kb-tabs">
        {regs.map((r, i) => (
          <button
            key={r.id}
            className={`kb-tab${i === active ? " active" : ""}`}
            onClick={() => {
              setActive(i);
              window.scrollTo({ top: 0, behavior: "smooth" });
              try {
                history.replaceState(null, "", `#${r.id}`);
              } catch {}
            }}
          >
            <span>{r.title}</span>
            <small>{r.date}</small>
          </button>
        ))}
      </nav>

      <section className="kb-reg">
        <div className="kb-reg-head">
          <h2 className="serif">{current.title}</h2>
          <div className="kb-reg-meta">
            <span>
              <b>用途</b>
              {current.desc}
            </span>
            <span>
              <b>改訂</b>
              {current.date}
            </span>
            <span>
              <b>文字数</b>
              {current.charCount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="kb-grid">
          <aside className="kb-toc">
            <div className="kb-toc-h">章 目次</div>
            <ul>
              {chapters.map((c) => (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(c.id);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
          <article className="kb-body" ref={bodyRef}>
            {rendered}
          </article>
        </div>
      </section>

      <footer className="kb-foot">
        <span>© 2026 La Viche / AMZ GROUP — Knowledge Base</span>
        <span>Prepared by Vsw Inc.</span>
      </footer>
    </div>
  );
}
