import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * 接收 Creem.io 或 Stripe 的订阅激活 Webhook，使用常量时间比对签名防止伪造回调
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const creemSignature = req.headers.get("creem-signature") || "";
  const creemSecret = process.env.CREEM_WEBHOOK_SECRET?.trim() || "";

  if (creemSignature && creemSecret) {
    const hmac = crypto
      .createHmac("sha256", creemSecret)
      .update(rawBody)
      .digest("hex");

    const sigBuf = Buffer.from(creemSignature.toLowerCase(), "utf8");
    const hmacBuf = Buffer.from(hmac.toLowerCase(), "utf8");

    if (
      sigBuf.length !== hmacBuf.length ||
      !crypto.timingSafeEqual(sigBuf, hmacBuf)
    ) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as {
      eventType?: string;
      id?: string;
    };

    console.info(
      `[webhook/creem] verified event=${event.eventType || "unknown"} id=${event.id || "n/a"}`
    );

    return NextResponse.json({
      received: true,
      provider: "creem",
      eventType: event.eventType || "unknown",
    });
  }

  return NextResponse.json(
    { error: "Webhook secret or signature header not configured." },
    { status: 400 }
  );
}
