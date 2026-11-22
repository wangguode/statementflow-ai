/**
 * Cloudflare Workers 边缘入口：
 * 1. 处理 /api/checkout（调用 Creem.io Checkout API 生成实时美元结账链接）
 * 2. 处理 /api/webhook（校验 Creem Webhook HMAC-SHA256 签名）
 * 3. 其余全部静态页面与资源交给 Cloudflare Assets 托管
 */

interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  CREEM_API_KEY?: string;
  CREEM_PRODUCT_ID_PRO?: string;
  CREEM_PRODUCT_ID_BUSINESS?: string;
  CREEM_WEBHOOK_SECRET?: string;
  AI_API_KEY?: string;
  AI_BASE_URL?: string;
  AI_MODEL?: string;
}

const PLAN_METADATA = {
  pro: {
    name: "StatementFlow Pro",
    monthlyUsd: 19,
    description: "500 pages/mo, multi-currency Excel/CSV export & auto-reconciliation",
  },
  business: {
    name: "StatementFlow Business",
    monthlyUsd: 49,
    description: "Unlimited pages, QuickBooks/Xero JSON schema & batch API access",
  },
} as const;

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

/**
 * 常量时间比对十六进制签名，避免时序侧信道泄露
 */
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
        ? env.CREEM_PRODUCT_ID_BUSINESS?.trim() || env.CREEM_PRODUCT_ID_PRO?.trim()
        : env.CREEM_PRODUCT_ID_PRO?.trim();

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
      amountUsd: meta.monthlyUsd,
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

  const event = JSON.parse(rawBody) as { eventType?: string; id?: string };
  console.info(
    `[webhook/creem] verified event=${event.eventType || "unknown"} id=${event.id || "n/a"}`
  );
  return jsonResponse({
    received: true,
    provider: "creem",
    eventType: event.eventType || "unknown",
  });
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
      metadata?: { plan?: string };
    };
    const verified = data.status === "completed";
    return jsonResponse({
      verified,
      status: data.status || "unknown",
      checkoutId: data.id,
      plan: data.metadata?.plan || "pro",
    });
  } catch {
    return jsonResponse({ verified: false, error: "Verification failed" }, 500);
  }
}

async function handleExtract(request: Request, env: Env): Promise<Response> {
  const startTime = Date.now();
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

    const rawText = (body.rawText || "").trim();
    const pageImages = Array.isArray(body.pageImages)
      ? body.pageImages
          .filter((img) => typeof img === "string" && img.startsWith("data:image/"))
          .slice(0, 4)
      : [];
    const fileName = (body.fileName || "statement.pdf").trim();
    if ((!rawText || rawText.length < 10) && pageImages.length === 0) {
      return jsonResponse(
        { error: "Document text is empty and no scanned page images were provided." },
        400
      );
    }

    const effectiveKey =
      (body.aiConfig?.provider === "openai_compatible"
        ? body.aiConfig.apiKey?.trim()
        : "") ||
      env.AI_API_KEY?.trim() ||
      "";
    const effectiveBaseUrl = (
      (body.aiConfig?.provider === "openai_compatible"
        ? body.aiConfig.baseUrl?.trim()
        : "") ||
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
      return jsonResponse(
        { error: "Cloud AI Engine is not configured on this worker." },
        503
      );
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
      return jsonResponse(
        { error: `AI provider returned HTTP ${llmRes.status}` },
        502
      );
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
    const discrepancyCents = calculatedClosingCents - closingCents;

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
        calculatedClosingBalance: calculatedClosingCents / 100,
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI extraction error";
    return jsonResponse({ error: msg }, 500);
  }
}

async function handleEvent(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      event?: string;
      meta?: Record<string, string | number | boolean>;
    };
    const eventName = String(body.event || "unknown").slice(0, 48);
    const country = request.headers.get("cf-ipcountry") || "XX";
    // 仅记录匿名漏斗事件与国家码，绝不记录 IP、邮箱或任何财务文件内容
    console.log(
      JSON.stringify({
        tag: "funnel",
        event: eventName,
        country,
        meta: body.meta || {},
        ts: new Date().toISOString(),
      })
    );
    return jsonResponse({ ok: true });
  } catch {
    return jsonResponse({ ok: false }, 400);
  }
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/event" && request.method === "POST") {
      return handleEvent(request);
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

    return env.ASSETS.fetch(request);
  },
};

export default worker;
