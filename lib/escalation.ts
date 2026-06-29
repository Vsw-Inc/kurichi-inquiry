/**
 * 有人引き継ぎ判定（Phase A）
 *
 * 質問テキスト + 既存記憶 から、人に渡すべきかを判定し、
 * カテゴリ・優先度・不足情報・次に聞くべき質問を返す。
 *
 * 既存webhookの keywordベース簡易判定を強化する。
 * - 「卸/取材/コラボ/イベント出店」等は キーワード即判定
 * - 「クレーム / アレルギー詳細」も対象に拡張
 * - 不足情報を明示することで、AIがフォローアップ質問を生成しやすく
 */
import type { ConversationMemory } from "./conversationMemory";

export type EscalationCategory =
  | "卸し相談"
  | "大量注文"
  | "取材依頼"
  | "コラボ相談"
  | "イベント出店相談"
  | "メディア掲載相談"
  | "海外展開相談"
  | "クレーム"
  | "アレルギー詳細"
  | "価格交渉"
  | "納期確認"
  | "在庫確認"
  | "未確定情報"
  | "フランチャイズ相談"
  | "AI導入相談"
  | null;

export type Priority = "high" | "medium" | "low";

export type EscalationResult = {
  should_handoff: boolean;
  category: EscalationCategory;
  priority: Priority;
  reason: string;
  missing_fields: string[];
  next_question: string;
};

type Rule = {
  category: NonNullable<EscalationCategory>;
  priority: Priority;
  patterns: RegExp[];
  ask: string[]; // 聞くべき項目（user_type=法人系で不足するもの）
};

const RULES: Rule[] = [
  {
    category: "クレーム",
    priority: "high",
    patterns: [/クレーム/, /苦情/, /返金/, /返品/, /不良/, /異物/, /お詫び/],
    ask: ["name", "email", "phone", "last_topic"],
  },
  {
    category: "アレルギー詳細",
    priority: "high",
    patterns: [
      /アレルギ/,
      /原材料.*詳細/,
      /製造ライン/,
      /コンタミ/,
      /乳が入って/,
      /卵が入って/,
      /小麦が入って/,
      /ナッツ.*入って/,
      /アナフ/,
    ],
    ask: ["name", "last_topic"],
  },
  {
    category: "卸し相談",
    priority: "high",
    patterns: [/卸/, /おろし/, /取引/, /仕入/, /業務用/, /BtoB/, /B2B/],
    ask: ["company", "name", "email", "requested_quantity", "desired_date", "location"],
  },
  {
    category: "大量注文",
    priority: "high",
    patterns: [/\d{2,}\s*個/, /大量/, /まとめ買い/, /法人.*注文/],
    ask: ["company", "name", "email", "requested_quantity", "desired_date"],
  },
  {
    category: "取材依頼",
    priority: "high",
    patterns: [/取材/, /メディア/, /雑誌/, /テレビ/, /TV/, /ラジオ/, /記者/, /ライター/, /PR/],
    ask: ["company", "name", "email", "phone", "desired_date"],
  },
  {
    category: "コラボ相談",
    priority: "high",
    patterns: [/コラボ/, /コラボレーション/, /提案/, /タイアップ/, /共同企画/],
    ask: ["company", "name", "email", "desired_date"],
  },
  {
    category: "イベント出店相談",
    priority: "high",
    patterns: [/出店依頼/, /出店してもらえ/, /キッチンカー.*出店/, /イベント.*主催/, /マルシェ.*出店/],
    ask: ["company", "name", "email", "desired_date", "location"],
  },
  {
    category: "海外展開相談",
    priority: "medium",
    patterns: [/海外販売/, /輸出/, /海外展開/, /輸入したい/, /海外.*取引/],
    ask: ["company", "name", "email", "location"],
  },
  {
    category: "フランチャイズ相談",
    priority: "high",
    patterns: [/フランチャイズ/, /代理店/, /独立開業/, /出店したい/],
    ask: ["company", "name", "email", "location"],
  },
  {
    category: "価格交渉",
    priority: "medium",
    patterns: [/値引/, /割引/, /価格.*相談/, /値下げ/, /見積/],
    ask: ["company", "name", "email", "requested_quantity"],
  },
  {
    category: "納期確認",
    priority: "medium",
    patterns: [/納期/, /いつ届く/, /発送日/, /出荷日/],
    ask: ["desired_date", "location"],
  },
  {
    category: "在庫確認",
    priority: "low",
    patterns: [/在庫/, /在庫.*ある/, /売り切れ/],
    ask: [],
  },
  {
    category: "AI導入相談",
    priority: "high",
    patterns: [
      /導入したい/,
      /自社.*使い/,
      /自社.*導入/,
      /うち.*導入/,
      /うち.*使え/,
      /他社.*使え/,
      /他のブランド.*使/,
      /同じよう.*Bot/i,
      /同じよう.*AI/i,
      /Inquiry AI/i,
      /問い合わせAI.*導入/,
      /見積もり/,
      /見積り/,
      /料金.*教え/,
      /いくら/,
      /プラン.*料金/,
      /スターター|プロプラン|エンタープライズ/,
    ],
    ask: ["company", "name", "email", "phone"],
  },
];

