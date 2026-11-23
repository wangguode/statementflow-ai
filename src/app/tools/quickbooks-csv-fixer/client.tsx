"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  fixBankCsv,
  SAMPLE_MESSY_BANK_CSV,
  type DateOutputFormat,
  type FixerOptions,
  type TargetSoftware,
} from "@/lib/csv-fixer";

export default function CsvFixerClient() {
  const [rawCsv, setRawCsv] = useState<string>(SAMPLE_MESSY_BANK_CSV);
  const [fileName, setFileName] = useState<string>("sample-messy-bank-export.csv");
  const [target, setTarget] = useState<TargetSoftware>("quickbooks_3col");
  const [dateFormat, setDateFormat] = useState<DateOutputFormat>("MM/DD/YYYY");
  const [sourceDateOrder, setSourceDateOrder] = useState<"auto" | "MDY" | "DMY">("auto");
  const [invertSigns, setInvertSigns] = useState<boolean>(false);
  const [stripSpecialChars, setStripSpecialChars] = useState<boolean>(true);
  const [dropZeroRows, setDropZeroRows] = useState<boolean>(true);
  const [deduplicateRows, setDeduplicateRows] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const options: FixerOptions = useMemo(
    () => ({
      target,
      dateFormat,
      sourceDateOrder,
      invertSigns,
      stripSpecialChars,
      dropZeroRows,
      deduplicateRows,
    }),
    [target, dateFormat, sourceDateOrder, invertSigns, stripSpecialChars, dropZeroRows, deduplicateRows]
  );

  const result = useMemo(() => fixBankCsv(rawCsv, options), [rawCsv, options]);

  const loadCsvFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setRawCsv(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadCsvFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadCsvFile(file);
  };

  const handleDownload = () => {
    const blob = new Blob([result.outputCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = fileName.replace(/\.[^.]+$/, "");
    const suffix = target === "quickbooks_3col" ? "quickbooks-clean" : "xero-clean";
    a.href = url;
    a.download = `${base}-${suffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.outputCsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleTargetSwitch = (nextTarget: TargetSoftware) => {
    setTarget(nextTarget);
    setDateFormat(nextTarget === "quickbooks_3col" ? "MM/DD/YYYY" : "DD/MM/YYYY");
  };

  const { diagnostics, rows } = result;

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#161615] font-sans">
      {/* 顶部极简导航 */}
      <header className="border-b border-[#e2ded5] bg-[#f7f5f0]/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="font-semibold tracking-tight text-base flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#14532d]" />
            <span>StatementFlow</span>
            <span className="text-xs font-mono text-[#6b6860] hidden sm:inline">/ Free Tools</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs sm:text-sm">
            <Link
              href="/tools/ofx-qbo-to-csv"
              className="text-[#525049] hover:text-[#161615] underline-offset-4 hover:underline"
            >
              OFX / QBO to CSV
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full bg-[#161615] text-white font-medium hover:bg-[#2c2b28] transition"
            >
              PDF to Excel ($9 Pro)
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Hero */}
        <section className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6efe9] text-[#14532d] text-xs font-mono font-medium">
            <span>100% Browser-Local · Zero Server Upload · Unlimited Free</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight leading-tight">
            QuickBooks &amp; Xero CSV Import Fixer
          </h1>
          <p className="text-base sm:text-lg text-[#525049] leading-relaxed">
            Instantly repair broken bank CSV exports before uploading to QuickBooks Online or Xero.
            Auto-fixes invalid dates, merges split Debit/Credit columns, strips currency symbols &amp;
            brackets, flattens multiline descriptions, and inverts credit card signs — completely
            offline in your browser.
          </p>
        </section>

        {/* 主工作区 */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧：上传与参数配置 */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-[#dedad0] bg-white p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#525049]">
                  1. Upload or Paste Messy CSV
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setRawCsv(SAMPLE_MESSY_BANK_CSV);
                    setFileName("sample-messy-bank-export.csv");
                  }}
                  className="text-xs font-mono text-[#14532d] hover:underline cursor-pointer"
                >
                  Load 5-Error Sample
                </button>
              </div>

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                  isDragging
                    ? "border-[#14532d] bg-[#e6efe9]"
                    : "border-[#d6d1c6] hover:border-[#14532d] bg-[#faf9f6]"
                }`}
              >
                <input
                  type="file"
                  accept=".csv,.txt,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="text-sm font-medium text-[#161615]">
                  Drag &amp; drop a bank CSV here, or click to browse
                </div>
                <div className="text-xs text-[#6b6860] mt-1 font-mono truncate">
                  Active: {fileName}
                </div>
              </label>

              <textarea
                value={rawCsv}
                onChange={(e) => setRawCsv(e.target.value)}
                rows={7}
                aria-label="Raw CSV input"
                placeholder="Paste raw bank CSV here..."
                className="w-full rounded-xl border border-[#dedad0] bg-[#faf9f6] p-3 text-xs font-mono text-[#161615] focus:outline-none focus:border-[#14532d]"
              />
            </div>

            <div className="rounded-2xl border border-[#dedad0] bg-white p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#525049]">
                2. Target Format &amp; Repair Rules
              </h2>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTargetSwitch("quickbooks_3col")}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition cursor-pointer ${
                    target === "quickbooks_3col"
                      ? "bg-[#14532d] text-white border-[#14532d]"
                      : "bg-[#faf9f6] text-[#161615] border-[#dedad0] hover:border-[#14532d]"
                  }`}
                >
                  <div className="font-semibold">QuickBooks Online</div>
                  <div className="opacity-80 font-mono text-[11px]">3-Col: Date, Desc, Amt</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleTargetSwitch("xero_5col")}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition cursor-pointer ${
                    target === "xero_5col"
                      ? "bg-[#14532d] text-white border-[#14532d]"
                      : "bg-[#faf9f6] text-[#161615] border-[#dedad0] hover:border-[#14532d]"
                  }`}
                >
                  <div className="font-semibold">Xero Bank Feed</div>
                  <div className="opacity-80 font-mono text-[11px]">5-Col: *Date, *Amt, Payee</div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="text-[#525049] font-medium block">Output Date Format</span>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value as DateOutputFormat)}
                    className="w-full rounded-lg border border-[#dedad0] bg-[#faf9f6] px-2.5 py-2 font-mono"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US QBO)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (UK/AU Xero)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-[#525049] font-medium block">Source Date Order</span>
                  <select
                    value={sourceDateOrder}
                    onChange={(e) =>
                      setSourceDateOrder(e.target.value as "auto" | "MDY" | "DMY")
                    }
                    className="w-full rounded-lg border border-[#dedad0] bg-[#faf9f6] px-2.5 py-2 font-mono"
                  >
                    <option value="auto">Auto-Detect</option>
                    <option value="MDY">US (MM/DD)</option>
                    <option value="DMY">UK / AU / EU (DD/MM)</option>
                  </select>
                </label>
              </div>

              <div className="space-y-2.5 pt-1 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invertSigns}
                    onChange={(e) => setInvertSigns(e.target.checked)}
                    className="accent-[#14532d]"
                  />
                  <span>Invert +/- signs (for Credit Card CSVs where charges are positive)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stripSpecialChars}
                    onChange={(e) => setStripSpecialChars(e.target.checked)}
                    className="accent-[#14532d]"
                  />
                  <span>Strip QuickBooks-rejected symbols (#, *, ^, |, ~)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dropZeroRows}
                    onChange={(e) => setDropZeroRows(e.target.checked)}
                    className="accent-[#14532d]"
                  />
                  <span>Drop $0.00 / summary footer rows automatically</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deduplicateRows}
                    onChange={(e) => setDeduplicateRows(e.target.checked)}
                    className="accent-[#14532d]"
                  />
                  <span>Remove exact duplicate transactions (prevents double-entry imports)</span>
                </label>
              </div>
            </div>
          </div>

          {/* 右侧：自动诊断报告与清洁预览 */}
          <div className="lg:col-span-7 space-y-5">
            {/* 诊断指标卡片 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-[#dedad0] bg-white p-3.5">
                <div className="text-[11px] font-mono uppercase text-[#6b6860]">Clean Rows</div>
                <div className="text-2xl font-semibold mt-1">{diagnostics.cleanRowCount}</div>
              </div>
              <div className="rounded-xl border border-[#dedad0] bg-white p-3.5">
                <div className="text-[11px] font-mono uppercase text-[#6b6860]">Dates Fixed</div>
                <div className="text-2xl font-semibold text-[#14532d] mt-1">
                  {diagnostics.fixedCounts.datesNormalized}
                </div>
              </div>
              <div className="rounded-xl border border-[#dedad0] bg-white p-3.5">
                <div className="text-[11px] font-mono uppercase text-[#6b6860]">Cols Merged</div>
                <div className="text-2xl font-semibold text-[#14532d] mt-1">
                  {diagnostics.fixedCounts.splitColumnsMerged}
                </div>
              </div>
              <div className="rounded-xl border border-[#dedad0] bg-white p-3.5">
                <div className="text-[11px] font-mono uppercase text-[#6b6860]">Net Flow</div>
                <div className="text-xl font-semibold font-mono mt-1">
                  {diagnostics.netFlow >= 0 ? "+" : ""}
                  {diagnostics.netFlow.toFixed(2)}
                </div>
              </div>
            </div>

            {/* 修复明细摘要条 */}
            <div className="rounded-2xl border border-[#dedad0] bg-white p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-mono text-[#525049]">
                  Delimiter: <b>{diagnostics.delimiter}</b> · Skipped top banner rows:{" "}
                  <b>{diagnostics.skippedHeaderRows}</b> · Multiline cleaned:{" "}
                  <b>{diagnostics.fixedCounts.multilineSanitized}</b> · Currency/brackets fixed:{" "}
                  <b>{diagnostics.fixedCounts.currencyOrParensCleaned}</b> · Duplicates removed:{" "}
                  <b>{diagnostics.fixedCounts.duplicatesRemoved}</b>
                </div>
              </div>
              {diagnostics.warnings.length > 0 && (
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {diagnostics.warnings.join(" ")}
                </div>
              )}
            </div>

            {/* 导出动作条 + 预览表格 */}
            <div className="rounded-2xl border border-[#dedad0] bg-white overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 border-b border-[#ece8df] flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold">
                  Cleaned Preview ({rows.length} transactions)
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
                    disabled={rows.length === 0}
                    className="px-4 py-1.5 rounded-lg bg-[#14532d] text-white text-xs font-semibold hover:bg-[#114224] disabled:opacity-50 cursor-pointer"
                  >
                    Download Clean CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[420px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf9f6] border-b border-[#ece8df] font-mono text-[#525049] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                      <th className="py-2.5 px-4">Auto-Repairs Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ede6]">
                    {rows.slice(0, 100).map((r, idx) => (
                      <tr key={idx} className="hover:bg-[#faf9f6]">
                        <td className="py-2.5 px-4 font-mono whitespace-nowrap">{r.date}</td>
                        <td className="py-2.5 px-4 max-w-[240px] truncate" title={r.description}>
                          {r.description}
                        </td>
                        <td
                          className={`py-2.5 px-4 font-mono text-right whitespace-nowrap font-medium ${
                            r.amount >= 0 ? "text-[#14532d]" : "text-[#991b1b]"
                          }`}
                        >
                          {r.amount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-[11px] text-[#6b6860]">
                          {r.issues.length > 0 ? r.issues.join(" · ") : "Valid"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 自然转化 CTA：只有 PDF 扫描件？ */}
            <div className="rounded-2xl border border-[#14532d]/25 bg-[#eef5f0] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-[#14532d]">
                  Bank only gave you a PDF or scanned statement (past the 90-day CSV limit)?
                </div>
                <p className="text-xs text-[#3b4a40]">
                  Convert multi-page bank PDFs &amp; scanned statements directly into $0.00-reconciled
                  QuickBooks &amp; Xero CSVs with StatementFlow AI — $9 one-time lifetime unlock.
                </p>
              </div>
              <Link
                href="/"
                className="shrink-0 px-4 py-2 rounded-full bg-[#14532d] text-white text-xs font-semibold hover:bg-[#114224] transition"
              >
                Convert PDF Statements →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
