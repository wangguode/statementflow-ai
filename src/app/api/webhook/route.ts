import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * 接收 Lemon Squeezy 或 Stripe 的订阅激活 Webhook，使用常量时间比对签名防止伪造回调
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const lsSignature = req.headers.get("x-signature") || "";
  const lsSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim() || "";

  if (lsSignature && lsSecret) {
    const hmac = crypto
      .createHmac("sha256", lsSecret)
      .update(rawBody)
      .digest("hex");

    const sigBuf = Buffer.from(lsSignature, "utf8");
    const hmacBuf = Buffer.from(hmac, "utf8");

    if (
      sigBuf.length !== hmacBuf.length ||
      !crypto.timingSafeEqual(sigBuf, hmacBuf)
    ) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as {
      meta?: { event_name?: string };
      data?: { id?: string };
    };

    console.info(
      `[webhook/lemonsqueezy] verified event=${event.meta?.event_name || "unknown"} id=${event.data?.id || "n/a"}`
    );

    return NextResponse.json({ received: true, provider: "lemonsqueezy" });
  }

  return NextResponse.json(
    { error: "Webhook secret or signature header not configured." },
    { status: 400 }
  );
}
