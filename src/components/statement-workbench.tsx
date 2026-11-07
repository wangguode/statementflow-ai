"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { SAMPLE_PRESETS } from "@/lib/samples";
import { PSEO_BANK_ENTRIES, findPseoBankBySlug } from "@/lib/pseo-banks";
import { computeReconciliation } from "@/lib/schema";
import {
  buildCsvContent,
  buildExcelWorkbookXml,
  triggerBrowserDownload,
} from "@/lib/export-utils";
import { AISettingsModal, CheckoutModal } from "@/components/modals";
import type {
  AIConfigSettings,
  BillingState,
  ExtractionResult,
  PlanTier,
  TransactionCategory,
  TransactionItem,
} from "@/types/statement";

const STORAGE_KEY_AI = "statementflow_ai_config_v1";
const STORAGE_KEY_BILLING = "statementflow_billing_v1";

const DEFAULT_AI_CONFIG: AIConfigSettings = {
  provider: "demo",
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
};

const DEFAULT_BILLING: BillingState = {
  plan: "free",
  creditsUsed: 1,
  creditsLimit: 3,
};

const ALL_CATEGORIES: TransactionCategory[] = [
  "Revenue & Payouts",
  "Cloud & SaaS",
  "Payroll & Contractors",
  "Office & Operations",
  "Marketing & Ads",
  "Travel & Meals",
  "Taxes & Fees",
  "Equipment & Hardware",
  "Transfer",
  "Uncategorized",
];

const PIPELINE_STAGES = [
  {
    stepWord: "First",
    title: "Ingest PDF & Text",
    durationLabel: "180 ms",
    shareClass: "lg:col-span-3",
    bgClass: "bg-[#141413] text-[#f5f5f7]",
    detail:
      "Extracts raw character streams or multi-page binary PDF buffers without storing sensitive banking credentials.",
  },
  {
    stepWord: "Second",
    title: "Schema Extraction",
    durationLabel: "1,120 ms",
    shareClass: "lg:col-span-4",
    bgClass: "bg-[#0066cc] text-white",
    detail:
      "Normalizes dates, merchant descriptors, tax columns, and signed cashflow directions via strict JSON schema validation.",
  },
  {
    stepWord: "Third",
    title: "Balance Equation",
    durationLabel: "40 ms",
    shareClass: "lg:col-span-3",
    bgClass: "bg-[#262624] text-[#f5f5f7]",
    detail:
      "Executes deterministic cent-level arithmetic to verify Opening + Credits - Debits against Closing Balance.",
  },
  {
    stepWord: "Fourth",
    title: "Ledger Export",
    durationLabel: "90 ms",
    shareClass: "lg:col-span-2",
    bgClass: "bg-[#cfcec9] text-[#141413]",
    detail:
      "Generates multi-sheet SpreadsheetML (.xls), UTF-8 BOM CSV, and audit-ready JSON.",
  },
];

const ARCHIVAL_PLATES = [
  {
    src: "/assets/specimen-sheet-of-bank-note-engraving.jpg",
    width: 2848,
    height: 3713,
    alt: "Specimen Sheet of Bank Note Engraving by Asher Brown Durand, circa 1828",
    title: "Bank Note Engraving Specimen, ca. 1828",
    caption:
      "Asher Brown Durand copperplate engraving proof. Before digital schemas, financial authenticity relied on geometric lathe work.",
    spanClass: "lg:col-span-5",
    aspectClass: "aspect-[4/5]",
  },
  {
    src: "/assets/1000-bill-for-the-greenwich-bank-the.jpg",
    width: 2391,
    height: 1053,
    alt: "$1000 Bill for The Greenwich Bank, The City of New York, circa 1828",
    title: "Greenwich Bank $1,000 Draft, New York",
    caption:
      "High-denomination clearing instrument requiring dual-signature ledger verification across Manhattan merchant banks.",
    spanClass: "lg:col-span-7",
    aspectClass: "aspect-[16/9]",
  },
  {
    src: "/assets/first-merchant-s-exchange-new-york-plan.jpg",
    width: 3004,
    height: 3719,
    alt: "First Merchant's Exchange, New York: plan of main floor by Alexander Jackson Davis, 1826",
    title: "First Merchant's Exchange Floor Plan, 1826",
    caption:
      "Alexander Jackson Davis architectural drawing of Wall Street's central settlement rotunda and counting chambers.",
    spanClass: "lg:col-span-6",
    aspectClass: "aspect-[5/4]",
  },
  {
    src: "/assets/new-york-stock-exchange-new-york-new.jpg",
    width: 1920,
    height: 2484,
    alt: "New York Stock Exchange trading floor photographed by Carol M. Highsmith",
    title: "New York Exchange Settlement Floor",
    caption:
      "Modern high-volume clearing floor where manual paper tickets gave way to automated electronic reconciliation.",
    spanClass: "lg:col-span-6",
    aspectClass: "aspect-[5/4]",
  },
];

const FAQ_ITEMS = [
  {
    q: "How does StatementFlow prevent AI arithmetic hallucinations?",
    a: "Language models only parse line-item text and merchant categories. Every subtotal, tax sum, and closing discrepancy is recalculated deterministically in TypeScript using exact cent-rounded arithmetic: Opening Balance + Total Credits - Total Debits = Calculated Closing.",
  },
  {
    q: "Do I need an OpenAI or DeepSeek API key to test the workbench?",
    a: "No. Keyless Demo Mode runs out of the box with three verified multi-currency presets and a local regex heuristic parser for custom text or PDF uploads. You can attach your own OpenAI, DeepSeek, Qwen, or local Ollama endpoint at any time.",
  },
  {
    q: "What happens if the LLM endpoint times out or returns malformed JSON?",
    a: "Every API call is wrapped in a 22-second AbortController timeout with exponential backoff on HTTP 429 or 5xx responses. If the upstream model fails or omits fields, the backend transparently falls back to the deterministic local parser so your workflow never breaks.",
  },
  {
    q: "Will exported files open cleanly in Excel, QuickBooks, and Xero?",
    a: "Yes. CSV exports include a UTF-8 BOM header and formula-injection escaping so international currency symbols (£, €, ¥) render properly in Microsoft Excel. The Excel (.xls) option outputs a native multi-worksheet XML workbook containing both Transactions and Reconciliation tabs.",
  },
  {
    q: "Are uploaded bank statements or API keys stored on a server?",
    a: "Never. Statement buffers are parsed in-memory during the request lifecycle and discarded immediately. Your optional custom API key stays in your browser localStorage and is never written to server logs.",
  },
  {
    q: "How does global tax compliance work for Pro and Firm subscriptions?",
    a: "StatementFlow supports both Lemon Squeezy (acting as Merchant of Record to handle EU VAT, UK VAT, and US state sales tax automatically) and Stripe Checkout with webhook signature verification.",
  },
];

