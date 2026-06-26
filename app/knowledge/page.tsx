import { cookies } from "next/headers";
import { loadKnowledge } from "../../lib/loadKnowledge";
import LoginForm from "./LoginForm";
import KnowledgeViewer, { Reg } from "./KnowledgeViewer";
import "./knowledge.css";

export const metadata = {
  title: "規程ビューア — ラ・ヴィーチェ コンシェルジュ",
  description:
    "ヴィーチェさんが見ている規程5本（社内限定）。章目次・全文検索つき。",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const SESSION_COOKIE = "lavicheauth";
const SESSION_VALUE = "1";

async function loadRegs(): Promise<Reg[]> {
  const raw = await loadKnowledge();
  if (!raw) return [];
  return splitRegs(raw);
}

function splitRegs(md: string): Reg[] {
  const titles = [
    {
      pattern: /001\s*就業規則/,
      title: "就業規則",
      desc: "社員向けの基本就業規則",
      date: "2024-04-01 改訂",
    },
    {
      pattern: /002\s*給与規程/,
      title: "給与規程",
      desc: "給与の計算・支給・控除の規程",
      date: "2024-04-01 改訂",
    },
    {
      pattern: /003\s*パート.?アルバイト就業規則/,
      title: "パート・アルバイト就業規則",
      desc: "★バイト・パート向け本命",
      date: "2024-04-01 改訂",
    },
    {
      pattern: /004\s*育児介護休業規程/,
      title: "育児介護休業規程",
      desc: "育休・介護休業の制度",
      date: "2024-04-01 改訂",
    },
    {
      pattern: /005\s*慶弔見舞金規程/,
      title: "慶弔見舞金規程",
      desc: "結婚・出産・弔事の見舞金",
      date: "2023-04-01",
    },
    {
      pattern: /006\s*総務マニュアル/,
      title: "総務マニュアル",
      desc: "店舗・本部間 業務運用マニュアル",
      date: "2026-06 追加",
    },
    {
      pattern: /007\s*エニタイム業務FAQ/,
      title: "エニタイム業務FAQ",
      desc: "Membr.com運用FAQ（支払い変更・請求・移籍）",
      date: "2026-06 追加",
    },
    {
      pattern: /008\s*SOELU店舗運用FAQ/,
      title: "SOELU店舗運用FAQ",
      desc: "SOELU業態 店舗運用FAQ（入会・設備・接客）",
      date: "2026-06 追加",
    },
  ];

  const lines = md.split("\n");
  const sections: Array<{ heading: string; bodyStart: number; bodyEnd: number }> =
    [];
  let i = 0;
  for (; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      const heading = lines[i].replace(/^##\s*/, "").trim();
      sections.push({ heading, bodyStart: i + 1, bodyEnd: lines.length });
    }
  }
  for (let s = 0; s < sections.length - 1; s++) {
    sections[s].bodyEnd = sections[s + 1].bodyStart - 1;
  }

  const regs: Reg[] = [];
  let id = 1;
  for (const sec of sections) {
    const matched = titles.find((t) => t.pattern.test(sec.heading));
    if (!matched) continue;
    const body = lines.slice(sec.bodyStart, sec.bodyEnd).join("\n").trim();
    regs.push({
      id: String(id).padStart(3, "0"),
      title: matched.title,
      desc: matched.desc,
      date: matched.date,
      charCount: body.length,
      body,
    });
    id++;
  }
  return regs;
}

export default async function KnowledgePage() {
  // Server Component で Cookie 確認（クライアント側に依存しない・HttpOnly対応）
  const cookieStore = await cookies();
  const authed = cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;

  if (!authed) {
    return <LoginForm />;
  }

  const regs = await loadRegs();
  return regs.length === 0 ? (
    <div className="kb">
      <div className="kb-empty">
        <p>規程データが読み込めませんでした。管理者にご連絡ください。</p>
      </div>
    </div>
  ) : (
    <KnowledgeViewer regs={regs} />
  );
}