const FIELD_LABEL: Record<string, string> = {
  name: "お名前",
  company: "会社名",
  email: "メールアドレス",
  phone: "電話番号",
  requested_quantity: "ご希望数量",
  desired_date: "ご希望時期",
  location: "ご販売場所",
  last_topic: "詳しいご状況",
};

function existing(memory: ConversationMemory | null | undefined, key: string): boolean {
  if (!memory) return false;
  const v = (memory as any)[key];
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * メイン判定。
 */
export function detectEscalation(
  text: string,
  memory: ConversationMemory | null = null
): EscalationResult {
  // すでに引き継ぎ中なら継続
  const inProgress = memory?.handoff_required === true;

  let hit: Rule | null = null;
  for (const rule of RULES) {
    if (rule.patterns.some((re) => re.test(text))) {
      hit = rule;
      break;
    }
  }

  // ヒットしない場合：引き継ぎ中でなければ通常応答
  if (!hit) {
    if (inProgress) {
      // 引き継ぎ中ユーザーは継続フォローアップ
      const missing = previousMissing(memory);
      return {
        should_handoff: true,
        category: (memory?.handoff_category as EscalationCategory) || null,
        priority: (memory?.handoff_priority as Priority) || "medium",
        reason: "前回までに担当者引き継ぎ中のユーザーです",
        missing_fields: missing,
        next_question: makeNextQuestion(memory?.handoff_category || "ご相談", missing),
      };
    }
    return {
      should_handoff: false,
      category: null,
      priority: "low",
      reason: "通常のFAQ範囲",
      missing_fields: [],
      next_question: "",
    };
  }

  // 不足項目を計算
  const missing = hit.ask.filter((k) => !existing(memory, k));

  return {
    should_handoff: true,
    category: hit.category,
    priority: hit.priority,
    reason: `「${hit.category}」に該当するキーワードを検出`,
    missing_fields: missing,
    next_question: makeNextQuestion(hit.category, missing),
  };
}

function previousMissing(memory: ConversationMemory | null | undefined): string[] {
  if (!memory) return [];
  const wanted = ["company", "name", "email", "requested_quantity", "desired_date"];
  return wanted.filter((k) => !existing(memory, k));
}

function makeNextQuestion(category: string, missing: string[]): string {
  if (missing.length === 0) {
    return `ご相談ありがとうございます。「${category}」として担当者に共有いたしますね。担当者から個別にご連絡します🍔`;
  }
  const labels = missing.map((k) => FIELD_LABEL[k] || k);
  const list = labels.join("、");
  return `「${category}」のご相談、ありがとうございます！\n担当者にお繋ぎするため、よろしければ ${list} を教えていただけますか？`;
}

/**
 * 担当者通知用のサマリ。Slack/メール本文に使う。
 */
export function buildHandoffNotification(opts: {
  userId: string;
  userText: string;
  botReply: string;
  result: EscalationResult;
  memory: ConversationMemory | null;
}): {
  text: string;
  summary: string;
} {
  const { userId, userText, botReply, result, memory } = opts;
  const meta = memory || ({} as ConversationMemory);
  const lines = [
    `【#クリチ Inquiry AI】${result.category || "重要案件"}を検知`,
    `優先度：${result.priority.toUpperCase()}`,
    "",
    `LINE userId：${userId}`,
    `会社名：${meta.company || "—"}`,
    `お名前：${meta.name || "—"}`,
    `メール：${meta.email || "—"}`,
    `電話：${meta.phone || "—"}`,
    `希望数量：${meta.requested_quantity || "—"}`,
    `希望時期：${meta.desired_date || "—"}`,
    `販売予定場所：${meta.location || "—"}`,
    "",
    "■ お客様の発言",
    userText,
    "",
    "■ クリチちゃんの返答",
    botReply,
    "",
    "■ 不足情報",
    result.missing_fields.length > 0
      ? result.missing_fields.map((f) => FIELD_LABEL[f] || f).join(" / ")
      : "（揃っています）",
    "",
    "次の対応：担当者から連絡してください。",
  ];
  return {
    text: lines.join("\n"),
    summary:
      meta.last_summary ||
      `${result.category}：${userText.slice(0, 80)}${userText.length > 80 ? "..." : ""}`,
  };
}
