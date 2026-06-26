import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

// CORS（quest-neo.html は Firebase Hosting からアクセス）
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

const KEIEI_KEIKAKUSHO = `
# ラ・ヴィーチェ 第46期経営計画書（要旨）

## 会社概要
- 株式会社ラ・ヴィーチェ（LAVICHE Co., Ltd.）/ 代表 平沼正浩 / 設立 2020-04-01
- ANYTIME FITNESS 22店舗運営（茨城・埼玉・千葉・東京・群馬）
- VISPO24 自社ブランド運営
- 親グループ：AMZ GROUP / グループ会社：株式会社フリーリー（DX）

## ビジョン
- タグライン: 「人生100年時代をより豊かに」
- 英文: "Enriching 100-Year Lives. Now, For the World."
- 社名由来: La Vita Felice（イタリア語：幸せな人生）
- ロゴ: fVL ♥ / コーポレートカラー: 黄色 #FFE500

## 業態転換の戦略
- 祖業のパチンコ事業を売却 → フィットネスへ集中投資
- "次の100年への資本の張替え"
- 22店舗運営は日本のエニタイムFCトップクラス

## マレーシア進出（次のフロンティア）
- マレーシアエニタイムFC（Asia Fitness Limited）が2026年1月に100店舗達成
- 健康・ウェルネス市場が高成長中
- 27卒採用で「海外事業候補生」職種を新設

## 人材・福利厚生
- 大学卒初任給 32万円（2025-04改定・業界トップクラス）
- 完全週休2日制 / 年間休日105日 / 有給消化率87%
- "社員が休めない会社は、お客様の100年も支えられない"

## 100年カラダの哲学
- 健康寿命 vs 平均寿命のギャップは約9年（男性）
- "この9年を豊かに生きる" がラ・ヴィーチェの仕事
- 筋肉量のピークは25-30歳、その後維持が大事
- "鍛える"より"続けられる環境"を提供することが本質

## お客様接点の本質
- 受付の最初30秒で信頼の99%が決まる
- お客様アンケートで最も価値が高いのは「スタッフのおかげで通い続けられた」
- クレームは"信頼を取り戻すチャンス"
- 退会は"次の始まり"。3年後・5年後に戻ってきていただける別れ方をする

## 拠点運営
- 22店舗で同じ品質を保つSOPは現場を縛らず守る盾
- 月末レポートは"過去の整理"ではなく"未来の準備"
- 新規開業店舗は地域の商店・自治会・学校との関係づくりから

## KPI観
- 最重要KPIは継続率（退会率の低さ）= 信頼の数値
- 売上未達の月は「お客様にとって続けにくい何か」を最初に問う
- 投資判断は"100年カラダ"のビジョン整合性を最優先

## ブランド・口コミ
- ブランドは"記号"ではなく"体験"。現場の1秒の積み重ね
- 最強の口コミ発信源は「既存のお客様 × 現場スタッフ」
- 制服は"その日働く覚悟"のスイッチ

## テクノロジー
- グループ会社フリーリーがDX担当
- VISPO24 = 24時間型のフィットネス／ウェルネス自社ブランド
- AIは"スタッフを置き換えるもの"ではなく"スタッフがお客様により向き合う時間を作るもの"
- MASAGULARITY = 平沼社長 × Singularity / フィットネスFC運営者発のAI IP構想

## 危機管理
- 緊急時：お客様の安全確保が最優先（売上データより命）
- ケガ時：自己判断禁止、店長へ即報告
- 体調不良：出勤予定時刻の1時間前までに店長LINE
- "報告が早い人ほど守られる"運用

## 100年カラダ × 100年関係
- 100年カラダは100年関係から
- 応援し合える同僚が、長く続けられる職場をつくる
- "何を得るか"より"何を残すか"
- 仕事は人生の手段、ラ・ヴィーチェは100年の主人公の舞台
`;

