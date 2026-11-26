/**
 * StatementFlow AI Cloudflare Workers 边缘入口（安全限流 + D1 漏斗与订单持久化版）：
 * 1. POST /api/extract         — 双层速率限制 + 同源保护 + 千问文本/视觉平账提取
 * 2. POST /api/checkout        — 直连 Creem.io 实时收银（$9 Pro / $199 Firm Pilot）
 * 3. GET  /api/verify-checkout — 核验 Creem 结账单并幂等写入 D1 sf_orders
 * 4. POST /api/webhook         — 校验 Creem HMAC-SHA256 签名并写入 D1 sf_orders
 * 5. POST /api/event & GET /api/stats — 隐私友好匿名转化漏斗持久化与聚合看板
 */

interface D1Prepared {
  bind: (...args: unknown[]) => {
    run: () => Promise<unknown>;
    first: <T = Record<string, unknown>>() => Promise<T | null>;
    all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>;
  };
  run: () => Promise<unknown>;
  all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>;
}

interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  DB?: {
    prepare: (sql: string) => D1Prepared;
  };
  CREEM_API_KEY?: string;
  CREEM_PRODUCT_ID_PRO?: string;
  CREEM_PRODUCT_ID_BUSINESS?: string;
  CREEM_WEBHOOK_SECRET?: string;
  ADMIN_API_KEY?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  AI_API_KEY?: string;
  AI_BASE_URL?: string;
  AI_MODEL?: string;
}

const PLAN_METADATA = {
  pro: {
    name: "StatementFlow AI Pro",
    oneTimeUsd: 9,
    description: "One-time lifetime unlock: unlimited batch PDFs, Vision OCR & QuickBooks/Xero CSV",
  },
  business: {
    name: "StatementFlow Firm Pilot",
    oneTimeUsd: 199,
    description: "14-day boutique bookkeeping firm pilot with unlimited seats & custom bank tuning",
  },
} as const;

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Content-Security-Policy": "frame-ancestors 'self'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// 边缘内存双窗口速率限制器（防恶意脚本刷空大模型 API 余额）
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkEdgeRateLimit(ip: string, scope: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  if (rateBuckets.size > 4000) {
    for (const [k, v] of rateBuckets) {
      if (v.resetAt <= now) rateBuckets.delete(k);
    }
  }
  const key = `${scope}:${ip}`;
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= maxRequests) return false;
  bucket.count += 1;
  return true;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "0.0.0.0"
  );
}

