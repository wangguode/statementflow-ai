import { NextRequest, NextResponse } from "next/server";

type CheckoutPlan = "pro" | "business";

const PLAN_METADATA: Record<
  CheckoutPlan,
  { name: string; monthlyUsd: number; description: string }
> = {
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
};

/**
 * 海外 SaaS 收款结账接口：优先调用已配置的 Creem.io (MoR) 或 Stripe Checkout；
 * 若尚未填入商户密钥，自动返回本地沙盒结账会话，方便测试完整付费解锁闭环。
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      plan?: string;
      email?: string;
      gateway?: "creem" | "stripe";
    };

    const plan: CheckoutPlan = body.plan === "business" ? "business" : "pro";
    const customerEmail = body.email?.trim() || "";
    const meta = PLAN_METADATA[plan];
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // 1. Creem.io (推荐个人出海免海外公司 MoR 方案，直接支持国内支付宝/银行卡结算)
    const creemApiKey = process.env.CREEM_API_KEY?.trim();
    const creemProductId =
      plan === "business"
        ? process.env.CREEM_PRODUCT_ID_BUSINESS?.trim() ||
          process.env.CREEM_PRODUCT_ID_PRO?.trim()
        : process.env.CREEM_PRODUCT_ID_PRO?.trim();

    if (creemApiKey && creemProductId && body.gateway !== "stripe") {
      const creemPayload: Record<string, unknown> = {
        product_id: creemProductId,
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
        const creemData = (await creemRes.json()) as { checkout_url?: string };
        if (creemData.checkout_url) {
          return NextResponse.json({
            mode: "live_redirect",
            gateway: "Creem.io",
            checkoutUrl: creemData.checkout_url,
          });
        }
      }
    }

    // 2. Stripe Checkout (适合拥有美国 LLC / 香港公司账户)
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
    const stripePriceId =
      plan === "business"
        ? process.env.STRIPE_PRICE_BUSINESS?.trim()
        : process.env.STRIPE_PRICE_PRO?.trim();

    if (stripeKey && stripePriceId) {
      const params = new URLSearchParams({
        mode: "subscription",
        success_url: `${origin}/?checkout=success&plan=${plan}`,
        cancel_url: `${origin}/?checkout=cancelled`,
        "line_items[0][price]": stripePriceId,
        "line_items[0][quantity]": "1",
      });
      if (customerEmail) {
        params.set("customer_email", customerEmail);
      }

      const stripeRes = await fetch(
        "https://api.stripe.com/v1/checkout/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      if (stripeRes.ok) {
        const session = (await stripeRes.json()) as { url?: string };
        if (session.url) {
          return NextResponse.json({
            mode: "live_redirect",
            gateway: "Stripe",
            checkoutUrl: session.url,
          });
        }
      }
    }

    // 3. 本地沙盒模式（未配置真实收款 Key 时可直接走通订阅升级体验）
    return NextResponse.json({
      mode: "sandbox",
      gateway: body.gateway === "stripe" ? "Stripe Sandbox" : "Creem.io MoR Sandbox",
      plan,
      planName: meta.name,
      amountUsd: meta.monthlyUsd,
      description: meta.description,
      sessionId: `sbx_${plan}_${Date.now()}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to initialize checkout session." },
      { status: 500 }
    );
  }
}