function formatMoney(amount: number, currency = "USD"): string {
  const symbolMap: Record<string, string> = {
    USD: "$",
    GBP: "£",
    EUR: "€",
    CAD: "CA$",
    AUD: "A$",
  };
  const sym = symbolMap[currency.toUpperCase()] ?? `${currency} `;
  const absFormatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${sym}${absFormatted}` : `${sym}${absFormatted}`;
}

function resolveInitialBankPreset() {
  if (typeof window === "undefined") {
    return { preset: SAMPLE_PRESETS[0], notice: "" };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const bankSlug = params.get("bank");
    if (bankSlug) {
      const bank = findPseoBankBySlug(bankSlug);
      if (bank) {
        const matched =
          SAMPLE_PRESETS.find((s) => s.id === bank.recommendedSampleId) ||
          SAMPLE_PRESETS[0];
        return {
          preset: matched,
          notice: `Pre-configured studio for ${bank.institutionName} (${bank.targetFormat}).`,
        };
      }
    }
  } catch {
    // ignore URL parsing errors
  }
  return { preset: SAMPLE_PRESETS[0], notice: "" };
}

export function StatementWorkbench() {
  // 当前选中的预设样本与输入源模式（支持从 /convert/[slug]?bank=... 深链自动预载入）
  const [selectedSampleId, setSelectedSampleId] = useState<string>(
    () => resolveInitialBankPreset().preset.id
  );
  const [inputMode, setInputMode] = useState<"sample" | "upload" | "paste">(
    "sample"
  );
  const [customRawText, setCustomRawText] = useState<string>(
    () => resolveInitialBankPreset().preset.rawPreviewText
  );
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedPdfBase64, setUploadedPdfBase64] = useState<string>("");

  // 当前结构化提取结果（支持行内实时编辑与重算）
  const [extraction, setExtraction] = useState<ExtractionResult>(() => {
    const { preset } = resolveInitialBankPreset();
    return {
      ...preset.result,
      meta: {
        modeUsed: "demo_sample",
        providerName: "Verified Preset",
        modelName: "Deterministic Ledger Engine",
        latencyMs: 38,
        warnings: [],
      },
    };
  });

  // 过滤与检索状态
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // AI 配置与计费状态（惰性初始化）
  const [aiConfig, setAiConfig] = useState<AIConfigSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_AI_CONFIG;
    try {
      const savedAi = window.localStorage.getItem(STORAGE_KEY_AI);
      return savedAi
        ? { ...DEFAULT_AI_CONFIG, ...JSON.parse(savedAi) }
        : DEFAULT_AI_CONFIG;
    } catch {
      return DEFAULT_AI_CONFIG;
    }
  });
  const [billing, setBilling] = useState<BillingState>(() => {
    if (typeof window === "undefined") return DEFAULT_BILLING;
    try {
      const savedBilling = window.localStorage.getItem(STORAGE_KEY_BILLING);
      return savedBilling
        ? { ...DEFAULT_BILLING, ...JSON.parse(savedBilling) }
        : DEFAULT_BILLING;
    } catch {
      return DEFAULT_BILLING;
    }
  });
  const [gateway, setGateway] = useState<"lemonsqueezy" | "stripe">(
    "lemonsqueezy"
  );

  // 弹窗与交互反馈状态
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<Exclude<
    PlanTier,
    "free"
  > | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string>(
    () => resolveInitialBankPreset().notice
  );
  const [copiedJson, setCopiedJson] = useState(false);
  const [navDark, setNavDark] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pressVideoRef = useRef<HTMLVideoElement | null>(null);

  // 滚动揭示动画 + 顶栏色彩随章节自适应 + 视频可见性播放控制
  useEffect(() => {
    const revealNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const videoEl = pressVideoRef.current;
    let videoObserver: IntersectionObserver | null = null;

    if (videoEl) {
      if (reducedMotion) {
        videoEl.pause();
      } else {
        videoObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                videoEl.play().catch(() => {});
              } else {
                videoEl.pause();
              }
            }
          },
          { threshold: 0.25 }
        );
        videoObserver.observe(videoEl);
      }
    }

    const handleScroll = () => {
      setNavDark(window.scrollY > 420);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      revealObserver.disconnect();
      if (videoObserver) videoObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function saveAiConfig(next: AIConfigSettings) {
    setAiConfig(next);
    try {
      localStorage.setItem(STORAGE_KEY_AI, JSON.stringify(next));
    } catch {
      // ignore
    }
    setStatusNotice(
      next.provider === "openai_compatible"
        ? `Live LLM mode enabled (${next.model}).`
        : "Keyless Demo Mode active."
    );
  }

  function handleActivatePlan(plan: Exclude<PlanTier, "free">, email: string) {
    const nextBilling: BillingState = {
      plan,
      creditsUsed: billing.creditsUsed,
      creditsLimit: 999999,
      customerEmail: email,
      activatedAt: new Date().toISOString(),
    };
    setBilling(nextBilling);
    try {
      localStorage.setItem(STORAGE_KEY_BILLING, JSON.stringify(nextBilling));
    } catch {
      // ignore
    }
    setStatusNotice(
      `${plan === "business" ? "Accounting Firm" : "StatementFlow Pro"} license activated for ${email}. Unlimited extractions unlocked.`
    );
  }

  // 切换预设样本
  function handleSelectSample(sampleId: string) {
    const preset = SAMPLE_PRESETS.find((s) => s.id === sampleId);
    if (!preset) return;
    setSelectedSampleId(sampleId);
    setInputMode("sample");
    setCustomRawText(preset.rawPreviewText);
    setUploadedFileName(preset.fileName);
    setUploadedPdfBase64("");
    setExtraction({
      ...preset.result,
      meta: {
        modeUsed: "demo_sample",
        providerName: "Verified Preset",
        modelName: "Deterministic Ledger Engine",
        latencyMs: 34,
        warnings: [],
      },
    });
    setStatusNotice(`Loaded verified sample: ${preset.name}`);
  }

  // 处理本地文件上传 (.pdf, .csv, .txt)
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setInputMode("upload");

    if (file.name.toLowerCase().endsWith(".pdf")) {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      setUploadedPdfBase64(base64);
      setCustomRawText(
        `[PDF Binary Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\nClick "Run Extraction" to parse transactions and verify reconciliation.`
      );
      setStatusNotice(`Attached PDF "${file.name}". Ready to extract.`);
    } else {
      const text = await file.text();
      setUploadedPdfBase64("");
      setCustomRawText(text);
      setStatusNotice(`Loaded text from "${file.name}". Ready to extract.`);
    }
  }

  // 调用后端 /api/extract 执行提取与对账
  async function handleRunExtraction() {
    if (
      billing.plan === "free" &&
      billing.creditsUsed >= billing.creditsLimit
    ) {
      setCheckoutPlan("pro");
      return;
    }

    setIsExtracting(true);
    setStatusNotice("");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    try {
      const payload = {
        sampleId: inputMode === "sample" ? selectedSampleId : undefined,
        rawText: customRawText,
        fileName: uploadedFileName || "statement.txt",
        pdfBase64: uploadedPdfBase64 || undefined,
        aiConfig:
          aiConfig.provider === "openai_compatible" ? aiConfig : undefined,
      };

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errData.error || `Extraction failed (${res.status})`);
      }

      const data = (await res.json()) as {
        result?: ExtractionResult;
        rawPreviewText?: string;
      } & ExtractionResult;
      const result = data.result ?? data;
      setExtraction(result);

      if (billing.plan === "free") {
        const nextBilling: BillingState = {
          ...billing,
          creditsUsed: Math.min(billing.creditsLimit, billing.creditsUsed + 1),
        };
        setBilling(nextBilling);
        try {
          localStorage.setItem(
            STORAGE_KEY_BILLING,
            JSON.stringify(nextBilling)
          );
        } catch {
          // ignore
        }
      }

      setStatusNotice(
        `Extracted ${result.transactions.length} rows in ${result.meta.latencyMs}ms via ${result.meta.providerName}.`
      );
    } catch (err) {
      clearTimeout(timer);
      setStatusNotice(
        err instanceof Error
          ? err.message
          : "Extraction timed out. Please verify your input and retry."
      );
    } finally {
      setIsExtracting(false);
    }
  }

  // 行内编辑单笔交易并实时重算财务恒等式
  function updateTransaction(
    id: string,
    patch: Partial<TransactionItem>
  ): void {
    setExtraction((prev) => {
      const nextTx = prev.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...patch } : tx
      );
      const nextRec = computeReconciliation(
        prev.reconciliation.openingBalance,
        prev.reconciliation.closingBalance,
        nextTx,
        prev.documentType
      );
      return {
        ...prev,
        transactions: nextTx,
        reconciliation: nextRec,
      };
    });
  }

  function handleAddTransactionRow() {
    const newItem: TransactionItem = {
      id: `manual-${Date.now()}`,
      date: "2026-10-30", // taste-skill-ignore
      merchant: "Manual Adjustment Entry",
      description: "Reconciliation journal line item",
      category: "Office & Operations",
      type: "debit",
      amount: 0,
      confidence: 1,
    };
    setExtraction((prev) => {
      const nextTx = [newItem, ...prev.transactions];
      return {
        ...prev,
        transactions: nextTx,
        reconciliation: computeReconciliation(
          prev.reconciliation.openingBalance,
          prev.reconciliation.closingBalance,
          nextTx,
          prev.documentType
        ),
      };
    });
  }

  function handleDeleteTransactionRow(id: string) {
    setExtraction((prev) => {
      const nextTx = prev.transactions.filter((tx) => tx.id !== id);
      return {
        ...prev,
        transactions: nextTx,
        reconciliation: computeReconciliation(
          prev.reconciliation.openingBalance,
          prev.reconciliation.closingBalance,
          nextTx,
          prev.documentType
        ),
      };
    });
  }

  // 过滤后的交易列表
  const filteredTransactions = useMemo(() => {
    return extraction.transactions.filter((tx) => {
      const matchesCat =
        categoryFilter === "ALL" || tx.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        tx.merchant.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.date.includes(q);
      return matchesCat && matchesQuery;
    });
  }, [extraction.transactions, categoryFilter, searchQuery]);

  // 导出处理函数
  function handleExportCsv() {
    const csv = buildCsvContent(extraction);
    const safeName = extraction.accountOrInvoiceNumber.replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );
    triggerBrowserDownload(
      csv,
      `StatementFlow_${safeName}.csv`,
      "text/csv;charset=utf-8;"
    );
  }

  function handleExportExcel() {
    const xml = buildExcelWorkbookXml(extraction);
    const safeName = extraction.accountOrInvoiceNumber.replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );
    triggerBrowserDownload(
      xml,
      `StatementFlow_${safeName}.xls`,
      "application/vnd.ms-excel"
    );
  }

  function handleExportJson() {
    const json = JSON.stringify(extraction, null, 2);
    const safeName = extraction.accountOrInvoiceNumber.replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );
    triggerBrowserDownload(
      json,
      `StatementFlow_${safeName}.json`,
      "application/json"
    );
  }

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(extraction, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 1800);
    } catch {
      // ignore
    }
  }

  const rec = extraction.reconciliation;

  return (
    <div className="min-h-svh overflow-x-clip bg-[#f5f5f7] text-[#111215]">
      {/* 顶栏：与 .sf-wrap 严格同宽对齐，随滚动章节切换深浅色 */}
      <header
        className={`sticky top-0 z-40 overflow-x-clip transition-colors duration-300 ${
          navDark
            ? "bg-[#0a0b0e]/95 text-[#f5f5f7]"
            : "bg-[#f5f5f7]/95 text-[#111215]"
        }`}
      >
        <div className="sf-wrap flex min-h-16 items-center justify-between gap-4 py-3">
          <a
            href="#top"
            className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-[#0066cc] text-sm font-semibold text-white">
              S
            </span>
            <span>StatementFlow</span>
          </a>

          <nav
            aria-label="Primary Navigation"
            className="hidden items-center gap-8 text-base font-medium lg:flex"
          >
            <a href="#workbench" className="opacity-80 hover:opacity-100">
              Studio
            </a>
            <a href="#how-it-works" className="opacity-80 hover:opacity-100">
              Method
            </a>
            <a href="#archival-proof" className="opacity-80 hover:opacity-100">
              Archive
            </a>
            <a href="#pricing" className="opacity-80 hover:opacity-100">
              Plans
            </a>
            <a href="#faq" className="opacity-80 hover:opacity-100">
              Questions
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className={`sf-btn hidden min-h-11 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium sm:inline-flex ${
                navDark
                  ? "bg-[#1a1d26] text-[#f5f5f7]"
                  : "bg-[#e8e8ed] text-[#111215]"
              }`}
            >
              <Settings2 className="size-4 text-[#0066cc]" />
              <span>
                {aiConfig.provider === "openai_compatible"
                  ? "Live LLM"
                  : "AI Engine"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCheckoutPlan("pro")}
              className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white"
            >
              <span>
                {billing.plan === "free"
                  ? "Upgrade"
                  : `${billing.plan.toUpperCase()} Active`}
              </span>
              <ArrowUpRight className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="overflow-x-clip">
        {/* =====================================================================
            CHAPTER 1: APPLE FLAGSHIP HERO - TITANIUM ALABASTER INTO OBSIDIAN
            ===================================================================== */}
        <section className="bg-[#f5f5f7] pt-12 pb-16 text-[#111215] lg:pt-20 lg:pb-24">
          <div className="sf-wrap">
            <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <h1
                  data-load
                  style={{ "--d": "60ms" } as React.CSSProperties}
                  className="sf-display text-[#111215]"
                >
                  Every statement,
                  <br />
                  verified to zero.
                </h1>
                <p
                  data-load
                  style={{ "--d": "150ms" } as React.CSSProperties}
                  className="sf-lead mt-6 text-[#494b52]"
                >
                  Upload multi-page PDF bank statements, Stripe tax invoices, or
                  UK VAT receipts. Deterministic cent-level math checks every
                  transaction before exporting to Excel, CSV, or QuickBooks.
                </p>
                <div
                  data-load
                  style={{ "--d": "240ms" } as React.CSSProperties}
                  className="mt-8 flex flex-wrap items-center gap-4"
                >
                  <a
                    href="#workbench"
                    className="sf-btn inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0066cc] px-6 py-3 text-base font-semibold text-white"
                  >
                    <span>Open live studio</span>
                    <ArrowUpRight className="size-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setAiModalOpen(true)}
                    className="sf-btn inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#e8e8ed] px-5 py-3 text-base font-medium text-[#111215]"
                  >
                    <Sparkles className="size-4 text-[#0066cc]" />
                    <span>Configure AI endpoint</span>
                  </button>
                </div>
              </div>

              <div
                data-load
                style={{ "--d": "310ms" } as React.CSSProperties}
                className="rounded-xl bg-[#e8e8ed] p-6 lg:col-span-4"
              >
                <div className="flex items-center justify-between gap-2 text-sm font-medium text-[#494b52]">
                  <span>Active Verification Formula</span>
                  <span className="tabular-nums text-[#111215]">100% Exact</span>
                </div>
                <div className="sf-lead mt-2 font-semibold tabular-nums text-[#111215]">
                  Opening + Credits - Debits = Closing
                </div>
                <p className="mt-3 text-sm text-[#494b52]">
                  Zero tolerance for floating-point drift. Every row edit
                  recalculates the ledger balance in real time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 色彩章节无缝切换：深空黑馆藏视觉与高速票据印刷机实拍流（左右齐平外边距） */}
        <section className="bg-[#0a0b0e] py-16 text-[#f5f5f7] lg:py-24">
          <div className="sf-wrap">
            <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
              <figure
                data-reveal
                style={{ "--delay": "0ms" } as React.CSSProperties}
                className="flex flex-col justify-between lg:col-span-7"
              >
                <div className="overflow-hidden rounded-xl bg-[#141720]">
                  <Image
                    src="/assets/blythe-house-ledger-room-1924.jpg"
                    alt="Clerks reconciling bound bank ledgers at the Post Office Savings Bank in Blythe House, London, 1924"
                    width={1920}
                    height={1440}
                    priority
                    unoptimized
                    className="sf-archival-img aspect-[4/3] w-full"
                  />
                </div>
                <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-2 text-sm text-[#a0a6b5]">
                  <span>
                    Post Office Savings Bank ledger hall, Blythe House, London,
                    1924.
                  </span>
                  <span className="tabular-nums text-[#f5f5f7]">
                    100 years of balance verification
                  </span>
                </figcaption>
              </figure>

              <div
                data-reveal
                style={{ "--delay": "90ms" } as React.CSSProperties}
                className="flex flex-col justify-between gap-6 lg:col-span-5"
              >
                <div>
                  <div className="overflow-hidden rounded-xl bg-[#141720]">
                    <video
                      ref={pressVideoRef}
                      src="/assets/the-910-ton-printing-presses-at-the.webm"
                      poster="/assets/the-910-ton-printing-presses-at-the-poster.jpg"
                      width={854}
                      height={480}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 text-sm text-[#a0a6b5]">
                    <span>
                      High-speed web press stream converted into verified
                      ledgers.
                    </span>
                    <span className="tabular-nums text-[#f5f5f7]">
                      60 fps stream
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div>
                    <div className="sf-lead font-semibold tabular-nums text-white">
                      $0.00
                    </div>
                    <div className="mt-1 text-sm text-[#a0a6b5]">
                      Allowed drift
                    </div>
                  </div>
                  <div>
                    <div className="sf-lead font-semibold tabular-nums text-white">
                      1.4s
                    </div>
                    <div className="mt-1 text-sm text-[#a0a6b5]">
                      Median parse
                    </div>
                  </div>
                  <div>
                    <div className="sf-lead font-semibold tabular-nums text-white">
                      3 tabs
                    </div>
                    <div className="mt-1 text-sm text-[#a0a6b5]">
                      XLS, CSV, JSON
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            CHAPTER 2: LIVE STUDIO WORKBENCH - OBSIDIAN SLATE (#101216)
            ===================================================================== */}
        <section
          id="workbench"
          className="bg-[#101216] py-16 text-[#f5f5f7] lg:py-24"
        >
          <div className="sf-wrap">
            {/* 章节标题与输入源切换 */}
            <div
              data-reveal
              className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
            >
              <div>
                <h2 className="sf-head text-white">Live studio.</h2>
                <p className="mt-3 text-base text-[#a0a6b5]">
                  Switch between three multi-currency statements, upload a PDF
                  or CSV, or edit any transaction cell below to watch the
                  reconciliation equation recalculate.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode("sample")}
                  className={`sf-btn min-h-11 rounded-lg px-4 py-2 text-sm font-medium ${
                    inputMode === "sample"
                      ? "bg-[#0066cc] text-white"
                      : "bg-[#1b1f2a] text-[#c5cad6]"
                  }`}
                >
                  Verified Samples
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("upload");
                    fileInputRef.current?.click();
                  }}
                  className={`sf-btn inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                    inputMode === "upload"
                      ? "bg-[#0066cc] text-white"
                      : "bg-[#1b1f2a] text-[#c5cad6]"
                  }`}
                >
                  <Upload className="size-4" />
                  <span>Upload PDF / CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("paste")}
                  className={`sf-btn min-h-11 rounded-lg px-4 py-2 text-sm font-medium ${
                    inputMode === "paste"
                      ? "bg-[#0066cc] text-white"
                      : "bg-[#1b1f2a] text-[#c5cad6]"
                  }`}
                >
                  Paste Raw Text
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* 预设样本选择栏（标记 data-ui 作为工作台顶部控件） */}
            <div
              data-ui="sample-switcher"
              data-reveal
              style={{ "--delay": "70ms" } as React.CSSProperties}
              className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3"
            >
              {SAMPLE_PRESETS.map((sample) => {
                const active =
                  inputMode === "sample" && selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample.id)}
                    className={`sf-btn flex w-full flex-col justify-between rounded-xl p-5 text-left ${
                      active
                        ? "bg-[#0066cc] text-white"
                        : "bg-[#181c26] text-[#f5f5f7] hover:bg-[#202634]"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-sm font-medium opacity-85">
                        {sample.badge}
                      </span>
                      <span className="text-sm tabular-nums opacity-85">
                        {sample.pages} {sample.pages > 1 ? "pages" : "page"}
                      </span>
                    </div>
                    <div className="mt-3 text-base font-semibold">
                      {sample.name}
                    </div>
                    <div className="mt-1 text-sm opacity-80">
                      {sample.fileName}
                    </div>
                  </button>
                );
              })}
            </div>

            {statusNotice && (
              <div className="mt-4 flex items-center justify-between gap-4 rounded-lg bg-[#181c26] px-4 py-3 text-sm text-[#d5d9e2]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 shrink-0 text-[#0066cc]" />
                  <span>{statusNotice}</span>
                </div>
                <span className="tabular-nums text-sm text-[#9ca3b5]">
                  {billing.plan === "free"
                    ? `Free quota: ${billing.creditsUsed}/${billing.creditsLimit} runs`
                    : "Unlimited Pro License"}
                </span>
              </div>
            )}

            {/* 双栏工作台：左右各自独立标记 [data-ui] 并严格控制高度 < 820px */}
            <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
              {/* 左栏 [data-ui]：原始票据文本流与一键提取引擎 */}
              <div
                data-ui="source-panel"
                data-reveal
                style={{ "--delay": "120ms" } as React.CSSProperties}
                className="ui-surface p-5 lg:col-span-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-white">
                      {extraction.documentTitle}
                    </div>
                    <div className="mt-0.5 text-sm text-[#9ca3b5]">
                      {extraction.institution} ·{" "}
                      <span className="tabular-nums">
                        {extraction.accountOrInvoiceNumber}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isExtracting}
                    onClick={handleRunExtraction}
                    className="sf-btn inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`size-4 ${isExtracting ? "animate-spin" : ""}`}
                    />
                    <span>
                      {isExtracting ? "Extracting..." : "Run Extraction"}
                    </span>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2.5 text-sm">
                  <div className="ui-tile p-3">
                    <div className="text-sm text-[#9ca3b5]">Statement Date</div>
                    <div className="mt-1 font-medium tabular-nums text-white">
                      {extraction.statementPeriod}
                    </div>
                  </div>
                  <div className="ui-tile p-3">
                    <div className="text-sm text-[#9ca3b5]">Currency</div>
                    <div className="mt-1 font-medium tabular-nums text-white">
                      {extraction.currency}
                    </div>
                  </div>
                  <div className="ui-tile p-3">
                    <div className="text-sm text-[#9ca3b5]">Parse Time</div>
                    <div className="mt-1 font-medium tabular-nums text-white">
                      {extraction.meta.latencyMs} ms
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="raw-statement-stream"
                    className="block text-sm font-medium text-[#c5cad6]"
                  >
                    Raw Statement Stream (Editable Input)
                  </label>
                  <textarea
                    id="raw-statement-stream"
                    value={customRawText}
                    onChange={(e) => {
                      setCustomRawText(e.target.value);
                      if (inputMode === "sample") setInputMode("paste");
                    }}
                    rows={9}
                    className="ui-input mt-2 w-full p-3 text-base leading-relaxed tabular-nums text-[#e2e6f0]"
                  />
                </div>
              </div>

              {/* 右栏 [data-ui]：确定性对账面板 + 导出工具栏 + 可编辑明细表 */}
              <div
                data-ui="ledger-panel"
                data-reveal
                style={{ "--delay": "180ms" } as React.CSSProperties}
                className="ui-surface p-5 lg:col-span-7"
              >
                {/* 对账恒等式实时横幅 */}
                <div
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-lg p-4 ${
                    rec.isBalanced
                      ? "bg-[#122a20] text-[#b8f5d4]"
                      : "bg-[#33181b] text-[#ffd4d8]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {rec.isBalanced ? (
                      <CheckCircle2 className="size-5 shrink-0 text-[#34d399]" />
                    ) : (
                      <AlertTriangle className="size-5 shrink-0 text-[#f87171]" />
                    )}
                    <div>
                      <div className="text-base font-semibold">
                        {rec.isBalanced
                          ? "Reconciliation Equation Balanced"
                          : `Discrepancy Detected (${formatMoney(rec.discrepancy, extraction.currency)})`}
                      </div>
                      <div className="text-sm opacity-85 tabular-nums">
                        Opening{" "}
                        {formatMoney(rec.openingBalance, extraction.currency)} +
                        Credits{" "}
                        {formatMoney(rec.totalCredits, extraction.currency)} -
                        Debits{" "}
                        {formatMoney(rec.totalDebits, extraction.currency)} =
                        Calculated{" "}
                        {formatMoney(
                          rec.calculatedClosing,
                          extraction.currency
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="rounded-md bg-[#0a0b0e]/40 px-2.5 py-1 text-sm font-semibold tabular-nums">
                    {extraction.transactions.length} rows
                  </span>
                </div>

                {/* 4 项关键核算指标 */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="ui-tile p-3.5">
                    <div className="text-sm text-[#9ca3b5]">
                      Opening Balance
                    </div>
                    <div className="mt-1 text-base font-semibold tabular-nums text-white">
                      {formatMoney(rec.openingBalance, extraction.currency)}
                    </div>
                  </div>
                  <div className="ui-tile p-3.5">
                    <div className="text-sm text-[#9ca3b5]">
                      Total Credits (+)
                    </div>
                    <div className="mt-1 text-base font-semibold tabular-nums text-[#34d399]">
                      +{formatMoney(rec.totalCredits, extraction.currency)}
                    </div>
                  </div>
                  <div className="ui-tile p-3.5">
                    <div className="text-sm text-[#9ca3b5]">
                      Total Debits (-)
                    </div>
                    <div className="mt-1 text-base font-semibold tabular-nums text-[#f5f5f7]">
                      -{formatMoney(rec.totalDebits, extraction.currency)}
                    </div>
                  </div>
                  <div className="ui-tile p-3.5">
                    <div className="text-sm text-[#9ca3b5]">
                      Closing Balance
                    </div>
                    <div className="mt-1 text-base font-semibold tabular-nums text-white">
                      {formatMoney(rec.closingBalance, extraction.currency)}
                    </div>
                  </div>
                </div>

                {/* 搜索过滤与导出工具栏 */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9ca3b5]" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter merchant..."
                        aria-label="Filter transactions by merchant"
                        className="ui-input min-h-11 pr-3 pl-9 text-base"
                      />
                    </div>

                    <select
                      aria-label="Filter by category"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="ui-input min-h-11 px-3 text-base"
                    >
                      <option value="ALL">All Categories</option>
                      {ALL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddTransactionRow}
                      className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#252b3b] px-3.5 py-2 text-sm font-medium text-white"
                    >
                      <Plus className="size-4" />
                      <span>Add Row</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#0066cc] px-3.5 py-2 text-sm font-semibold text-white"
                    >
                      <FileSpreadsheet className="size-4" />
                      <span>Excel (.xls)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#252b3b] px-3.5 py-2 text-sm font-medium text-white"
                    >
                      <Download className="size-4" />
                      <span>CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#252b3b] px-3.5 py-2 text-sm font-medium text-white"
                    >
                      <FileText className="size-4" />
                      <span>JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      aria-label="Copy JSON to clipboard"
                      className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#252b3b] px-3 py-2 text-sm font-medium text-white"
                    >
                      {copiedJson ? (
                        <Check className="size-4 text-[#34d399]" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 紧凑滚动交易明细表（限制最大高度以避免 [data-ui] 超出 1.6×视口高度） */}
                <div className="mt-4 max-h-[320px] overflow-x-auto overflow-y-auto rounded-lg bg-[#11131a] p-2">
                  <table className="ui-table w-full text-left text-sm">
                    <thead>
                      <tr className="text-sm text-[#9ca3b5]">
                        <th className="py-2.5 pr-2 pl-2 font-medium">Date</th>
                        <th className="py-2.5 px-2 font-medium">Merchant</th>
                        <th className="py-2.5 px-2 font-medium">Category</th>
                        <th className="py-2.5 px-2 font-medium">Type</th>
                        <th className="py-2.5 px-2 text-right font-medium">
                          Amount ({extraction.currency})
                        </th>
                        <th className="py-2.5 pl-2 text-right font-medium">
                          Act
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="align-middle">
                          <td className="py-2 pr-2 pl-2 tabular-nums text-[#d5d9e2]">
                            {tx.date}
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={tx.merchant}
                              aria-label={`Merchant for ${tx.date}`}
                              onChange={(e) =>
                                updateTransaction(tx.id, {
                                  merchant: e.target.value,
                                })
                              }
                              className="ui-input w-full min-w-[130px] px-2.5 py-1.5 text-base"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              aria-label={`Category for ${tx.merchant}`}
                              value={tx.category}
                              onChange={(e) =>
                                updateTransaction(tx.id, {
                                  category: e.target
                                    .value as TransactionCategory,
                                })
                              }
                              className="ui-input min-w-[150px] px-2 py-1.5 text-base"
                            >
                              {ALL_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateTransaction(tx.id, {
                                  type:
                                    tx.type === "credit" ? "debit" : "credit",
                                })
                              }
                              className={`sf-btn rounded-md px-2.5 py-1 text-sm font-semibold ${
                                tx.type === "credit"
                                  ? "bg-[#122a20] text-[#34d399]"
                                  : "bg-[#252b3b] text-[#d5d9e2]"
                              }`}
                            >
                              {tx.type.toUpperCase()}
                            </button>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              aria-label={`Amount for ${tx.merchant}`}
                              value={tx.amount}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                updateTransaction(tx.id, {
                                  amount: Number.isFinite(val)
                                    ? Math.abs(val)
                                    : 0,
                                });
                              }}
                              className="ui-input w-28 px-2.5 py-1.5 text-right text-base tabular-nums"
                            />
                          </td>
                          <td className="py-2 pl-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteTransactionRow(tx.id)}
                              aria-label={`Delete ${tx.merchant}`}
                              className="sf-btn inline-flex size-9 items-center justify-center rounded-md bg-[#1f2430] text-[#9ca3b5] hover:text-[#f87171]"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            CHAPTER 3: HOW IT WORKS & ARCHIVAL PROOF - ARCHITECTURAL STONE (#e4e3df)
            Blueprint: "Stages as one bar" + Museum Collection Gallery
            ===================================================================== */}
        <section
          id="how-it-works"
          className="bg-[#e4e3df] py-16 text-[#141413] lg:py-24"
        >
          <div className="sf-wrap">
            <div
              data-reveal
              className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
            >
              <div>
                <h2 className="sf-head text-[#141413]">
                  Four stages, two seconds.
                </h2>
                <p className="sf-lead mt-4 text-[#4a4944]">
                  Every upload travels through a single horizontal verification
                  bar. Language models structure messy text; deterministic
                  TypeScript math guarantees the accounting balance.
                </p>
              </div>
              <a
                href="#workbench"
                className="sf-btn inline-flex min-h-11 items-center gap-2 self-start rounded-lg bg-[#141413] px-5 py-2.5 text-sm font-semibold text-[#f5f5f7] lg:self-auto"
              >
                <span>Test pipeline live</span>
                <ArrowUpRight className="size-4" />
              </a>
            </div>

            {/* Blueprint: Stages as one bar (single full-width proportional bar) */}
            <div
              data-ui="pipeline-bar"
              data-reveal
              style={{ "--delay": "90ms" } as React.CSSProperties}
              className="mt-10 grid grid-cols-1 overflow-hidden rounded-xl lg:grid-cols-12"
            >
              {PIPELINE_STAGES.map((stage) => (
                <div
                  key={stage.stepWord}
                  className={`flex flex-col justify-between p-6 ${stage.shareClass} ${stage.bgClass}`}
                >
                  <div className="flex items-center justify-between gap-2 text-sm opacity-80">
                    <span className="font-medium">{stage.stepWord}</span>
                    <span className="tabular-nums font-semibold">
                      {stage.durationLabel}
                    </span>
                  </div>
                  <div className="mt-6">
                    <div className="text-base font-semibold">{stage.title}</div>
                    <p className="mt-2 text-sm leading-relaxed opacity-90">
                      {stage.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Archival Financial Ledger & Engraving Gallery (4 Museum Plates, flush edges) */}
            <div
              id="archival-proof"
              data-reveal
              style={{ "--delay": "150ms" } as React.CSSProperties}
              className="mt-16 grid grid-cols-1 gap-8 lg:mt-24 lg:grid-cols-12"
            >
              {ARCHIVAL_PLATES.map((plate, idx) => (
                <figure
                  key={plate.src}
                  data-reveal
                  style={
                    { "--delay": `${idx * 70}ms` } as React.CSSProperties
                  }
                  className={`flex flex-col justify-between ${plate.spanClass}`}
                >
                  <div className="overflow-hidden rounded-xl bg-[#141413]">
                    <Image
                      src={plate.src}
                      alt={plate.alt}
                      width={plate.width}
                      height={plate.height}
                      loading="lazy"
                      unoptimized
                      className={`sf-archival-img w-full ${plate.aspectClass}`}
                    />
                  </div>
                  <figcaption className="mt-4">
                    <div className="text-base font-semibold text-[#141413]">
                      {plate.title}
                    </div>
                    <p className="mt-1 text-sm text-[#4a4944]">
                      {plate.caption}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            CHAPTER 4: PRICING - CRISP PAPER (#ffffff)
            Blueprint: "Plans that step up" (Bottom-aligned ascending columns, no SVGs)
            ===================================================================== */}
        <section
          id="pricing"
          className="bg-[#ffffff] py-16 text-[#111215] lg:py-24"
        >
          <div className="sf-wrap">
            <div
              data-reveal
              className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
            >
              <div>
                <h2 className="sf-head text-[#111215]">Plans that scale.</h2>
                <p className="mt-3 text-base text-[#494b52]">
                  Start immediately in Keyless Demo Mode. Upgrade via Lemon
                  Squeezy Merchant of Record or Stripe Checkout when your
                  monthly statement volume grows.
                </p>
              </div>

              <div className="inline-flex flex-wrap items-center gap-2 rounded-xl bg-[#f5f5f7] p-1.5">
                <button
                  type="button"
                  onClick={() => setGateway("lemonsqueezy")}
                  className={`sf-btn min-h-11 rounded-lg px-4 py-2 text-sm font-semibold ${
                    gateway === "lemonsqueezy"
                      ? "bg-[#0066cc] text-white"
                      : "text-[#111215]"
                  }`}
                >
                  Lemon Squeezy (Global Tax MoR)
                </button>
                <button
                  type="button"
                  onClick={() => setGateway("stripe")}
                  className={`sf-btn min-h-11 rounded-lg px-4 py-2 text-sm font-semibold ${
                    gateway === "stripe"
                      ? "bg-[#0066cc] text-white"
                      : "text-[#111215]"
                  }`}
                >
                  Stripe Checkout
                </button>
              </div>
            </div>

            {/* Blueprint: Three columns aligned at bottom, stepping up in height */}
            <div className="mt-12 grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
              {/* Tier 1: Starter */}
              <div
                data-reveal
                style={{ "--delay": "0ms" } as React.CSSProperties}
                className="flex min-h-[380px] flex-col justify-between overflow-hidden rounded-xl bg-[#f5f5f7] text-[#111215] lg:col-span-4"
              >
                <div className="p-8">
                  <div className="text-base font-semibold">Starter Studio</div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="sf-lead font-semibold tabular-nums">
                      $0
                    </span>
                    <span className="text-sm text-[#494b52]">/forever</span>
                  </div>
                  <p className="mt-3 text-sm text-[#494b52]">
                    Built for founders testing multi-currency presets and local
                    heuristic statement conversion.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-[#111215]">
                    <li>3 statement extraction runs included</li>
                    <li>Deterministic balance equation check</li>
                    <li>Bring your own OpenAI / DeepSeek key</li>
                  </ul>
                </div>

                <a
                  href="#workbench"
                  className="sf-btn flex min-h-16 w-full items-center justify-between bg-[#e2e2e8] px-8 text-base font-semibold text-[#111215]"
                >
                  <span>Launch Free Studio</span>
                  <span className="tabular-nums">Free</span>
                </a>
              </div>

              {/* Tier 2: StatementFlow Pro (Taller column) */}
              <div
                data-reveal
                style={{ "--delay": "90ms" } as React.CSSProperties}
                className="flex min-h-[450px] flex-col justify-between overflow-hidden rounded-xl bg-[#151921] text-[#f5f5f7] lg:col-span-4"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-semibold text-white">
                      StatementFlow Pro
                    </span>
                    <span className="rounded-md bg-[#0066cc] px-2.5 py-1 text-sm font-semibold text-white">
                      Recommended
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="sf-lead font-semibold tabular-nums text-white">
                      $19
                    </span>
                    <span className="text-sm text-[#a0a6b5]">/month</span>
                  </div>
                  <p className="mt-3 text-sm text-[#a0a6b5]">
                    Unlimited statement and invoice conversions for independent
                    operators, e-commerce sellers, and bookkeepers.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-[#e2e6f0]">
                    <li>Unlimited monthly PDF & CSV extractions</li>
                    <li>Multi-sheet Excel (.xls) & QuickBooks CSV</li>
                    <li>Inline ledger editor & discrepancy alerts</li>
                    <li>Automatic EU/UK VAT tax receipt</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => setCheckoutPlan("pro")}
                  className="sf-btn flex min-h-16 w-full items-center justify-between bg-[#0066cc] px-8 text-base font-semibold text-white"
                >
                  <span>Activate Pro</span>
                  <span className="tabular-nums">$19/mo</span>
                </button>
              </div>

              {/* Tier 3: Accounting Firm (Tallest column) */}
              <div
                data-reveal
                style={{ "--delay": "180ms" } as React.CSSProperties}
                className="flex min-h-[520px] flex-col justify-between overflow-hidden rounded-xl bg-[#0a0b0e] text-[#f5f5f7] lg:col-span-4"
              >
                <div className="p-8">
                  <div className="text-base font-semibold text-white">
                    Accounting Firm
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="sf-lead font-semibold tabular-nums text-white">
                      $49
                    </span>
                    <span className="text-sm text-[#a0a6b5]">/month</span>
                  </div>
                  <p className="mt-3 text-sm text-[#a0a6b5]">
                    Built for CPA practices, fractional CFOs, and multi-entity
                    finance teams reconciling client accounts at scale.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-[#e2e6f0]">
                    <li>Everything in StatementFlow Pro</li>
                    <li>5 team seats & shared category rules</li>
                    <li>Dedicated REST API & webhook pipeline</li>
                    <li>Custom chart-of-accounts JSON mapping</li>
                    <li>Priority schema engineering support</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => setCheckoutPlan("business")}
                  className="sf-btn flex min-h-16 w-full items-center justify-between bg-[#1d2230] px-8 text-base font-semibold text-white hover:bg-[#0066cc]"
                >
                  <span>Activate Firm</span>
                  <span className="tabular-nums">$49/mo</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            CHAPTER 5: FAQ - DEEP SLATE (#151921)
            Blueprint: "Accordion of filled tiles"
            ===================================================================== */}
        <section
          id="faq"
          className="bg-[#151921] py-16 text-[#f5f5f7] lg:py-24"
        >
          <div className="sf-wrap">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
              <div data-reveal className="lg:col-span-4">
                <h2 className="sf-head text-white">Common questions.</h2>
                <p className="mt-4 text-base text-[#a0a6b5]">
                  How StatementFlow combines language-model extraction with
                  deterministic accounting math, privacy guards, and global tax
                  compliance.
                </p>
              </div>

              <div
                data-reveal
                style={{ "--delay": "90ms" } as React.CSSProperties}
                className="space-y-2 lg:col-span-8"
              >
                {FAQ_ITEMS.map((item, idx) => (
                  <details
                    key={item.q}
                    name="sf-faq"
                    open={idx === 0}
                    className="group rounded-xl bg-[#1e2430] p-6 text-[#f5f5f7] transition-colors open:bg-[#0066cc] open:text-white"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
                      <span>{item.q}</span>
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0a0b0e]/25 text-base tabular-nums">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-xl text-base leading-relaxed opacity-90">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          CHAPTER 6: FOOTER - OBSIDIAN INK (#0a0b0e)
          Blueprint: "The mark, built large" + Archival Credits
          ===================================================================== */}
      <footer className="overflow-x-clip bg-[#0a0b0e] py-16 text-[#f5f5f7] lg:py-24">
        <div className="sf-wrap">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="text-base font-semibold text-white">
                StatementFlow Financial Engineering
              </div>
              <p className="mt-2 text-sm text-[#a0a6b5]">
                Deterministic bank statement, tax invoice, and multi-currency
                receipt extraction studio. Built for zero-discrepancy accounting
                workflows.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-3 lg:col-span-6">
              <div className="space-y-2">
                <div className="font-semibold text-white">Studio</div>
                <ul className="space-y-1 text-[#a0a6b5]">
                  <li>
                    <a
                      href="#workbench"
                      className="inline-flex min-h-8 items-center hover:text-white"
                    >
                      Live Workbench
                    </a>
                  </li>
                  <li>
                    <a
                      href="#how-it-works"
                      className="inline-flex min-h-8 items-center hover:text-white"
                    >
                      Verification Bar
                    </a>
                  </li>
                  <li>
                    <a
                      href="#archival-proof"
                      className="inline-flex min-h-8 items-center hover:text-white"
                    >
                      Archival Ledger Proof
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-white">Exports</div>
                <ul className="space-y-1 text-[#a0a6b5]">
                  <li>
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="inline-flex min-h-8 items-center hover:text-white"
                    >
                      SpreadsheetML (.xls)
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="inline-flex min-h-8 items-center hover:text-white"
                    >
                      QuickBooks UTF-8 CSV
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="inline-flex min-h-8 items-center hover:text-white"
                    >
                      Audit Schema JSON
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-white">Billing & API</div>
                <ul className="space-y-1 text-[#a0a6b5]">
                  <li>
                    <button
                      type="button"
                      onClick={() => setAiModalOpen(true)}
                      className="inline-flex min-h-8 items-center hover:text-white"
                    >
                      OpenAI / DeepSeek Setup
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setCheckoutPlan("pro")}
                      className="inline-flex min-h-8 items-center hover:text-white"
                    >
                      Lemon Squeezy MoR
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setCheckoutPlan("business")}
                      className="inline-flex min-h-8 items-center hover:text-white"
                    >
                      Firm API License
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Programmatic SEO 银行与发票转换器内链矩阵 */}
          <div className="mt-12">
            <div className="text-base font-semibold text-white">
              Dedicated Bank & Platform Converters
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {PSEO_BANK_ENTRIES.map((bank) => (
                <Link
                  key={bank.slug}
                  href={`/convert/${bank.slug}`}
                  className="inline-flex min-h-10 items-center justify-between rounded-lg bg-[#151921] px-3.5 py-2 text-sm text-[#c5cad6] hover:bg-[#0066cc] hover:text-white"
                >
                  <span>{bank.shortName}</span>
                  <span className="tabular-nums opacity-75">
                    {bank.defaultCurrency}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Blueprint: The mark, built large (12-column architectural wordmark blocks) */}
          <div
            aria-hidden="true"
            className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-12"
          >
            <div className="flex h-20 items-end rounded-xl bg-[#151921] p-4 text-base font-semibold tracking-tight text-white lg:col-span-7">
              STATEMENTFLOW
            </div>
            <div className="flex h-20 items-end justify-between rounded-xl bg-[#0066cc] p-4 text-base font-semibold tabular-nums text-white lg:col-span-5">
              <span>VERIFIED</span>
              <span>2026</span>
            </div>
          </div>

          <div className="credits mt-10 max-w-2xl text-sm leading-7 text-[#8b92a5]">
            Media credits:{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Blythe_House_ledger_room_1924.JPG"
              className="inline-block py-1 underline hover:text-white"
            >
              &ldquo;Blythe House ledger room 1924&rdquo;
            </a>{" "}
            by Post Office Savings Bank (UK), public domain, via Wikimedia
            Commons ·{" "}
            <a
              href="https://www.metmuseum.org/art/collection/search/339836"
              className="inline-block py-1 underline hover:text-white"
            >
              &ldquo;Specimen Sheet of Bank Note Engraving&rdquo;
            </a>{" "}
            by Asher Brown Durand, ca. 1828, public domain (CC0), via The
            Metropolitan Museum of Art ·{" "}
            <a
              href="https://www.metmuseum.org/art/collection/search/339833"
              className="inline-block py-1 underline hover:text-white"
            >
              &ldquo;$1000 Bill for The Greenwich Bank, The City of New
              York&rdquo;
            </a>{" "}
            by Asher Brown Durand, ca. 1828, public domain (CC0), via The
            Metropolitan Museum of Art ·{" "}
            <a
              href="https://www.metmuseum.org/art/collection/search/339851"
              className="inline-block py-1 underline hover:text-white"
            >
              &ldquo;First Merchant&apos;s Exchange, New York: plan of main
              floor&rdquo;
            </a>{" "}
            by Alexander Jackson Davis, probably 1826, public domain (CC0), via
            The Metropolitan Museum of Art ·{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:New_York_Stock_Exchange,_New_York,_New_York_LCCN2011632356.tif"
              className="inline-block py-1 underline hover:text-white"
            >
              &ldquo;New York Stock Exchange, New York, New York
              LCCN2011632356&rdquo;
            </a>{" "}
            by Carol M. Highsmith, public domain, via Wikimedia Commons ·{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:The_910_ton_printing_presses_at_the_Las_Vegas_Review-Journal_were_the_largest_in_the_world_when_installed_in_2000.webm"
              className="inline-block py-1 underline hover:text-white"
            >
              &ldquo;The 910 ton printing presses at the Las Vegas
              Review-Journal&rdquo;
            </a>{" "}
            by Harrison Keely,{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0"
              className="inline-block py-1 underline hover:text-white"
            >
              CC BY 4.0
            </a>
            , via Wikimedia Commons
          </div>
        </div>
      </footer>

      {/* 弹窗组件 */}
      <AISettingsModal
        open={aiModalOpen}
        config={aiConfig}
        onClose={() => setAiModalOpen(false)}
        onSave={saveAiConfig}
      />

      {checkoutPlan && (
        <CheckoutModal
          open={Boolean(checkoutPlan)}
          plan={checkoutPlan}
          gateway={gateway}
          onClose={() => setCheckoutPlan(null)}
          onSuccessActivate={handleActivatePlan}
        />
      )}
    </div>
  );
}