let schemaReady = false;
async function ensureSfTables(env: Env): Promise<void> {
  if (schemaReady || !env.DB) return;
  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS sf_funnel_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event TEXT NOT NULL,
        country TEXT NOT NULL DEFAULT 'XX',
        meta_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    ).run();
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS sf_orders (
        order_id TEXT PRIMARY KEY,
        customer_email TEXT NOT NULL DEFAULT '',
        plan TEXT NOT NULL DEFAULT 'pro',
        amount_usd INTEGER NOT NULL DEFAULT 9,
        status TEXT NOT NULL DEFAULT 'completed',
        restore_token TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    ).run();
    try {
      await env.DB.prepare(
        `ALTER TABLE sf_orders ADD COLUMN restore_token TEXT NOT NULL DEFAULT ''`
      ).run();
    } catch {
      // 列已存在时安全忽略
    }
    try {
      await env.DB.prepare(
        `ALTER TABLE sf_orders ADD COLUMN email_sent INTEGER NOT NULL DEFAULT 0`
      ).run();
    } catch {
      // 列已存在时安全忽略
    }
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS email_outbox (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_label TEXT NOT NULL DEFAULT 'StatementFlow AI',
        to_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        body_text TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        sent_at TEXT NOT NULL DEFAULT ''
      )`
    ).run();
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS sf_pilot_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_email TEXT NOT NULL DEFAULT '',
        bank_name TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    ).run();
    schemaReady = true;
  } catch {
    // 降级不阻塞主流程
  }
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...SECURITY_HEADERS,
    },
  });
}

/**
 * 严格校验用户自定义 AI Base URL，阻断 SSRF 与私网/云元数据探测
 */
function isSafeExternalHttpsUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "[::1]" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifyCreemSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expectedHex = Array.from(new Uint8Array(sigBytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return timingSafeEqualHex(signature.toLowerCase(), expectedHex);
}

async function handleCheckout(request: Request, env: Env): Promise<Response> {
  const ip = getClientIp(request);
  if (!checkEdgeRateLimit(ip, "checkout", 15, 60_000)) {
    return jsonResponse({ error: "Too many checkout requests. Please wait a moment." }, 429);
  }
  try {
    const body = (await request.json()) as {
      plan?: string;
      email?: string;
      gateway?: string;
    };
    const plan = body.plan === "business" ? "business" : "pro";
    const customerEmail = body.email?.trim() || "";
    const meta = PLAN_METADATA[plan];
    const origin = request.headers.get("origin") || new URL(request.url).origin;

    const creemApiKey = env.CREEM_API_KEY?.trim();
    const productId =
      plan === "business"
        ? env.CREEM_PRODUCT_ID_BUSINESS?.trim()
        : env.CREEM_PRODUCT_ID_PRO?.trim();

    if (plan === "business" && !productId) {
      return jsonResponse({
        mode: "concierge_invoice",
        gateway: "Direct B2B Invoice",
        plan,
        planName: meta.name,
        amountUsd: meta.oneTimeUsd,
        description: meta.description,
        contactEmail: "hello@statementflow.win",
      });
    }

    if (creemApiKey && productId && body.gateway !== "stripe") {
      const creemPayload: Record<string, unknown> = {
        product_id: productId,
        success_url: `${origin}/?checkout=success&plan=${plan}`,
        request_id: `sf_${plan}_${Date.now()}`,
        metadata: { plan },
      };
      if (customerEmail) {
        creemPayload.customer = { email: customerEmail };
      }

      const creemRes = await fetch("https://api.creem.io/v1/checkouts", {
        method: "POST",
        headers: {
          "x-api-key": creemApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(creemPayload),
      });

      if (creemRes.ok) {
        const data = (await creemRes.json()) as { checkout_url?: string };
        if (data.checkout_url) {
          return jsonResponse({
            mode: "live_redirect",
            gateway: "Creem.io",
            checkoutUrl: data.checkout_url,
          });
        }
      }
    }

    return jsonResponse({
      mode: "sandbox",
      gateway: body.gateway === "stripe" ? "Stripe Sandbox" : "Creem.io MoR Sandbox",
      plan,
      planName: meta.name,
      amountUsd: meta.oneTimeUsd,
      description: meta.description,
      sessionId: `sbx_${plan}_${Date.now()}`,
    });
  } catch {
    return jsonResponse({ error: "Unable to initialize checkout session." }, 500);
  }
}

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get("creem-signature") || "";
  const secret = env.CREEM_WEBHOOK_SECRET?.trim() || "";

  if (!signature || !secret) {
    return jsonResponse({ error: "Webhook secret or signature header not configured." }, 400);
  }

  const valid = await verifyCreemSignature(rawBody, signature, secret);
  if (!valid) {
    return jsonResponse({ error: "Invalid webhook signature" }, 401);
  }

  const event = JSON.parse(rawBody) as {
    eventType?: string;
    id?: string;
    object?: {
      id?: string;
      customer?: { email?: string };
      metadata?: { plan?: string };
      order?: { amount?: number };
    };
  };

  if (env.DB) {
    await ensureSfTables(env);
    try {
      const obj = event.object || {};
      const orderId = obj.id || event.id || `sf_ord_${Date.now()}`;
      const email = (obj.customer?.email || "").trim().toLowerCase();
      const plan = obj.metadata?.plan === "business" ? "business" : "pro";
      const amountUsd = Math.round((obj.order?.amount || (plan === "business" ? 19900 : 900)) / 100);
      const evt = (event.eventType || "").toLowerCase();
      const status = /refund|cancel|dispute/.test(evt) ? "refunded" : "completed";
      const restoreToken = `sf_lic_${crypto.randomUUID().replace(/-/g, "")}`;
      await env.DB.prepare(
        `INSERT INTO sf_orders (order_id, customer_email, plan, amount_usd, status, restore_token)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(order_id) DO UPDATE SET status = ?5`
      )
        .bind(orderId, email, plan, amountUsd, status, restoreToken)
        .run();

      // 首次付款确认时，幂等检查 email_sent 防止 Creem 多事件重推导致重复发信，并读取库内真实 restore_token
      if (status === "completed" && email) {
        const saved = await env.DB.prepare(
          `SELECT restore_token, email_sent FROM sf_orders WHERE order_id = ?1 LIMIT 1`
        )
          .bind(orderId)
          .first<{ restore_token: string; email_sent?: number }>();
        if (!saved || Number(saved.email_sent || 0) === 0) {
          await env.DB.prepare(`UPDATE sf_orders SET email_sent = 1 WHERE order_id = ?1`)
            .bind(orderId)
            .run();
          const activeToken = saved?.restore_token || restoreToken;
          const activateUrl = `https://statementflow.win/?restore_token=${encodeURIComponent(activeToken)}`;
          await sendSfEmail(env, {
            to: email,
            subject:
              plan === "business"
                ? "Your StatementFlow Firm Pilot ($199) License & Team Activation Link"
                : "Your StatementFlow AI Pro ($9) Lifetime License & Multi-Device Link",
            text: [
              "Thank you for choosing StatementFlow AI!",
              "",
              `Plan Unlocked: ${plan === "business" ? "14-Day Boutique Firm Pilot (Unlimited Team Seats)" : "StatementFlow AI Pro (Lifetime Unlimited)"}`,
              `Order Reference: ${orderId}`,
              "",
              "Bookmark or share this 1-click activation link to unlock StatementFlow on any browser, new computer, or team workstation:",
              activateUrl,
              "",
              plan === "business"
                ? "Firm Pilot Concierge: Reply directly to this email (hello@statementflow.win) with any tricky scanned or regional bank PDFs and we will tune custom QBO/Xero presets within 24 hours."
                : "Need help at any time? Simply reply to this email (hello@statementflow.win).",
              "",
              "— StatementFlow Financial Engineering",
            ].join("\n"),
          });

          // 同步向创始人邮箱发送实时入账与交付通知
          await sendSfEmail(env, {
            to: "hello@statementflow.win",
            subject: `💰 [StatementFlow Paid] $${amountUsd} (${plan.toUpperCase()}) from ${email}`,
            text: [
              `New Paid Order on StatementFlow AI!`,
              `- Order ID: ${orderId}`,
              `- Customer: ${email}`,
              `- Plan: ${plan.toUpperCase()} ($${amountUsd})`,
              `- Activation Link Sent: ${activateUrl}`,
            ].join("\n"),
          });
        }
      }
    } catch {
      // 不阻断 Webhook 200 返回
    }
  }

  return jsonResponse({
    received: true,
    provider: "creem",
    eventType: event.eventType || "unknown",
  });
}

