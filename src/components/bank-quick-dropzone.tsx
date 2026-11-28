"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Upload } from "lucide-react";
import { trackSfEvent } from "@/lib/telemetry";

interface Props {
  bankSlug: string;
  institutionName: string;
  targetFormat: string;
}

/**
 * 105 个银行 pSEO 落地页首屏内嵌直传组件：
 * 消除“必须再跳一次首页才能传 PDF”的二次流失，直接在子页完成本地解析并带数据直达 #workbench
 */
export function BankQuickDropzone({ bankSlug, institutionName, targetFormat }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    trackSfEvent("page_view", {
      bank: bankSlug,
      surface: "pseo_bank",
      ref: (document.referrer || "direct").slice(0, 80),
    });
  }, [bankSlug]);

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;
    trackSfEvent("bank_dropzone_upload", {
      bank: bankSlug,
      count: files.length,
    });
    setParsing(true);
    try {
      const extractedParts: Array<{ name: string; text: string }> = [];
      let scannedDetected = false;
      for (const file of files.slice(0, 12)) {
        const lower = file.name.toLowerCase();
        if (lower.endsWith(".pdf")) {
          const bytes = new Uint8Array(await file.arrayBuffer());
          const { extractTextFromPdfBytes } = await import("@/lib/client-pdf");
          const out = await extractTextFromPdfBytes(bytes);
          if (out.text && out.text.trim().length > 0) {
            extractedParts.push({ name: file.name, text: out.text });
          } else {
            scannedDetected = true;
          }
        } else if (/\.(csv|txt|tsv)$/i.test(lower)) {
          const txt = await file.text();
          if (txt.trim().length > 0) extractedParts.push({ name: file.name, text: txt });
        } else if (/\.(png|jpg|jpeg|webp)$/i.test(lower)) {
          scannedDetected = true;
        }
      }
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "sf_pending_upload_v1",
          JSON.stringify({
            fileName: files[0].name,
            text: extractedParts.map((p) => p.text).join("\n\n"),
            batchParts: extractedParts,
            isScanned: scannedDetected && extractedParts.length === 0,
            fileCount: files.length,
          })
        );
      }
      router.push(`/?bank=${encodeURIComponent(bankSlug)}#workbench`);
    } catch {
      router.push(`/?bank=${encodeURIComponent(bankSlug)}#workbench`);
    } finally {
      setParsing(false);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!dragging) setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void handleFiles(Array.from(e.dataTransfer.files || []));
      }}
      className={`rounded-2xl border bg-white/90 p-5 shadow-sm backdrop-blur-md transition-all lg:col-span-4 ${
        dragging ? "border-[#0066cc] ring-2 ring-[#0066cc]" : "border-black/10"
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#494b52]">
        <span className="inline-flex items-center gap-1.5 text-[#111215]">
          <ShieldCheck className="size-4 text-emerald-600" />
          100% Browser-Local
        </span>
        <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 font-mono text-[11px] text-emerald-800">
          $0.00 Math Proof
        </span>
      </div>

      <button
        type="button"
        disabled={parsing}
        onClick={() => inputRef.current?.click()}
        className="mt-3.5 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#0066cc]/35 bg-[#f8f9fc] px-4 py-6 text-center transition-colors hover:border-[#0066cc] hover:bg-white cursor-pointer"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#0066cc]/10 text-[#0066cc]">
          <Upload className="size-5" />
        </span>
        <span className="mt-2.5 text-sm font-semibold text-[#111215]">
          {parsing ? "Parsing locally in browser..." : `Drop ${institutionName} PDF here`}
        </span>
        <span className="mt-1 text-xs text-[#494b52]">
          Instant {targetFormat} preview · Zero cloud upload
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.csv,.txt,.png,.jpg,.jpeg,.webp"
        onChange={(e) => {
          void handleFiles(Array.from(e.target.files || []));
          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
