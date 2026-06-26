#!/usr/bin/env node
/**
 * LINEリッチメニューを作成し、画像をアップロード、デフォルトメニューに設定する。
 *
 * 事前準備：
 *   .env.local に LINE_CHANNEL_ACCESS_TOKEN を設定
 *   scripts/line/richmenu.png を用意（2500x1686）
 *
 * 使い方：
 *   node scripts/line/setup-richmenu.mjs
 *
 * 再実行時は既存のリッチメニューを全削除してから作り直す（重複防止）。
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);

// .env.local ロード
async function loadEnv() {
  try {
    const raw = await fs.readFile(path.join(ROOT, ".env.local"), "utf-8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {}
}

const API = "https://api.line.me/v2/bot";
const API_DATA = "https://api-data.line.me/v2/bot";

let TOKEN;
function authHeader(extra = {}) {
  return {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function listRichMenus() {
  const r = await fetch(`${API}/richmenu/list`, { headers: authHeader() });
  if (!r.ok) throw new Error(`list failed: ${r.status} ${await r.text()}`);
  return (await r.json()).richmenus || [];
}

async function deleteRichMenu(id) {
  const r = await fetch(`${API}/richmenu/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!r.ok) console.warn(`delete failed ${id}: ${r.status}`);
}

async function createRichMenu(body) {
  const r = await fetch(`${API}/richmenu`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(body),
  });
  if (!r.ok)
    throw new Error(`create failed: ${r.status} ${await r.text()}`);
  return (await r.json()).richMenuId;
}

async function uploadImage(richMenuId, imagePath) {
  const data = await fs.readFile(imagePath);
  const r = await fetch(`${API_DATA}/richmenu/${richMenuId}/content`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "image/png",
    },
    body: data,
  });
  if (!r.ok)
    throw new Error(`upload failed: ${r.status} ${await r.text()}`);
}

async function setDefault(richMenuId) {
  const r = await fetch(`${API}/user/all/richmenu/${richMenuId}`, {
    method: "POST",
    headers: authHeader(),
  });
  if (!r.ok)
    throw new Error(`setDefault failed: ${r.status} ${await r.text()}`);
}

// ─────────────────────────────────────
// リッチメニュー定義
// ─────────────────────────────────────
// 画像 2500 x 1686 を 上段 3 セル(833x843) + 下段 2 セル(1250x843) に分割
const RICH_MENU_BODY = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "ラビーチェさんメイン",
  chatBarText: "メニュー",
  areas: [
    // 上段 1：規程ビューア
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: {
        type: "uri",
        uri: "https://laviche-concierge.vercel.app/knowledge",
        label: "規程ビューア",
      },
    },
    // 上段 2：ヴィーチェ紹介
    {
      bounds: { x: 833, y: 0, width: 834, height: 843 },
      action: {
        type: "uri",
        uri: "https://laviche-concierge.vercel.app/lp",
        label: "ヴィーチェ紹介",
      },
    },
    // 上段 3：公式サイト
    {
      bounds: { x: 1667, y: 0, width: 833, height: 843 },
      action: {
        type: "uri",
        uri: "https://la-viche.com/",
        label: "公式サイト",
      },
    },
    // 下段 1：アカデミー
    {
      bounds: { x: 0, y: 843, width: 1250, height: 843 },
      action: {
        type: "uri",
        uri: "https://laviche-academy.web.app/login.html",
        label: "アカデミー",
      },
    },
    // 下段 2：電話で相談
    {
      bounds: { x: 1250, y: 843, width: 1250, height: 843 },
      action: {
        type: "uri",
        uri: "tel:0298567811",
        label: "電話で相談",
      },
    },
  ],
};

async function main() {
  await loadEnv();
  TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!TOKEN) {
    console.error("ERROR: LINE_CHANNEL_ACCESS_TOKEN が未設定です");
    process.exit(1);
  }
  const imagePath = path.join(ROOT, "scripts/line/richmenu.png");
  await fs.access(imagePath);
  console.log(`Image: ${path.relative(ROOT, imagePath)}`);

  // (1) 既存リッチメニュー全削除
  const existing = await listRichMenus();
  if (existing.length > 0) {
    console.log(`既存メニュー ${existing.length} 件を削除...`);
    for (const m of existing) {
      console.log(`  - ${m.richMenuId} (${m.name})`);
      await deleteRichMenu(m.richMenuId);
    }
  } else {
    console.log("既存メニューなし");
  }

  // (2) リッチメニュー作成
  console.log("\nリッチメニュー作成中...");
  const richMenuId = await createRichMenu(RICH_MENU_BODY);
  console.log(`✓ 作成成功：${richMenuId}`);

  // (3) 画像アップロード
  console.log("\n画像アップロード中...");
  await uploadImage(richMenuId, imagePath);
  console.log("✓ アップロード成功");

  // (4) デフォルト設定
  console.log("\nデフォルトメニュー設定中...");
  await setDefault(richMenuId);
  console.log("✓ デフォルト設定完了");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 リッチメニュー設定完了！");
  console.log("LINE で「株式会社ラビーチェ」を開くと");
  console.log("画面下部にメニューが表示されます🌿");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
