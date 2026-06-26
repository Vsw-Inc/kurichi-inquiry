"use client";

import { useState } from "react";

type FormState = "idle" | "sending" | "ok" | "ng";

export default function LeadForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("demo");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("お名前・メールアドレス・お問い合わせ内容は必須です");
      setState("ng");
      return;
    }
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company, email, phone, message, type }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setState("ok");
        setName(""); setCompany(""); setEmail(""); setPhone(""); setMessage("");
      } else {
        setError(data.error || "送信に失敗しました。少し時間をおいて再度お試しください。");
        setState("ng");
      }
    } catch (e: any) {
      setError(e?.message || "通信エラーが発生しました");
      setState("ng");
    }
  }

  return (
    <form className="ku-lead" onSubmit={submit} autoComplete="on">
      <div className="ku-lead-row">
        <label>
          <span>お名前 *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
            required
            autoComplete="name"
          />
        </label>
        <label>
          <span>会社名（任意）</span>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="株式会社○○"
            autoComplete="organization"
          />
        </label>
      </div>
      <div className="ku-lead-row">
        <label>
          <span>メールアドレス *</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@example.com"
            required
            autoComplete="email"
          />
        </label>
        <label>
          <span>電話番号（任意）</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="090-1234-5678"
            autoComplete="tel"
          />
        </label>
      </div>
      <label>
        <span>お問い合わせ種別</span>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="demo">無料デモ希望</option>
          <option value="biz">他社導入の相談</option>
          <option value="wholesale">クリチの卸し・取引相談</option>
          <option value="media">取材・メディア</option>
          <option value="other">その他</option>
        </select>
      </label>
      <label>
        <span>お問い合わせ内容 *</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="ご要望・ご質問をお書きください。導入規模・想定問合せ数・希望時期なども教えていただけると助かります。"
          rows={5}
          required
        />
      </label>
      <div className="ku-lead-foot">
        <small>
          ※ いただいた情報は<a href="/privacy">プライバシーポリシー</a>に基づき適切に管理いたします。
        </small>
        <button type="submit" disabled={state === "sending"} className="ku-lead-btn">
          {state === "sending" ? "送信中..." : "送信する"}
        </button>
      </div>
      {state === "ok" && (
        <div className="ku-lead-msg ok">
          ✅ 送信完了しました。担当より2営業日以内にご連絡いたします🍔
        </div>
      )}
      {state === "ng" && error && (
        <div className="ku-lead-msg ng">❌ {error}</div>
      )}
    </form>
  );
}
