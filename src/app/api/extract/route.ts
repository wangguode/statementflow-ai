import { NextRequest, NextResponse } from "next/server";
import { extractWithAISafety } from "@/lib/ai-extractor";
import { extractReadableTextFromBuffer } from "@/lib/heuristic-parser";
import { findSampleById } from "@/lib/samples";
import type { ExtractionResult } from "@/types/statement";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB 边界限制
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 30;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_MAX_REQUESTS) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many extraction requests. Please wait a moment and retry." },
      { status: 429 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    let sampleId = "";
    let rawText = "";
    let fileName = "statement.pdf";
    let providerMode: "demo" | "openai_compatible" = "demo";
    let apiKey = "";
    let baseUrl = "";
    let model = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const uploaded = formData.get("file");
      providerMode =
        formData.get("provider") === "openai_compatible"
          ? "openai_compatible"
          : "demo";
      apiKey = String(formData.get("apiKey") || "");
      baseUrl = String(formData.get("baseUrl") || "");
      model = String(formData.get("model") || "");

      if (!(uploaded instanceof File)) {
        return NextResponse.json(
          { error: "Please select a valid PDF, CSV, or TXT statement file." },
          { status: 400 }
        );
      }

      if (uploaded.size === 0 || uploaded.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: "File size must be between 1 byte and 5 MB." },
          { status: 400 }
        );
      }

      fileName = uploaded.name || "uploaded_statement.pdf";
      const arrayBuf = await uploaded.arrayBuffer();
      rawText = extractReadableTextFromBuffer(Buffer.from(arrayBuf), fileName);
    } else {
      const body = (await req.json()) as {
        sampleId?: string;
        rawText?: string;
        fileName?: string;
        pdfBase64?: string;
        aiConfig?: {
          provider?: "demo" | "openai_compatible";
          apiKey?: string;
          baseUrl?: string;
          model?: string;
        };
      };

      sampleId = body.sampleId?.trim() || "";
      rawText = body.rawText?.trim() || "";
      fileName = body.fileName?.trim() || "statement.txt";
      if (body.pdfBase64) {
        const buf = Buffer.from(body.pdfBase64, "base64");
        if (buf.byteLength > MAX_FILE_BYTES) {
          return NextResponse.json(
            { error: "File size must be under 5 MB." },
            { status: 400 }
          );
        }
        rawText = extractReadableTextFromBuffer(buf, fileName);
      }
      providerMode = body.aiConfig?.provider || "demo";
      apiKey = body.aiConfig?.apiKey || "";
      baseUrl = body.aiConfig?.baseUrl || "";
      model = body.aiConfig?.model || "";
    }

    const hasConfiguredKey = Boolean(
      (providerMode === "openai_compatible" && apiKey.trim()) ||
        process.env.AI_API_KEY?.trim() ||
        process.env.OPENAI_API_KEY?.trim()
    );

    // 场景 1：点击内置真实场景样本且处于免 Key 演示模式 -> 零延迟返回高保真验证数据
    if (sampleId) {
      const preset = findSampleById(sampleId);
      if (!preset) {
        return NextResponse.json(
          { error: `Unknown sample preset '${sampleId}'.` },
          { status: 404 }
        );
      }

      if (!hasConfiguredKey || providerMode === "demo") {
        const result: ExtractionResult = {
          ...preset.result,
          meta: {
            modeUsed: "demo_sample",
            providerName: "StatementFlow Demo Engine",
            modelName: "preset-verified-v1 (Keyless Mode)",
            latencyMs: 145,
            warnings: [],
          },
        };
        return NextResponse.json({
          result,
          rawPreviewText: preset.rawPreviewText,
        });
      }

      // 如果用户填入了真实 API Key 并开启了 Live AI 模式，将样本原始账单文本发给真实大模型解析！
      const liveResult = await extractWithAISafety(
        preset.rawPreviewText,
        preset.fileName,
        { apiKey, baseUrl, model }
      );
      return NextResponse.json({
        result: liveResult,
        rawPreviewText: preset.rawPreviewText,
      });
    }

    // 场景 2：用户自定义粘贴账单文本或上传本地 PDF/CSV/TXT 文件
    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "Document content cannot be empty." },
        { status: 400 }
      );
    }

    const extracted = await extractWithAISafety(rawText, fileName, {
      apiKey: providerMode === "openai_compatible" ? apiKey : "",
      baseUrl,
      model,
    });

    return NextResponse.json({
      result: extracted,
      rawPreviewText: rawText.slice(0, 4000),
    });
  } catch (err) {
    console.error("[api/extract] Unexpected route failure");
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? "Failed to process statement request."
            : "Internal processing error.",
      },
      { status: 500 }
    );
  }
}
