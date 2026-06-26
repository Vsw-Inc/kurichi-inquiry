import { cookies } from "next/headers";
import Link from "next/link";
import { loadKnowledge } from "../../../lib/loadKnowledge";
import { splitIntoChunks } from "../../../lib/regChunks";
import AdminLogin from "../AdminLogin";
import "../admin.css";
import "./knowledge.css";

export const metadata = {
  title: "ナレッジ — クリチ Inquiry AI",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ADMIN_COOKIE = "kurichi_admin";

export default async function AdminKnowledgePage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get(ADMIN_COOKIE)?.value === "ok";
  if (!authed) return <AdminLogin />;

  const raw = await loadKnowledge();
  const chunks = splitIntoChunks(raw);

  // セクション（## 規程名）でグルーピング
  const grouped: Record<
    string,
    { regNo: string; regName: string; chapters: typeof chunks }
  > = {};
  for (const c of chunks) {
    const key = c.reg;
    if (!grouped[key]) {
      grouped[key] = {
        regNo: c.id.split("-")[0],
        regName: c.reg,
        chapters: [],
      };
    }
    grouped[key].chapters.push(c);
  }
  const sections = Object.values(grouped).sort((a, b) =>
    a.regNo.localeCompare(b.regNo)
  );

  // Q&A判定（### Q1. xxx 形式）
  const renderBody = (body: string) => {
    const lines = body.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i++;
        continue;
      }
      // 「【タイトル】」は装飾的なヘッダー（skip表示）
      if (line.startsWith("【") && line.endsWith("】")) {
        i++;
        continue;
      }
      // A. で回答（Q&Aセクション内）
      if (line.startsWith("A.") || line.startsWith("A：")) {
        elements.push(
          <div key={i} className="kn-answer">
            {line.replace(/^A[\.：]\s*/, "")}
          </div>
        );
        i++;
        continue;
      }
      // 「第N条」
      const articleMatch = line.match(/^第\s*([０-９0-9一二三四五六七八九十]+)\s*条\s*(.*)/);
      if (articleMatch) {
        elements.push(
          <div key={i} className="kn-article">
            <strong>第{articleMatch[1]}条</strong>
            {articleMatch[2] && `（${articleMatch[2]}）`}
          </div>
        );
        i++;
        continue;
      }
      // 「第N章」
      const chapterMatch = line.match(/^第\s*([０-９0-9一二三四五六七八九十]+)\s*章\s*(.*)/);
      if (chapterMatch) {
        elements.push(
          <h4 key={i} className="kn-chapter">
            第{chapterMatch[1]}章 {chapterMatch[2]}
          </h4>
        );
        i++;
        continue;
      }
      // 通常テキスト
      elements.push(
        <p key={i} className="kn-text">
          {line}
        </p>
      );
      i++;
    }
    return elements;
  };

  return (
    <div className="kadmin">
      <header className="kadmin-head">
        <div>
          <div className="kadmin-eyebrow">― KURICHI KNOWLEDGE</div>
          <h1 className="serif">ナレッジビューア</h1>
        </div>
        <div className="kadmin-head-r">
          <Link href="/admin" className="kadmin-link">← 管理に戻る</Link>
          <Link href="/lp" className="kadmin-link">サイト</Link>
        </div>
      </header>

      {/* 統計 */}
      <section className="kadmin-kpis">
        <div className="kadmin-kpi">
          <div className="kadmin-kpi-num">{sections.length}<em>セクション</em></div>
          <div className="kadmin-kpi-label">カテゴリ</div>
        </div>
        <div className="kadmin-kpi">
          <div className="kadmin-kpi-num accent">{chunks.length}<em></em></div>
          <div className="kadmin-kpi-label">章 / Q&A 総数</div>
        </div>
        <div className="kadmin-kpi">
          <div className="kadmin-kpi-num">{(raw.length / 1000).toFixed(1)}<em>K字</em></div>
          <div className="kadmin-kpi-label">総文字数</div>
        </div>
      </section>

      {/* 目次 */}
      <section className="kadmin-section">
        <h2>📚 目次</h2>
        <div className="kn-toc">
          {sections.map((sec) => (
            <a key={sec.regNo} href={`#sec-${sec.regNo}`} className="kn-toc-item">
              <span className="kn-toc-no">{sec.regNo}</span>
              <span className="kn-toc-name">{sec.regName}</span>
              <span className="kn-toc-count">{sec.chapters.length}件</span>
            </a>
          ))}
        </div>
      </section>

      {/* セクション本文 */}
      {sections.map((sec) => (
        <section
          key={sec.regNo}
          id={`sec-${sec.regNo}`}
          className="kadmin-section kn-section"
        >
          <h2>
            <span className="kn-sec-no">{sec.regNo}</span>
            {sec.regName}
          </h2>
          <div className="kn-chapters">
            {sec.chapters.map((ch) => (
              <article key={ch.id} className="kn-chapter-card">
                <header className="kn-chapter-head">
                  <span className="kn-chapter-id">[{ch.id}]</span>
                  <span className="kn-chapter-title">{ch.chapter}</span>
                </header>
                <div className="kn-chapter-body">{renderBody(ch.body)}</div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <footer className="kadmin-foot">
        <span>© 2026 Vsw株式会社 — クリチ Inquiry AI</span>
        <Link href="/admin" className="kadmin-link">← 管理に戻る</Link>
      </footer>
    </div>
  );
}
