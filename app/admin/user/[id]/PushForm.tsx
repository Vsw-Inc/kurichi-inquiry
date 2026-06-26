"use client";

import { useState } from "react";

export default function PushForm({ userId, displayName }: { userId: string; displayName: string | null }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    if (!window.confirm(`「${displayName || "このユーザー"}」にLINEで送信します。\n\n${trimmed.substring(0, 200)}${trimmed.length > 200 ? "..." : ""}\n\nよろしいですか？`)) {
      return;
    }

    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ to: userId, text: trimmed }),
      });
      const data = await r.json();
      if (data.ok) {
        setResult({ ok: true, msg: "✅ 送信完了しました（履歴は数秒後に反映）" });
        setText("");
        // 1.5秒後にリロード（履歴に反映）
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setResult({ ok: false, msg: `❌ ${data.error || "送信失敗"}` });
      }
    } catch (e: any) {
      setResult({ ok: false, msg: `❌ 通信エラー：${e?.message || "unknown"}` });
    } finally {
      setBusy(false);
    }
  }

  const remaining = 4900 - text.length;

  return (
    <div className="push-form">
      <h2>✉️ メッセージを送信（LINE Push）</h2>
      <p className="push-form-note">
        {displayName ? <strong>{displayName}</strong> : "このユーザー"} に直接LINEメッセージを送信します。
        <br />
        <small style={{ color: "#999" }}>
          ※ 無料プランは月200通まで・ライトプラン月5,000通まで
        </small>
      </p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setResult(null);
        }}
        placeholder="例：シフトの件、店長から連絡が入っています。確認お願いします🌿"
        disabled={busy}
        maxLength={4900}
        rows={4}
      />
      <div className="push-form-foot">
        <span className={`push-form-count ${remaining < 100 ? "warn" : ""}`}>
          残り {remaining} 文字
        </span>
        <button
          onClick={send}
          disabled={busy || !text.trim()}
          className="push-form-btn"
        >
          {busy ? "送信中..." : "📤 LINEに送信"}
        </button>
      </div>
      {result && (
        <div className={`push-form-result ${result.ok ? "ok" : "ng"}`}>
          {result.msg}
        </div>
      )}
    </div>
  );
}
