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
 * 海外 SaaS 收款结账接口：优先调用已配置的 Lemon Squeezy (MoR) 或 Stripe Checkout；
 * 若尚未填入商户密钥，自动返回本地沙盒结账会话，方便测试完整付费解锁闭环。
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      plan?: string;
      email?: string;
      gateway?: "lemonsqueezy" | "stripe";
    };

    const plan: CheckoutPlan = body.plan === "business" ? "business" : "pro";
    const customerEmail = body.email?.trim() || "";
    const meta = PLAN_METADATA[plan];
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // 1. Lemon Squeezy (推荐个人出海免海外公司 MoR 方案)
    const lsApiKey = process.env.LEMONSQUEEZY_API_KEY?.trim();
    const lsStoreId = process.env.LEMONSQUEEZY_STORE_ID?.trim();
    const lsVariantId =
      plan === "business"
        ? process.env.LEMONSQUEEZY_VARIANT_BUSINESS?.trim()
        : process.env.LEMONSQUEEZY_VARIANT_PRO?.trim();

    if (lsApiKey && lsStoreId && lsVariantId && body.gateway !== "stripe") {
      const lsRes = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
        method: "POST",
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${lsApiKey}`,
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              checkout_data: customerEmail ? { email: customerEmail } : {},
              product_options: {
                redirect_url: `${origin}/?checkout=success&plan=${plan}`,
              },
            },
            relationships: {
              store: { data: { type: "stores", id: lsStoreId } },
              variant: { data: { type: "variants", id: lsVariantId } },
            },
          },
        }),
      });

      if (lsRes.ok) {
        const lsData = (await lsRes.json()) as {
          data?: { attributes?: { url?: string } };
        };
        const checkoutUrl = lsData.data?.attributes?.url;
        if (checkoutUrl) {
          return NextResponse.json({
            mode: "live_redirect",
            gateway: "Lemon Squeezy",
            checkoutUrl,
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
      gateway: body.gateway === "stripe" ? "Stripe Sandbox" : "Lemon Squeezy MoR Sandbox",
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
