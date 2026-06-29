"use client";

import { useState } from "react";

export default function PushForm({ userId }: { userId: string }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!text.trim()) return;
    setSending(true);
    try {
      const r = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text: text.trim() }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        setMsg({ kind: "err", text: data.error || "送信に失敗しました" });
        return;
      }
      setMsg({ kind: "ok", text: "送信しました ✅ 数秒後にこのページを再読込してください" });
      setText("");
    } catch (err: any) {
      setMsg({ kind: "err", text: err?.message || "通信エラー" });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="kadmin-push-form" onSubmit={onSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="このユーザーに送るメッセージを入力（最大5000文字）"
        rows={5}
        maxLength={5000}
        disabled={sending}
      />
      <div className="kadmin-push-row">
        <span className="kadmin-push-count">{text.length} / 5000</span>
        <button type="submit" className="kadmin-btn" disabled={sending || !text.trim()}>
          {sending ? "送信中..." : "📤 LINEに送信"}
        </button>
      </div>
      {msg && (
        <div className={`kadmin-push-msg ${msg.kind === "ok" ? "ok" : "err"}`}>
          {msg.text}
        </div>
      )}
    </form>
  );
}
