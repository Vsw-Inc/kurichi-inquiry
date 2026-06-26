"use client";

import { useState } from "react";

export default function LoginForm({ error }: { error?: string }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState(error || "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    setBusy(true);
    setLocalError("");
    try {
      const res = await fetch("/api/knowledge-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input }),
        credentials: "include",
      });
      if (res.ok) {
        // 認証成功 → リロードして Server Component が Cookie を読む
        window.location.reload();
      } else {
        setLocalError("パスワードが違います / Incorrect password");
        setBusy(false);
      }
    } catch {
      setLocalError("通信エラーが発生しました");
      setBusy(false);
    }
  }

  return (
    <div className="kb-gate">
      <div className="kb-gate-inner">
        <div className="kb-gate-eyebrow">― AUTHORIZED ACCESS</div>
        <h1 className="serif">関係者限定</h1>
        <p className="kb-gate-lead">
          ラ・ヴィーチェ 規程ビューア。
          <br />
          ヴィーチェさんが回答の根拠としている規程・FAQ 計8本を、人間が直接読める形でご覧いただけます。
        </p>
        <form
          onSubmit={submit}
          className="kb-gate-field"
          autoComplete="off"
        >
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setLocalError("");
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                submit(e as unknown as React.FormEvent);
              }
            }}
            placeholder="パスワード / Password"
            autoFocus
            disabled={busy}
            autoComplete="current-password"
          />
          <button type="submit" disabled={busy || !input.trim()}>
            {busy ? "..." : "ENTER"}
          </button>
        </form>
        {localError && <p className="kb-gate-error">{localError}</p>}
        <p className="kb-gate-note">
          ※ パスワードは Vsw株式会社（菊地）から個別にご案内します。
          <br />
          機密情報につき、社内限定でのご閲覧をお願いします。
        </p>
      </div>
    </div>
  );
}
