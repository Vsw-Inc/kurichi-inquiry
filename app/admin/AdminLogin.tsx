"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
        credentials: "include",
      });
      if (r.ok) {
        window.location.reload();
      } else {
        setErr("パスワードが違います");
        setBusy(false);
      }
    } catch {
      setErr("通信エラー");
      setBusy(false);
    }
  }

  return (
    <div className="kadmin-gate">
      <div className="kadmin-gate-card">
        <div className="kadmin-gate-eyebrow">― KURICHI ADMIN</div>
        <h1 className="serif">管理コンソール</h1>
        <p className="kadmin-gate-lead">
          管理パスワードを入力してください。
        </p>
        <form onSubmit={submit} autoComplete="off">
          <input
            type="password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setErr("");
            }}
            placeholder="パスワード"
            autoFocus
            disabled={busy}
            autoComplete="current-password"
          />
          <button type="submit" disabled={busy || !pw}>
            {busy ? "..." : "ENTER"}
          </button>
        </form>
        {err && <div className="kadmin-gate-err">{err}</div>}
        <p className="kadmin-gate-note">
          ※ Vsw管理者のみ閲覧可能です。
        </p>
      </div>
    </div>
  );
}
