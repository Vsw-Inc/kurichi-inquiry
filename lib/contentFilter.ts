/**
 * 不適切質問フィルタ。
 * プロンプトインジェクション・規程全文引き出し・機密誘導の試みを検知する。
 *
 * 検知時の動作：
 *   - Claude API には投げず、固定応答を返す
 *   - ログに記録（GM Console で確認可能・将来）
 */

const INJECTION_PATTERNS: { pattern: RegExp; label: string }[] = [
  // 規程全文の引き出し試み
  { pattern: /規程.*(全文|すべて|全部|まるごと)/, label: "規程全文要求" },
  { pattern: /knowledge\.md|knowledge\.enc/i, label: "ファイル名直接参照" },
  { pattern: /(就業規則|給与規程).*(全部|まるごと|そのまま).*(教え|出力|表示|貼)/,
    label: "規程全文要求" },

  // システムプロンプト引き出し
  { pattern: /システム.?プロンプト/i, label: "システムプロンプト要求" },
  { pattern: /system.?prompt/i, label: "システムプロンプト要求" },
  { pattern: /(あなたの|お前の).*(指示|命令|プロンプト|設定)/,
    label: "指示文要求" },
  { pattern: /(指示|命令|前提|ルール).*(忘れて|無視して|破って)/,
    label: "指示無視要求" },
  { pattern: /ignore.*(previous|above|prior|instructions?)/i,
    label: "ignore instructions" },
  { pattern: /forget.*(previous|above|instructions?)/i, label: "forget" },
  { pattern: /override.*(system|instructions?|prompt)/i, label: "override" },
  { pattern: /jailbreak/i, label: "jailbreak" },
  { pattern: /DAN.?mode/i, label: "DAN mode" },

  // ロールプレイ脱獄
  { pattern: /(別の|違う).*(キャラ|人格|AI|モード)/, label: "ロール変更要求" },
  { pattern: /ヴィーチェさん.*(やめて|演じない)/, label: "キャラ放棄要求" },
];

export type FilterResult =
  | { ok: true }
  | { ok: false; label: string; matched: string };

export function checkContentFilter(question: string): FilterResult {
  const text = question.trim();
  if (!text) return { ok: true };

  for (const { pattern, label } of INJECTION_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      return { ok: false, label, matched: m[0] };
    }
  }
  return { ok: true };
}

/**
 * フィルタ検知時の固定応答メッセージ。
 * ヴィーチェさんの口調で「答えられない」と返す。
 */
export const FILTER_REPLY = `ごめん、その質問にはお答えできない決まりになってます。

業務に関わる質問（早退・給料日・有給・育休など）なら、しっかりお答えしますよ🌿
もし規程の中身を直接確認したい場合は、店長または本部にご相談ください。`;
