"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ViBotAvatar from "./components/ViBotAvatar";

type Msg = {
  role: "user" | "assistant";
  content: string;
  citation?: string | null;
  pending?: boolean;
};

type SessionInfo = {
  id: string;
  name: string;
  store?: string;
  picture?: string | null;
  source: "line" | "mock";
} | null;

// citation 文字列から規程ビューアのアンカー（#001〜#008）を導出
function citationAnchor(citation: string): string | null {
  if (!citation) return null;
  if (/該当なし|該当しない/.test(citation)) return null;
  // FAQを先に判定（既存規程より具体的なため優先）
  if (/SOELU|よもぎ|プロテイン|水素水|マシンピラティス/.test(citation)) return "/knowledge#008";
  if (/Membr|エニタイム業務|移籍|請求業務|口座振替/.test(citation)) return "/knowledge#007";
  if (/総務|レジ|KOT|KING OF TIME|勤怠|小口|大口|BtoB|インフォマート/.test(citation)) return "/knowledge#006";
  // 「パート」「アルバイト」を先に判定（「就業規則」より優先）
  if (/パート|アルバイト/.test(citation)) return "/knowledge#003";
  if (/給与|賃金/.test(citation)) return "/knowledge#002";
  if (/育児|介護|育休/.test(citation)) return "/knowledge#004";
  if (/慶弔|見舞/.test(citation)) return "/knowledge#005";
  if (/就業規則/.test(citation)) return "/knowledge#001";
  return null;
}

const FAQ_CHIPS = [
  "早退したいときどうすれば？",
  "制服の洗濯ルールを教えて",
  "シフト変更したい",
  "髪色のルールはどう？",
  "給与日はいつ？",
  "体調不良で休みたい",
];