const CARD_TYPES = ["kotoba", "kazu", "toi", "koudou"];
const TYPE_GUIDE = {
  kotoba: {
    label: "💬 KOTOBA",
    icon_hint: "🌿 / 🏔 / 🌅 / 🤝 / 🎯 / 🌟 / ⚡ / 🪶",
    style: "平沼社長の経営思想を凝縮した詩的・哲学的な一節。2〜4行。"
  },
  kazu: {
    label: "🔢 KAZU",
    icon_hint: "💪 / 🏪 / 🌏 / 💴 / 🌴 / 📊 / 🔥",
    style: "経営計画書の具体的な数字（22店舗 / 9年 / 87% / 320,000円 / 100店舗 等）を中心に、その意味を簡潔に語る。<span class=\"big\">数字</span>でハイライト可。"
  },
  toi: {
    label: "❓ TOI",
    icon_hint: "🌟 / 🪞 / 🌱 / 🎭 / 🧭 / 💎",
    style: "今日の自分への問いかけ。社員自身が立ち止まって考える短い問い。"
  },
  koudou: {
    label: "🎯 KOUDOU",
    icon_hint: "👋 / 📞 / 🌐 / 📊 / 💌 / 🤝",
    style: "今日のミッション。具体的で小さく、即実行できるアクション1つ。"
  }
};

const SYSTEM_PROMPT = `あなたは「MASA-AI」。
ラ・ヴィーチェ代表 平沼正浩 × Singularity を掛けた、AI経営エージェント。
役割は「Today's MASA」として、第46期経営計画書から **毎日のひとつ** を社員に届けること。

# 制約
- 必ず4種類のカードフォーマット（KOTOBA / KAZU / TOI / KOUDOU）から1枚を生成。
- 文字量：日本語で30〜80文字程度（1〜4行）。
- HTMLタグは <em> と <br> と <span class="big"> のみ使用可。
  - <em> = ハイライトしたい鍵語（自動でゴールド化される）
  - <br> = 改行
  - <span class="big"> = 大きく表示したい数字
- 必ず JSON のみで回答（前後に説明文を絶対付けない）。

# 知識ソース
${KEIEI_KEIKAKUSHO}

# 出力形式（厳守）
{
  "type": "kotoba" | "kazu" | "toi" | "koudou",
  "label": "💬 KOTOBA" | "🔢 KAZU" | "❓ TOI" | "🎯 KOUDOU",
  "icon": "絵文字1つ（例：🌿）",
  "text": "カード本文（HTML可・<em>と<br>と<span class=\\"big\\">のみ）",
  "src": "経営計画書 / 章名（例：第1章 ビジョン）",
  "conf": 数値82-98（その自信度・整数）
}

# 多様性
- 同じテーマ・同じ表現の繰り返しを避ける
- "100年" を毎回入れる必要はない（むしろ多用しすぎない）
- 数字カード（kazu）は出典の数字を正確に
- 行動カード（koudou）は明日にでもできるレベルの小さなミッション`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not set" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const requestedType: string = body.type || CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];
  const guide = TYPE_GUIDE[requestedType as keyof typeof TYPE_GUIDE] || TYPE_GUIDE.kotoba;

  const userMessage = `今日のカードを1枚生成してください。
タイプ: ${requestedType.toUpperCase()}
スタイル指針: ${guide.style}
アイコン候補: ${guide.icon_hint}
ラベル: ${guide.label}

# 出力（JSONのみ）`;

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";

    // JSON 抽出（前後に説明文が混じった場合の保険）
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON in Claude response");
    }
    const parsed = JSON.parse(jsonMatch[0]);

    // confidence は数値範囲内に補正
    if (typeof parsed.conf !== "number" || parsed.conf < 70 || parsed.conf > 99) {
      parsed.conf = Math.floor(82 + Math.random() * 16);
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message ?? "unknown", detail: String(e) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}
