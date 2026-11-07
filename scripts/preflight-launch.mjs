#!/usr/bin/env node
/**
 * StatementFlow AI - 商业化上线与 Programmatic SEO 预检脚本 (scripts/preflight-launch.mjs)
 * 检查静态构建产物、12 个海外银行 pSEO 落地页、Sitemap/Robots、馆藏媒体资产及收款环境变量状态
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const EXPECTED_SLUGS = [
  "chase-bank-statement-to-excel",
  "wells-fargo-statement-to-csv",
  "bank-of-america-to-quickbooks",
  "citibank-statement-to-excel",
  "mercury-bank-statement-to-csv",
  "stripe-invoice-to-excel",
  "paypal-statement-to-csv",
  "wise-statement-to-xero",
  "barclays-uk-statement-to-csv",
  "revolut-business-to-excel",
  "hsbc-commercial-statement-to-excel",
  "amazon-uk-vat-invoice-to-excel",
];

const EXPECTED_ASSETS = [
  "public/assets/blythe-house-ledger-room-1924.jpg",
  "public/assets/specimen-sheet-of-bank-note-engraving.jpg",
  "public/assets/1000-bill-for-the-greenwich-bank-the.jpg",
  "public/assets/first-merchant-s-exchange-new-york-plan.jpg",
  "public/assets/new-york-stock-exchange-new-york-new.jpg",
  "public/assets/the-910-ton-printing-presses-at-the.webm",
  "public/assets/the-910-ton-printing-presses-at-the-poster.jpg",
  "assets/credits.json",
];

let failed = 0;

function pass(msg) {
  console.log(`  [PASS] ${msg}`);
}

function fail(msg) {
  console.error(`  [FAIL] ${msg}`);
  failed++;
}

function info(msg) {
  console.log(`  [INFO] ${msg}`);
}

console.log("\n==========================================================");
console.log("  StatementFlow AI — Commercial Launch & pSEO Preflight");
console.log("==========================================================\n");

// 1. 检查媒体资产与版权元数据
let assetsOk = true;
for (const rel of EXPECTED_ASSETS) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full) || fs.statSync(full).size < 100) {
    fail(`Missing or empty asset: ${rel}`);
    assetsOk = false;
  }
}
if (assetsOk) {
  pass(`All ${EXPECTED_ASSETS.length} archival media files & credits.json verified.`);
}

// 2. 检查 Next.js 生产构建产物与 12 个 Programmatic SEO 静态页面
const nextServerAppDir = path.join(ROOT, ".next", "server", "app");
if (!fs.existsSync(nextServerAppDir)) {
  fail("Missing .next/server/app directory. Run `npm run build` first.");
} else {
  let pseoCount = 0;
  for (const slug of EXPECTED_SLUGS) {
    const htmlPath = path.join(nextServerAppDir, "convert", slug + ".html");
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, "utf8");
      if (
        html.includes("SoftwareApplication") &&
        html.includes("FAQPage")
      ) {
        pseoCount++;
      } else {
        fail(`pSEO page /convert/${slug} is missing JSON-LD structured data.`);
      }
    } else {
      fail(`Missing pre-rendered pSEO HTML for /convert/${slug}`);
    }
  }
  if (pseoCount === EXPECTED_SLUGS.length) {
    pass(
      `All ${pseoCount}/${EXPECTED_SLUGS.length} Programmatic SEO bank converter pages statically generated with JSON-LD.`
    );
  }

  // 检查 sitemap.xml 与 robots.txt 路由产物
  const hasSitemap =
    fs.existsSync(path.join(nextServerAppDir, "sitemap.xml.body")) ||
    fs.existsSync(path.join(nextServerAppDir, "sitemap.xml", "route.js"));
  const hasRobots =
    fs.existsSync(path.join(nextServerAppDir, "robots.txt.body")) ||
    fs.existsSync(path.join(nextServerAppDir, "robots.txt", "route.js"));

  if (hasSitemap && hasRobots) {
    pass("Automated /sitemap.xml and /robots.txt crawlers configured.");
  } else {
    fail("Missing sitemap.xml or robots.txt build output.");
  }
}

// 3. 检查环境变量与商业化网关状态（自动读取 .env.local）
const envLocalPath = path.join(ROOT, ".env.local");
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const hasLemon = Boolean(process.env.LEMONSQUEEZY_API_KEY);
const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);
const hasLlmKey = Boolean(
  process.env.OPENAI_API_KEY || process.env.AI_API_KEY
);

console.log("\n--- Production Environment Readiness ---");
if (hasLemon || hasStripe) {
  pass(
    `Live payment gateway configured (${hasLemon ? "Lemon Squeezy MoR" : "Stripe Checkout"}).`
  );
} else {
  info(
    "Payment gateway currently in Keyless Sandbox Mode (set LEMONSQUEEZY_API_KEY or STRIPE_SECRET_KEY in Vercel to collect live USD)."
  );
}

if (hasLlmKey) {
  pass(
    `Server-side Bailian/Qwen LLM API configured (${process.env.AI_BASE_URL || process.env.OPENAI_BASE_URL} · ${process.env.AI_MODEL || process.env.OPENAI_MODEL}).`
  );
} else {
  info(
    "AI engine running in Keyless Demo + Heuristic Mode (users can also attach their own API key in the UI, or you can set OPENAI_API_KEY in Vercel)."
  );
}

console.log("");
if (failed > 0) {
  console.error(`Preflight failed with ${failed} error(s).\n`);
  process.exit(1);
} else {
  console.log("All technical & SEO preflight checks passed! Ready for Vercel deployment.\n");
}