async function sendSfEmail(
  env: Env,
  params: { to: string; subject: string; text: string }
): Promise<boolean> {
  if (!params.to) return false;
  const apiKey = env.RESEND_API_KEY?.trim();
  if (apiKey) {
    const rawFrom =
      env.RESEND_FROM_EMAIL?.trim() || "StatementFlow AI <hello@mail.statementflow.win>";
    const from = rawFrom.replace(/@statementflow\.win\b/i, "@mail.statementflow.win");
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          reply_to: "hello@statementflow.win",
          to: [params.to],
          subject: params.subject,
          text: params.text,
        }),
      });
      if (res.ok) return true;
    } catch {
      // fallback to shared D1 outbox
    }
  }

  // 无独立密钥时自动写入与 LaunchPulse 共享的 D1 email_outbox 并触发即时投递
  if (env.DB) {
    try {
      await ensureSfTables(env);
      await env.DB.prepare(
        `INSERT INTO email_outbox (from_label, to_email, subject, body_text, status)
         VALUES ('StatementFlow AI', ?1, ?2, ?3, 'pending')`
      )
        .bind(params.to, params.subject, params.text)
        .run();
      await fetch("https://pulse.statementflow.win/api/internal/flush-outbox", {
        method: "POST",
      }).catch(() => {});
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

async function handleRestoreLicense(request: Request, env: Env): Promise<Response> {
  const ip = getClientIp(request);
  if (!checkEdgeRateLimit(ip, "restore", 12, 60_000)) {
    return jsonResponse({ ok: false, error: "Too many restore attempts. Please wait 60s." }, 429);
  }
  if (!env.DB) {
    return jsonResponse({ ok: false, error: "License service unavailable." }, 503);
  }
  await ensureSfTables(env);
  try {
    const body = (await request.json()) as {
      token?: string;
      email?: string;
      orderRef?: string;
    };
    const token = (body.token || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const orderRef = (body.orderRef || "").trim();

    // 路径 1：凭加密 restore_token 直接跨设备/多席位激活
    if (token && token.length >= 10) {
      const row = await env.DB.prepare(
        `SELECT order_id, customer_email, plan FROM sf_orders
         WHERE restore_token = ?1 AND status = 'completed' LIMIT 1`
      )
        .bind(token)
        .first<{ order_id: string; customer_email: string; plan: string }>();
      if (!row) {
        return jsonResponse(
          { ok: false, restored: false, error: "Invalid or expired activation link." },
          404
        );
      }
      return jsonResponse({
        ok: true,
        restored: true,
        plan: row.plan === "business" ? "business" : "pro",
        email: row.customer_email,
        orderId: row.order_id,
      });
    }

    // 路径 2：凭购买邮箱 + Creem 订单号（至少 6 位）即时双因子核验解锁
    if (email && email.includes("@") && orderRef.length >= 6) {
      const rows = await env.DB.prepare(
        `SELECT order_id, customer_email, plan, restore_token FROM sf_orders
         WHERE customer_email = ?1 AND status = 'completed'`
      )
        .bind(email)
        .all<{ order_id: string; customer_email: string; plan: string; restore_token: string }>();
      const matched = (rows.results || []).find(
        (r) =>
          r.order_id.toLowerCase().includes(orderRef.toLowerCase()) ||
          (r.restore_token && r.restore_token.toLowerCase() === orderRef.toLowerCase())
      );
      if (!matched) {
        return jsonResponse(
          {
            ok: false,
            restored: false,
            error: "No matching active order found for this email and order reference.",
          },
          404
        );
      }
      return jsonResponse({
        ok: true,
        restored: true,
        plan: matched.plan === "business" ? "business" : "pro",
        email: matched.customer_email,
        orderId: matched.order_id,
      });
    }

    // 路径 3：仅输入购买邮箱 -> 发送免密激活链接至本人收件箱（严格防撞库枚举）
    if (email && email.includes("@")) {
      const existing = await env.DB.prepare(
        `SELECT order_id, plan, restore_token FROM sf_orders
         WHERE customer_email = ?1 AND status = 'completed' ORDER BY created_at DESC LIMIT 1`
      )
        .bind(email)
        .first<{ order_id: string; plan: string; restore_token: string }>();
      if (existing) {
        let activeTok = existing.restore_token;
        if (!activeTok) {
          activeTok = `sf_lic_${crypto.randomUUID().replace(/-/g, "")}`;
          await env.DB.prepare(
            `UPDATE sf_orders SET restore_token = ?1 WHERE order_id = ?2`
          )
            .bind(activeTok, existing.order_id)
            .run();
        }
        const activateUrl = `https://statementflow.win/?restore_token=${encodeURIComponent(activeTok)}`;
        await sendSfEmail(env, {
          to: email,
          subject: "Your StatementFlow AI Instant Activation Link",
          text: [
            "Click the link below to restore your StatementFlow AI license on this device:",
            "",
            activateUrl,
            "",
            `Order Reference: ${existing.order_id}`,
            "",
            "— StatementFlow AI",
          ].join("\n"),
        });
      }
      return jsonResponse({
        ok: true,
        restored: false,
        magicLinkSent: true,
        message:
          "If an active paid license exists for this email, we just sent a 1-click activation link to your inbox.",
      });
    }

    return jsonResponse({ ok: false, error: "Please enter your checkout email address." }, 400);
  } catch {
    return jsonResponse({ ok: false, error: "Invalid restore request." }, 400);
  }
}

async function handleVerifyCheckout(request: Request, env: Env): Promise<Response> {
  const checkoutId = new URL(request.url).searchParams.get("checkout_id")?.trim();
  const creemApiKey = env.CREEM_API_KEY?.trim();

  if (!checkoutId || !creemApiKey) {
    return jsonResponse({ verified: false, error: "Missing checkout_id or API key" }, 400);
  }

  try {
    const res = await fetch(
      `https://api.creem.io/v1/checkouts?checkout_id=${encodeURIComponent(checkoutId)}`,
      { headers: { "x-api-key": creemApiKey } }
    );
    if (!res.ok) {
      return jsonResponse({ verified: false, status: "unverified" }, 402);
    }
    const data = (await res.json()) as {
      id?: string;
      status?: string;
      customer?: { email?: string };
      metadata?: { plan?: string };
    };
    const verified = data.status === "completed";
    const plan = data.metadata?.plan === "business" ? "business" : "pro";
    const email = (data.customer?.email || "").trim().toLowerCase();
    let restoreToken = "";
    if (verified && env.DB && data.id) {
      await ensureSfTables(env);
      try {
        const freshToken = `sf_lic_${crypto.randomUUID().replace(/-/g, "")}`;
        await env.DB.prepare(
          `INSERT INTO sf_orders (order_id, customer_email, plan, amount_usd, status, restore_token)
           VALUES (?1, ?2, ?3, ?4, 'completed', ?5)
           ON CONFLICT(order_id) DO NOTHING`
        )
          .bind(
            data.id,
            email,
            plan,
            plan === "business" ? 199 : 9,
            freshToken
          )
          .run();
        const saved = await env.DB.prepare(
          `SELECT restore_token FROM sf_orders WHERE order_id = ?1 LIMIT 1`
        )
          .bind(data.id)
          .first<{ restore_token: string }>();
        restoreToken = saved?.restore_token || freshToken;
      } catch {
        // ignore
      }
    }
    return jsonResponse({
      verified,
      status: data.status || "unknown",
      checkoutId: data.id,
      plan,
      email,
      restoreToken,
    });
  } catch {
    return jsonResponse({ verified: false, error: "Verification failed" }, 500);
  }
}

async function handleExtract(request: Request, env: Env): Promise<Response> {
  const startTime = Date.now();
  const ip = getClientIp(request);

  // 双窗口边缘限流：单 IP 每分钟最多 8 次、每小时最多 35 次，彻底阻断盗刷脚本
  if (
    !checkEdgeRateLimit(ip, "extract_min", 8, 60_000) ||
    !checkEdgeRateLimit(ip, "extract_hr", 35, 3_600_000)
  ) {
    return jsonResponse(
      { error: "Rate limit exceeded. Please wait a minute or unlock Pro / BYOK mode." },
      429
    );
  }

  try {
    const body = (await request.json()) as {
      rawText?: string;
      fileName?: string;
      pageImages?: string[];
      aiConfig?: {
        provider?: "demo" | "openai_compatible";
        apiKey?: string;
        baseUrl?: string;
        model?: string;
      };
    };

    const userProvidedKey =
      body.aiConfig?.provider === "openai_compatible"
        ? body.aiConfig.apiKey?.trim() || ""
        : "";

    // 使用平台托管大模型密钥时，校验同源 Origin / Referer 防外部脚本直接白嫖
    if (!userProvidedKey) {
      const originHeader = (request.headers.get("origin") || request.headers.get("referer") || "").toLowerCase();
      if (originHeader && !originHeader.includes("statementflow.win") && !originHeader.includes("localhost")) {
        return jsonResponse({ error: "Cross-origin API usage is not permitted." }, 403);
      }
    }

    const rawText = (body.rawText || "").trim();
    const pageImages = Array.isArray(body.pageImages)
      ? body.pageImages
          .filter(
            (img) =>
              typeof img === "string" &&
              img.startsWith("data:image/") &&
              img.length <= 3_500_000
          )
          .slice(0, 4)
      : [];
    const fileName = (body.fileName || "statement.pdf").trim().slice(0, 180);
    if ((!rawText || rawText.length < 10) && pageImages.length === 0) {
      return jsonResponse(
        { error: "Document text is empty and no scanned page images were provided." },
        400
      );
    }

    const userProvidedBaseUrl =
      body.aiConfig?.provider === "openai_compatible"
        ? body.aiConfig.baseUrl?.trim() || ""
        : "";

    if (userProvidedBaseUrl && !userProvidedKey) {
      return jsonResponse({ error: "Custom API Base URL requires your own API key." }, 400);
    }
    if (userProvidedBaseUrl && !isSafeExternalHttpsUrl(userProvidedBaseUrl)) {
      return jsonResponse(
        { error: "Custom API Base URL must be a valid public HTTPS endpoint." },
        400
      );
    }

    const effectiveKey = userProvidedKey || env.AI_API_KEY?.trim() || "";
    const effectiveBaseUrl = (
      (userProvidedKey && userProvidedBaseUrl) ||
      env.AI_BASE_URL?.trim() ||
      "https://maas.qianwenaiapi.com/compatible-mode/v1"
    ).replace(/\/+$/, "");
    const isVisionMode = pageImages.length > 0 && rawText.length < 40;
    const effectiveModel = isVisionMode
      ? "qwen-vl-plus"
      : (
          (body.aiConfig?.provider === "openai_compatible"
            ? body.aiConfig.model?.trim()
            : "") ||
          env.AI_MODEL?.trim() ||
          "qwen-plus"
        ).trim();

    if (!effectiveKey) {
      return jsonResponse({ error: "Cloud AI Engine is not configured on this worker." }, 503);
    }

    const systemPrompt = `You are a deterministic financial statement extraction engine.
Return ONLY a valid JSON object matching this exact schema (no markdown fences, no prose):
{
  "documentTitle": "string",
  "documentType": "bank_statement" | "saas_invoice" | "vat_receipt",
  "institution": "string",
  "accountOrInvoiceNumber": "string",
  "statementPeriod": "string",
  "currency": "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "SGD" | "HKD",
  "openingBalance": number,
  "closingBalance": number,
  "transactions": [
    {
      "id": "tx_1",
      "date": "YYYY-MM-DD",
      "description": "string",
      "merchant": "string",
      "category": "Revenue & Payouts" | "Cloud & SaaS" | "Payroll & Contractors" | "Office & Operations" | "Marketing & Ads" | "Travel & Meals" | "Taxes & Fees" | "Equipment & Hardware" | "Transfer" | "Uncategorized",
      "type": "credit" | "debit",
      "amount": number (positive),
      "signedAmount": number (+ for credit, - for debit),
      "confidence": number (0.5 to 1.0)
    }
  ]
}
Rules:
1. Extract EVERY single transaction line accurately. Never drop wrapped lines.
2. Ensure openingBalance + sum(credits) - sum(debits) matches closingBalance to the exact cent.
3. All amounts must be numeric floats rounded to 2 decimal places.`;

    const userMessageContent = isVisionMode
      ? [
          {
            type: "text",
            text: `File: ${fileName}\nExtract every transaction and opening/closing balance from these scanned bank statement page image(s) into the exact JSON schema.`,
          },
          ...pageImages.map((imgUrl) => ({
            type: "image_url",
            image_url: { url: imgUrl },
          })),
        ]
      : `File: ${fileName}\n\nStatement Text:\n${rawText.slice(0, 48000)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let llmRes: Response;
    try {
      llmRes = await fetch(`${effectiveBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${effectiveKey}`,
        },
        body: JSON.stringify({
          model: effectiveModel,
          temperature: 0,
          ...(isVisionMode ? {} : { response_format: { type: "json_object" } }),
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessageContent },
          ],
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!llmRes.ok) {
      return jsonResponse({ error: `AI provider returned HTTP ${llmRes.status}` }, 502);
    }

    const llmJson = (await llmRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = llmJson.choices?.[0]?.message?.content?.trim() || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return jsonResponse({ error: "AI returned non-JSON payload." }, 502);
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const rawTxs = Array.isArray(parsed.transactions) ? parsed.transactions : [];
    const transactions = rawTxs.map((tx: Record<string, unknown>, idx: number) => {
      const type = tx.type === "credit" ? "credit" : "debit";
      const amount = Math.round(Math.abs(Number(tx.amount) || 0) * 100) / 100;
      const signedAmount = type === "credit" ? amount : -amount;
      return {
        id: String(tx.id || `tx_${idx + 1}`),
        date: String(tx.date || new Date().toISOString().slice(0, 10)),
        description: String(tx.description || "Transaction"),
        merchant: String(tx.merchant || tx.description || "Merchant"),
        category: String(tx.category || "Uncategorized"),
        type,
        amount,
        signedAmount,
        confidence: Math.min(1, Math.max(0.5, Number(tx.confidence) || 0.94)),
      };
    });

    const openingCents = Math.round((Number(parsed.openingBalance) || 0) * 100);
    const closingCents = Math.round((Number(parsed.closingBalance) || 0) * 100);
    let creditsCents = 0;
    let debitsCents = 0;
    for (const tx of transactions) {
      if (tx.type === "credit") creditsCents += Math.round(tx.amount * 100);
      else debitsCents += Math.round(tx.amount * 100);
    }
    const calculatedClosingCents = openingCents + creditsCents - debitsCents;
    const discrepancyCents = closingCents - calculatedClosingCents;

    if (env.DB) {
      await ensureSfTables(env);
      try {
        await env.DB.prepare(
          `INSERT INTO sf_funnel_events (event, country, meta_json) VALUES (?1, ?2, ?3)`
        )
          .bind(
            Math.abs(discrepancyCents) === 0 ? "api_extract_balanced" : "api_extract_unbalanced",
            request.headers.get("cf-ipcountry") || "XX",
            JSON.stringify({ txCount: transactions.length, vision: isVisionMode })
          )
          .run();
      } catch {
        // ignore
      }
    }

    const result = {
      documentTitle: String(parsed.documentTitle || fileName),
      documentType: String(parsed.documentType || "bank_statement"),
      institution: String(parsed.institution || "Financial Institution"),
      accountOrInvoiceNumber: String(parsed.accountOrInvoiceNumber || "N/A"),
      statementPeriod: String(parsed.statementPeriod || "Statement Period"),
      currency: String(parsed.currency || "USD"),
      transactions,
      reconciliation: {
        openingBalance: openingCents / 100,
        closingBalance: closingCents / 100,
        totalCredits: creditsCents / 100,
        totalDebits: debitsCents / 100,
        netCashflow: (creditsCents - debitsCents) / 100,
        calculatedClosing: calculatedClosingCents / 100,
        discrepancy: discrepancyCents / 100,
        isBalanced: Math.abs(discrepancyCents) === 0,
      },
      meta: {
        modeUsed: "llm_verified",
        providerName: "StatementFlow Cloud AI",
        modelName: effectiveModel,
        latencyMs: Date.now() - startTime,
        warnings: [],
      },
    };

    return jsonResponse({ result });
  } catch {
    return jsonResponse(
      { error: "Extraction failed due to an upstream or parsing error. Please retry." },
      500
    );
  }
}

async function handleEvent(request: Request, env: Env): Promise<Response> {
  const ip = getClientIp(request);
  if (!checkEdgeRateLimit(ip, "event", 60, 60_000)) {
    return jsonResponse({ ok: true, throttled: true });
  }
  try {
    const body = (await request.json()) as {
      event?: string;
      meta?: Record<string, string | number | boolean>;
    };
    const eventName = String(body.event || "unknown").slice(0, 48);
    const country = request.headers.get("cf-ipcountry") || "XX";
    if (env.DB) {
      await ensureSfTables(env);
      await env.DB.prepare(
        `INSERT INTO sf_funnel_events (event, country, meta_json) VALUES (?1, ?2, ?3)`
      )
        .bind(eventName, country, JSON.stringify(body.meta || {}).slice(0, 300))
        .run();
    }
    return jsonResponse({ ok: true });
  } catch {
    return jsonResponse({ ok: false }, 400);
  }
}

async function handleStats(request: Request, env: Env): Promise<Response> {
  const adminKey = env.ADMIN_API_KEY?.trim() || "";
  const provided = (request.headers.get("x-admin-key") || "").trim();
  if (!adminKey || !provided || !timingSafeEqualHex(provided, adminKey)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
  if (!env.DB) return jsonResponse({ ok: false, error: "DB not bound" }, 503);
  await ensureSfTables(env);
  const [funnelRes, ordersRes] = await Promise.all([
    env.DB.prepare(
      `SELECT event, COUNT(*) AS cnt FROM sf_funnel_events GROUP BY event ORDER BY cnt DESC`
    ).all<{ event: string; cnt: number }>(),
    env.DB.prepare(
      `SELECT plan, COUNT(*) AS orders, COALESCE(SUM(amount_usd), 0) AS revenue_usd
       FROM sf_orders WHERE status = 'completed' GROUP BY plan`
    ).all<{ plan: string; orders: number; revenue_usd: number }>(),
  ]);
  return jsonResponse({
    ok: true,
    funnel: funnelRes.results || [],
    orders: ordersRes.results || [],
  });
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/health" && request.method === "GET") {
      return jsonResponse({ ok: true, service: "statementflow-ai" });
    }

    if (pathname === "/api/pilot-intake" && request.method === "POST") {
      const ip = getClientIp(request);
      if (!checkEdgeRateLimit(ip, "pilot_intake", 8, 60_000)) {
        return jsonResponse({ ok: false, error: "Too many submissions." }, 429);
      }
      try {
        const body = (await request.json()) as { email?: string; bankName?: string; notes?: string };
        const email = (body.email || "").trim().toLowerCase().slice(0, 120);
        const bankName = (body.bankName || "").trim().slice(0, 120);
        const notes = (body.notes || "").trim().slice(0, 800);
        if (!email || !email.includes("@")) {
          return jsonResponse({ ok: false, error: "Please provide your Firm Pilot checkout email." }, 400);
        }
        if (!bankName) return jsonResponse({ ok: false, error: "Please enter bank/institution name." }, 400);
        if (!env.DB) return jsonResponse({ ok: false, error: "Database unavailable." }, 503);
        await ensureSfTables(env);
        const paidPilot = await env.DB.prepare(
          `SELECT order_id FROM sf_orders WHERE LOWER(customer_email) = ?1 AND plan = 'business' AND status = 'completed' LIMIT 1`
        )
          .bind(email)
          .first<{ order_id: string }>();
        if (!paidPilot) {
          return jsonResponse(
            { ok: false, error: "Active $199 Firm Pilot license required for custom bank tuning." },
            403
          );
        }
        await env.DB.prepare(
          `INSERT INTO sf_pilot_requests (customer_email, bank_name, notes) VALUES (?1, ?2, ?3)`
        )
          .bind(email, bankName, notes)
          .run();
        await sendSfEmail(env, {
          to: "hello@statementflow.win",
          subject: `🏦 [Firm Pilot Custom Bank Request] ${bankName} (${email})`,
          text: `Order: ${paidPilot.order_id}\nCustomer: ${email}\nBank / Institution: ${bankName}\nNotes / Column Preset Request:\n${notes}`,
        });
        return jsonResponse({ ok: true });
      } catch {
        return jsonResponse({ ok: false }, 400);
      }
    }

    if (pathname === "/api/license/restore" && request.method === "POST") {
      return handleRestoreLicense(request, env);
    }

    if (pathname === "/api/event" && request.method === "POST") {
      return handleEvent(request, env);
    }

    if (pathname === "/api/stats" && request.method === "GET") {
      return handleStats(request, env);
    }

    if (pathname === "/api/extract" && request.method === "POST") {
      return handleExtract(request, env);
    }

    if (pathname === "/api/checkout" && request.method === "POST") {
      return handleCheckout(request, env);
    }

    if (pathname === "/api/verify-checkout" && request.method === "GET") {
      return handleVerifyCheckout(request, env);
    }

    if (pathname === "/api/webhook" && request.method === "POST") {
      return handleWebhook(request, env);
    }

    const assetRes = await env.ASSETS.fetch(request);
    const hdrs = new Headers(assetRes.headers);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
      hdrs.set(k, v);
    }
    return new Response(assetRes.body, { status: assetRes.status, headers: hdrs });
  },
};

export default worker;
