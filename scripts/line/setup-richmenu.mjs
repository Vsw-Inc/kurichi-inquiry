#!/usr/bin/env node
/**
 * クリチ LINE リッチメニューを作成・画像アップ・デフォルト適用。
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
const auth = (extra = {}) => ({
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
  ...extra,
});

async function listRichMenus() {
  const r = await fetch(`${API}/richmenu/list`, { headers: auth() });
  if (!r.ok) throw new Error(`list failed: ${r.status} ${await r.text()}`);
  return (await r.json()).richmenus || [];
}
async function deleteRichMenu(id) {
  await fetch(`${API}/richmenu/${id}`, { method: "DELETE", headers: auth() });
}
async function createRichMenu(body) {
  const r = await fetch(`${API}/richmenu`, {
    method: "POST",
    headers: auth(),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`create failed: ${r.status} ${await r.text()}`);
  return (await r.json()).richMenuId;
}
async function uploadImage(id, imagePath) {
  const data = await fs.readFile(imagePath);
  const r = await fetch(`${API_DATA}/richmenu/${id}/content`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "image/png",
    },
    body: data,
  });
  if (!r.ok) throw new Error(`upload failed: ${r.status} ${await r.text()}`);
}
async function setDefault(id) {
  const r = await fetch(`${API}/user/all/richmenu/${id}`, {
    method: "POST",
    headers: auth(),
  });
  if (!r.ok) throw new Error(`setDefault failed: ${r.status} ${await r.text()}`);
}

// 画像 2500 x 1686 を 上段3セル(833x843) + 下段2セル(1250x843)
const RICH_MENU_BODY = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "クリチ メインメニュー",
  chatBarText: "メニュー",
  areas: [
    // 上段 1：オンラインショップ
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: {
        type: "uri",
        uri: "https://kurichi.vsw.co.jp/",
        label: "オンラインショップ",
      },
    },
    // 上段 2：ホームページ
    {
      bounds: { x: 833, y: 0, width: 834, height: 843 },
      action: {
        type: "uri",
        uri: "https://vsw.co.jp/index.html#contact",
        label: "ホームページ",
      },
    },
    // 上段 3：ビジネス
    {
      bounds: { x: 1667, y: 0, width: 833, height: 843 },
      action: {
        type: "uri",
        uri: "https://vsw.co.jp/business/index.html",
        label: "ビジネス",
      },
    },
    // 下段 1：メール
    {
      bounds: { x: 0, y: 843, width: 1250, height: 843 },
      action: {
        type: "uri",
        uri: "mailto:info@vsw.jp?subject=%E3%82%AF%E3%83%AA%E3%83%81%E3%81%B8%E3%81%AE%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B",
        label: "メールで相談",
      },
    },
    // 下段 2：電話
    {
      bounds: { x: 1250, y: 843, width: 1250, height: 843 },
      action: {
        type: "uri",
        uri: "tel:0727375444",
        label: "電話で相談",
      },
    },
  ],
};

async function main() {
  await loadEnv();
  TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!TOKEN) {
    console.error("ERROR: LINE_CHANNEL_ACCESS_TOKEN が未設定");
    process.exit(1);
  }
  const imagePath = path.join(ROOT, "scripts/line/richmenu.png");
  await fs.access(imagePath);

  console.log(`Image: ${path.relative(ROOT, imagePath)}`);

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

  console.log("\nリッチメニュー作成中...");
  const id = await createRichMenu(RICH_MENU_BODY);
  console.log(`✓ 作成成功：${id}`);

  console.log("\n画像アップロード中...");
  await uploadImage(id, imagePath);
  console.log("✓ アップロード成功");

  console.log("\nデフォルト設定中...");
  await setDefault(id);
  console.log("✓ デフォルト適用完了");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🍔 クリチ リッチメニュー設定完了！");
  console.log("LINE @552gvrkj のトーク画面下に表示されます。");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