const INITIAL_GREETING: Msg = {
  role: "assistant",
  content:
    "おつかれさま！\n困ったことや、規定で確認したいことがあれば気軽に聞いてね。",
};

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<SessionInfo>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // ログイン状態取得
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setSession(d.user || null);
        setIsAdmin(!!d.isAdmin);
        setSessionLoaded(true);
      })
      .catch(() => setSessionLoaded(true));
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setBusy(true);
    const next: Msg[] = [
      ...messages,
      { role: "user", content: question },
      { role: "assistant", content: "", pending: true },
    ];
    setMessages(next);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok || !res.body) {
        let userMessage =
          "ごめん、通信がうまくいきませんでした。少し時間をおいて、もう一度試してみてね🌿";
        if (res.status === 429) {
          userMessage =
            "ごめん、いまちょっと混み合ってます。30秒〜1分くらい待って、もう一度聞いてみてね🌿";
        } else if (res.status >= 500) {
          userMessage =
            "ごめん、サーバーで一時的に問題が起きてます。少し待ってから、もう一度試してね。";
        } else if (res.status === 401 || res.status === 403) {
          userMessage =
            "ごめん、認証情報に問題があるみたい。管理者に連絡してくれると助かります。";
        }
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: userMessage,
          };
          return copy;
        });
        setBusy(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      let citation: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const ev = JSON.parse(line);
            if (ev.type === "text") {
              answer += ev.text;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  role: "assistant",
                  content: answer,
                  pending: true,
                };
                return copy;
              });
            } else if (ev.type === "citation") {
              citation = ev.citation;
            }
          } catch {
            answer += line;
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = {
                role: "assistant",
                content: answer,
                pending: true,
              };
              return copy;
            });
          }
        }
      }

      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: answer,
          citation,
        };
        return copy;
      });
    } catch (e: any) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content:
            "ごめん、通信がうまくいきませんでした。少し時間をおいて、もう一度試してみてね🌿",
        };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  function send() {
    const q = input.trim();
    if (!q) return;
    setInput("");
    ask(q);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="serif">La Viche</span>
          <span className="app-brand-sub">CONCIERGE</span>
        </div>
        <div className="app-user">
          {sessionLoaded && session ? (
            <>
              <span className="app-user-name">
                {session.picture && (
                  <img
                    src={session.picture}
                    alt=""
                    className="app-user-avatar"
                  />
                )}
                <span className="app-user-greeting">こんにちは、</span>
                <strong>{session.name}</strong>
                <span className="app-user-suffix"> さん</span>
              </span>
              <Link href="/knowledge" className="app-link app-icon" title="規程ビューア">
                📖<span className="app-icon-text"> 規程</span>
              </Link>
              {isAdmin && (
                <Link href="/admin" className="app-link app-icon" title="管理画面">
                  📊<span className="app-icon-text"> 管理</span>
                </Link>
              )}
              <Link href="/lp" className="app-link app-icon" title="商品説明">
                ℹ️<span className="app-icon-text"> 概要</span>
              </Link>
              <a href="/api/auth/logout" className="app-link app-icon" title="ログアウト">
                🚪<span className="app-icon-text"> ログアウト</span>
              </a>
            </>
          ) : sessionLoaded ? (
            <Link href="/login" className="app-link">
              ログイン →
            </Link>
          ) : (
            <span className="app-user-greeting">…</span>
          )}
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-orb" aria-hidden></div>
        <div className="hero-avatar float">
          <ViBotAvatar size={56} />
        </div>
        <div className="hero-meta">
          <div className="hero-name serif">ヴィーチェさん</div>
          <div className="hero-role">La Viche / 3年目スタッフ</div>
        </div>
        <div className="hero-tag">こんにちは、ヴィーチェです。</div>
      </section>

      <div className="chips-wrap">
        <div className="chips-label">よく聞かれる質問</div>
        <div className="chips">
          {FAQ_CHIPS.map((q) => (
            <button
              key={q}
              className="chip"
              onClick={() => ask(q)}
              disabled={busy}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="chatlog" ref={logRef}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble-row ${m.role === "user" ? "user" : "bot"}`}>
            {m.role === "assistant" && (
              <div className="bubble-avatar">
                <ViBotAvatar size={36} />
              </div>
            )}
            <div className={`bubble ${m.role === "user" ? "user" : "bot"}`}>
              {m.pending && !m.content ? (
                <span className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              ) : (
                <>
                  <div className="bubble-text">{m.content}</div>
                  {m.role === "assistant" && m.citation && (() => {
                    const href = citationAnchor(m.citation);
                    if (href) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="cite cite-link"
                        >
                          📎 出典：{m.citation} <span className="cite-arrow">↗</span>
                        </a>
                      );
                    }
                    return <div className="cite">📎 出典：{m.citation}</div>;
                  })()}
                  {m.role === "assistant" && !m.pending && i > 0 && (
                    <div className="feedback">
                      <button>👍 役に立った</button>
                      <button>👎 もう少し</button>
                      <button className="escalate">店長に聞く</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="input-bar">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // IME変換中（日本語入力の確定前）のEnterは送信しない
            if (
              e.key === "Enter" &&
              !e.nativeEvent.isComposing &&
              e.keyCode !== 229
            ) {
              send();
            }
          }}
          placeholder={busy ? "ヴィーチェさんが考え中..." : "ヴィーチェさんに聞いてみる"}
          disabled={busy}
        />
        <button className="send" onClick={send} disabled={busy || !input.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </div>

      <nav className="footer-links">
        <Link href="/knowledge">📖 規程</Link>
        <span>·</span>
        <Link href="/status">📊 進捗</Link>
        <span>·</span>
        <Link href="/lp">ℹ️ 概要</Link>
        {isAdmin && (
          <>
            <span>·</span>
            <Link href="/admin">⚙️ 管理</Link>
          </>
        )}
        <span>·</span>
        <Link href="/terms">利用規約</Link>
        <span>·</span>
        <Link href="/privacy">プライバシー</Link>
      </nav>
      <div className="footer-note">
        © 2026 La Viche / AMZ GROUP — Powered by Claude Sonnet 4.5 / Vsw Inc.
      </div>
    </div>
  );
}
