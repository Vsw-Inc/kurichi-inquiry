/**
 * FAQ 固定回答。
 * 定番かつ規程から明確な質問は、AI（Claude API）を呼ばず即答する。
 * → コスト ¥0・レイテンシ 0秒。
 *
 * ⚠️ 回答内容は規程と完全一致させること（誤答防止）。
 *   曖昧・複雑な質問は FAQ に入れず、AI に任せる方が安全。
 */

export type Faq = {
  id: string;
  keywords: string[]; // いずれか1つでも質問に含まれればヒット
  answer: string;
  citation: string;
};

export const FAQS: Faq[] = [
  {
    id: "payday",
    keywords: [
      "給料日",
      "給与日",
      "給料はいつ",
      "給与はいつ",
      "給料いつ",
      "給与いつ",
      "支給日",
      "振込日",
      "いつ振り込",
      "給料もらえる",
      "給料振り込",
      "お給料いつ",
    ],
    answer:
      "給料日は毎月20日だよ！\n20日が土日祝など金融機関の休業日にあたる場合は、その直前の営業日に振り込まれるから安心してね。\n給与の計算期間は当月1日〜末日で、その分が翌月20日に支払われる仕組みだよ。",
    citation: "給与規程 第1章 総則 第6条（給与の計算期間及び支給日）",
  },
  {
    id: "pay-period",
    keywords: ["締め日", "給与の計算期間", "給料の計算期間", "何日締め", "締めはいつ"],
    answer:
      "給与の計算期間は当月1日〜末日（月末締め）だよ。\nその分が翌月20日に支払われるよ。",
    citation: "給与規程 第1章 総則 第6条（給与の計算期間及び支給日）",
  },
  {
    id: "consult",
    keywords: [
      "店長に相談",
      "誰に相談",
      "どこに相談",
      "相談したい",
      "困ってる",
      "困っています",
      "助けて",
      "誰に聞けば",
      "どうすればいい",
    ],
    answer:
      "困ったときは、まず店長に相談してね。\nシフトや体調、仕事の悩みなど、どんなことでも大丈夫だよ。\n規程で確認できることは私（ヴィーチェ）にも聞いてね🌿",
    citation: "相談窓口のご案内",
  },
];

/**
 * 質問にFAQがマッチするか判定。マッチしたFAQ or null。
 */
export function matchFaq(question: string): Faq | null {
  const q = question.replace(/\s|　/g, "");
  for (const faq of FAQS) {
    for (const kw of faq.keywords) {
      if (q.includes(kw.replace(/\s|　/g, ""))) {
        return faq;
      }
    }
  }
  return null;
}
