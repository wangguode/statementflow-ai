"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  exportOfxToCsv,
  parseOfxContent,
  SAMPLE_QBO_FILE,
} from "@/lib/ofx-parser";
import { trackSfEvent } from "@/lib/telemetry";

export default function OfxConverterClient() {
  const router = useRouter();
  const [rawText, setRawText] = useState<string>(SAMPLE_QBO_FILE);
  const [fileName, setFileName] = useState<string>("sample-chase-webconnect.qbo");
  const [exportMode, setExportMode] = useState<"quickbooks" | "xero" | "standard">("quickbooks");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [upgradeNotice, setUpgradeNotice] = useState<string>("");
  const [openingCheckout, setOpeningCheckout] = useState<boolean>(false);
  const [isProUnlocked, setIsProUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = JSON.parse(window.localStorage.getItem("statementflow_billing_v1") || "{}");
      return saved?.plan === "pro" || saved?.plan === "business";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    trackSfEvent("page_view", {
      surface: "tool_ofx_qbo",
      ref: (document.referrer || "direct").slice(0, 80),
    });
    try {
      const tok = new URLSearchParams(window.location.search).get("restore_token")?.trim();
      if (tok) {
        fetch("/api/license/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tok }),
        })
          .then((r) => r.json())
          .then((d: { ok?: boolean; restored?: boolean; plan?: string; email?: string; restoreToken?: string }) => {
            if (d?.ok && d?.restored) {
              window.localStorage.setItem(
                "statementflow_billing_v1",
                JSON.stringify({ plan: d.plan || "pro", customerEmail: d.email || "", restoreToken: d.restoreToken || tok, creditsUsed: 0 })
              );
              setIsProUnlocked(true);
              window.history.replaceState({}, "", window.location.pathname);
            }
          })
          .catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  const parsed = useMemo(() => parseOfxContent(rawText), [rawText]);
  const isOverFreeCap = !isProUnlocked && rawText !== SAMPLE_QBO_FILE && parsed.transactions.length > 20;
  const csvOutput = useMemo(
    () => exportOfxToCsv(parsed, exportMode, isOverFreeCap ? 20 : undefined),
    [parsed, exportMode, isOverFreeCap]
  );

  const handleQuickProUpgrade = async () => {
    trackSfEvent("checkout_direct_click", { plan: "pro", source: "tool_ofx_qbo" });
    setOpeningCheckout(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro", gateway: "creem" }),
      });
      const data = (await res.json()) as { checkoutUrl?: string };
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
    } catch {
      // fallback to pricing
    } finally {
      setOpeningCheckout(false);
    }
    router.push("/#pricing");
  };

  const loadOfxFile = (file: File) => {
    trackSfEvent("upload_files", { surface: "tool_ofx_qbo" });
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setRawText(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadOfxFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadOfxFile(file);
  };

  const handleDownload = () => {
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = fileName.replace(/\.[^.]+$/, "");
    a.href = url;
    a.download = isOverFreeCap
      ? `${base}-${exportMode}-20row-preview.csv`
      : `${base}-${exportMode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (isOverFreeCap) {
      setUpgradeNotice(
        `Exported 20-row verified preview (${parsed.transactions.length} total rows parsed above). Unlock unlimited OFX/CSV & PDF exports forever for $29 once.`
      );
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(csvOutput);
    setCopied(true);
    if (isOverFreeCap) {
      setUpgradeNotice(
        `Copied 20-row verified preview (${parsed.transactions.length} total rows parsed). Unlock full unlimited export for $29 once.`
      );
    }
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#161615] font-sans">
      <header className="border-b border-[#e2ded5] bg-[#f7f5f0]/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="font-semibold tracking-tight text-base flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#14532d]" />
            <span>StatementFlow</span>
            <span className="text-xs font-mono text-[#6b6860] hidden sm:inline">/ Free Tools</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs sm:text-sm">
            <Link
              href="/tools/quickbooks-csv-fixer"
              className="text-[#525049] hover:text-[#161615] underline-offset-4 hover:underline"
            >
              QuickBooks CSV Fixer
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full bg-[#161615] text-white font-medium hover:bg-[#2c2b28] transition"
            >
              PDF to Excel ($29 Pro)
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        <section className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6efe9] text-[#14532d] text-xs font-mono font-medium">
            <span>100% Browser-Local · Supports OFX 1.x SGML &amp; OFX 2.x XML · Zero Upload</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight leading-tight">
            Free OFX / QFX / QBO to CSV Converter
          </h1>
          <p className="text-base sm:text-lg text-[#525049] leading-relaxed">
            Turn bank Web Connect files (<code>.qbo</code>, <code>.qfx</code>, <code>.ofx</code>)
            into clean QuickBooks 3-column CSV, Xero 5-column CSV, or full Excel-ready spreadsheets
            in one click. Ideal when QuickBooks throws Error -16802 or you need to inspect transactions
            before importing.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-[#dedad0] bg-white p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#525049]">
                  1. Drop .OFX / .QFX / .QBO File
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setRawText(SAMPLE_QBO_FILE);
                    setFileName("sample-chase-webconnect.qbo");
                  }}
                  className="text-xs font-mono text-[#14532d] hover:underline cursor-pointer"
                >
                  Load Sample .QBO
                </button>
              </div>

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`block border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                  isDragging
                    ? "border-[#14532d] bg-[#e6efe9]"
                    : "border-[#d6d1c6] hover:border-[#14532d] bg-[#faf9f6]"
                }`}
              >
                <input
                  type="file"
                  accept=".ofx,.qfx,.qbo,.xml,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="text-sm font-medium text-[#161615]">
                  Drag &amp; drop .OFX, .QFX, or .QBO here, or click to browse
                </div>
                <div className="text-xs text-[#6b6860] mt-1 font-mono truncate">
                  Active: {fileName}
                </div>
              </label>

              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#525049]">
                  2. Export Target Format
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "quickbooks", label: "QuickBooks", sub: "3-Col CSV" },
                      { id: "xero", label: "Xero", sub: "5-Col CSV" },
                      { id: "standard", label: "Full Excel", sub: "7-Col CSV" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setExportMode(opt.id)}
                      className={`px-2.5 py-2 rounded-xl text-xs border text-center transition cursor-pointer ${
                        exportMode === opt.id
                          ? "bg-[#14532d] text-white border-[#14532d]"
                          : "bg-[#faf9f6] text-[#161615] border-[#dedad0] hover:border-[#14532d]"
                      }`}
                    >
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-[10px] opacity-80 font-mono">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-[#faf9f6] border border-[#ece8df] p-3.5 text-xs font-mono space-y-1 text-[#525049]">
                <div>Format: <b className="text-[#161615]">{parsed.format}</b></div>
                <div>Currency: <b className="text-[#161615]">{parsed.currency}</b> · Type: <b className="text-[#161615]">{parsed.accountType}</b></div>
                <div>Account: <b className="text-[#161615]">{parsed.accountIdMasked}</b> · Bank ID: <b className="text-[#161615]">{parsed.bankId}</b></div>
                {parsed.ledgerBalance !== null && (
                  <div>
                    Ledger Balance: <b className="text-[#14532d]">{parsed.currency} {parsed.ledgerBalance.toFixed(2)}</b>
                    {parsed.balanceDate ? ` (as of ${parsed.balanceDate})` : ""}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#dedad0] bg-white p-3.5">
                <div className="text-[11px] font-mono uppercase text-[#6b6860]">Transactions</div>
                <div className="text-2xl font-semibold mt-1">{parsed.transactions.length}</div>
              </div>
              <div className="rounded-xl border border-[#dedad0] bg-white p-3.5">
                <div className="text-[11px] font-mono uppercase text-[#6b6860]">Total Credits</div>
                <div className="text-xl font-semibold font-mono text-[#14532d] mt-1">
                  +{parsed.totalCredits.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl border border-[#dedad0] bg-white p-3.5">
                <div className="text-[11px] font-mono uppercase text-[#6b6860]">Total Debits</div>
                <div className="text-xl font-semibold font-mono text-[#991b1b] mt-1">
                  -{parsed.totalDebits.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#dedad0] bg-white overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 border-b border-[#ece8df] flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold">
                  Parsed Transactions ({parsed.transactions.length})
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-1.5 rounded-lg border border-[#d6d1c6] text-xs font-medium hover:bg-[#f7f5f0] cursor-pointer"
                  >
                    {copied ? "Copied CSV!" : "Copy CSV"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={parsed.transactions.length === 0}
                    className="px-4 py-1.5 rounded-lg bg-[#14532d] text-white text-xs font-semibold hover:bg-[#114224] disabled:opacity-50 cursor-pointer"
                  >
                    {isOverFreeCap ? "Download 20-Row Preview CSV" : "Download CSV"}
                  </button>
                </div>
              </div>
              {(isOverFreeCap || upgradeNotice) && (
                <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950">
                  <span>
                    {upgradeNotice ||
                      `Free mode exports up to 20 rows (${parsed.transactions.length} rows parsed below). Unlock unlimited OFX, CSV & PDF exports forever for $29 once.`}
                  </span>
                  <button
                    type="button"
                    disabled={openingCheckout}
                    onClick={() => void handleQuickProUpgrade()}
                    className="px-3 py-1.5 rounded-lg bg-[#14532d] text-white font-semibold hover:bg-[#114224] cursor-pointer shrink-0"
                  >
                    {openingCheckout ? "Opening..." : "Unlock Unlimited · $29 →"}
                  </button>
                </div>
              )}

              <div className="overflow-x-auto max-h-[420px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf9f6] border-b border-[#ece8df] font-mono text-[#525049] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Payee</th>
                      <th className="py-2.5 px-4">Memo</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ede6]">
                    {parsed.transactions.slice(0, 100).map((t, idx) => (
                      <tr key={idx} className="hover:bg-[#faf9f6]">
                        <td className="py-2.5 px-4 font-mono whitespace-nowrap">{t.dateIso}</td>
                        <td className="py-2.5 px-4 font-medium">{t.name}</td>
                        <td className="py-2.5 px-4 text-[#6b6860] max-w-[200px] truncate" title={t.memo}>
                          {t.memo || "—"}
                        </td>
                        <td
                          className={`py-2.5 px-4 font-mono text-right whitespace-nowrap font-medium ${
                            t.amount >= 0 ? "text-[#14532d]" : "text-[#991b1b]"
                          }`}
                        >
                          {t.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-[#14532d]/25 bg-[#eef5f0] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-[#14532d]">
                  Need to convert historical PDF or scanned bank statements too?
                </div>
                <p className="text-xs text-[#3b4a40]">
                  StatementFlow AI extracts multi-page PDFs locally with Vision OCR &amp; $0.00
                  running-balance verification — $29 one-time lifetime unlock.
                </p>
              </div>
              <Link
                href="/"
                className="shrink-0 px-4 py-2 rounded-full bg-[#14532d] text-white text-xs font-semibold hover:bg-[#114224] transition"
              >
                Try PDF Extractor →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
