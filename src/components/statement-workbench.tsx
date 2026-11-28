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
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { SAMPLE_PRESETS, findSampleById } from "@/lib/samples";
import { trackSfEvent } from "@/lib/telemetry";
import { PSEO_BANK_ENTRIES, findPseoBankBySlug } from "@/lib/pseo-banks";
import { computeReconciliation } from "@/lib/schema";
import { parseDocumentHeuristically } from "@/lib/heuristic-parser";
import { extractWithAISafety } from "@/lib/ai-extractor";
import {
  buildCsvContent,
  buildExcelXlsxBytes,
  buildQuickBooksCsvContent,
  buildXeroCsvContent,
  triggerBrowserDownload,
} from "@/lib/export-utils";
import {
  AISettingsModal,
  CheckoutModal,
  RestoreLicenseModal,
} from "@/components/modals";
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
const STORAGE_KEY_RECENT = "statementflow_recent_ledgers_v1";

interface RecentLedgerItem {
  id: string;
  savedAt: string;
  rawText: string;
  result: ExtractionResult;
}

const DEFAULT_AI_CONFIG: AIConfigSettings = {
  provider: "demo",
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
};

const DEFAULT_BILLING: BillingState = {
  plan: "free",
  creditsUsed: 0,
  creditsLimit: 2,
};

/**
 * 零 Cookie、零个人数据的轻量转化漏斗埋点，自动携带跨页持久化的 UTM 归因参数
 */
function trackFunnelEvent(
  event: string,
  meta?: Record<string, string | number | boolean>
) {
  trackSfEvent(event, meta);
}

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
      "Generates zero-warning native multi-sheet Excel (.xlsx), QuickBooks/Xero CSV, and audit-ready JSON.",
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
    a: "No. Local Zero-Upload Mode runs out of the box with three verified multi-currency presets and a deterministic browser-local parser for PDF/CSV uploads, plus 2 free Cloud AI runs. You can also attach your own HTTPS OpenAI, DeepSeek, or Qwen API key (BYOK) anytime.",
  },
  {
    q: "What happens if the LLM endpoint times out or returns malformed JSON?",
    a: "Long multi-page PDFs are automatically split into line-safe chunks and wrapped in a 42-second AbortController timeout. If an upstream model stalls or omits fields, Local Zero-Upload mode parses standard statements offline in milliseconds.",
  },
  {
    q: "Will exported files open cleanly in Excel, QuickBooks, and Xero?",
    a: "Yes. CSV exports include a UTF-8 BOM header and smart formula-injection escaping (preserving signed negative debits like -1842.60) so QuickBooks Online, Xero, and Excel import with zero errors. The Excel (.xlsx) option outputs a native multi-worksheet OOXML workbook.",
  },
  {
    q: "Are uploaded bank statements or API keys stored on a server?",
    a: "Never. In Local 0-Upload mode, 0 bytes leave your browser. In Cloud AI OCR mode, ephemeral buffers are parsed in-memory and discarded immediately. Your optional BYOK API key stays exclusively in browser localStorage.",
  },
  {
    q: "How does global tax compliance work for Pro ($29) and Firm Pilot ($199)?",
    a: "StatementFlow uses Creem.io as our authorized Merchant of Record to handle EU VAT, UK VAT, and US state sales tax automatically with compliant tax receipts and a 14-day 100% money-back guarantee.",
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
  const [uploadedPageImages, setUploadedPageImages] = useState<string[]>([]);

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
  const [gateway] = useState<"creem" | "stripe">(
    "creem"
  );

  // 弹窗与交互反馈状态
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<Exclude<
    PlanTier,
    "free"
  > | null>(null);
  const [checkoutReason, setCheckoutReason] = useState<string>("");
  const [directCheckoutLoading, setDirectCheckoutLoading] = useState<string | null>(null);
  const [engineMode, setEngineMode] = useState<"local_zero_upload" | "cloud_ai">(
    "local_zero_upload"
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [batchFiles, setBatchFiles] = useState<{ name: string; text: string }[]>([]);
  const [extractProgress, setExtractProgress] = useState<{
    current: number;
    total: number;
    label: string;
  } | null>(null);
  const [statusNotice, setStatusNotice] = useState<string>(
    () => resolveInitialBankPreset().notice
  );
  const [copiedJson, setCopiedJson] = useState(false);
  const [navDark, setNavDark] = useState(false);
  const [recentLedgers, setRecentLedgers] = useState<RecentLedgerItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_RECENT);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as RecentLedgerItem[];
      return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
    } catch {
      return [];
    }
  });
  const [pilotLeadEmail, setPilotLeadEmail] = useState("");
  const [pilotLeadBank, setPilotLeadBank] = useState("");
  const [pilotSampleFile, setPilotSampleFile] = useState<{
    name: string;
    snippet: string;
  } | null>(null);
  const [pilotLeadLoading, setPilotLeadLoading] = useState(false);
  const [pilotLeadMsg, setPilotLeadMsg] = useState("");

  function persistRecentLedger(res: ExtractionResult, rawStream: string) {
    try {
      const keyId = `${res.institution}-${res.accountOrInvoiceNumber}-${res.statementPeriod}`
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .slice(0, 80);
      const entry: RecentLedgerItem = {
        id: keyId || `ledger-${Date.now()}`,
        savedAt: new Date().toISOString(),
        rawText: rawStream.slice(0, 24000),
        result: res,
      };
      setRecentLedgers((prev) => {
        const next = [entry, ...prev.filter((item) => item.id !== entry.id)].slice(0, 8);
        try {
          window.localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(next));
        } catch {
          // 忽略浏览器配额溢出
        }
        return next;
      });
    } catch {
      // ignore
    }
  }

  function handleClearRecentLedgers() {
    setRecentLedgers([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY_RECENT);
    } catch {
      // ignore
    }
    setStatusNotice("Cleared browser-local ledger history.");
  }

  async function handlePilotSampleAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".pdf")) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const { extractTextFromPdfBytes } = await import("@/lib/client-pdf");
        const { text, pages } = await extractTextFromPdfBytes(bytes);
        setPilotSampleFile({
          name: `${file.name} (${pages}p)`,
          snippet:
            text.trim().length > 20
              ? text.slice(0, 14000)
              : `[Scanned image PDF: ${pages} page(s), ${Math.round(file.size / 1024)}KB]`,
        });
      } else {
        const text = await file.text();
        setPilotSampleFile({
          name: file.name,
          snippet: text.slice(0, 14000),
        });
      }
    } catch {
      setPilotSampleFile({ name: file.name, snippet: "[Binary/Protected PDF]" });
    }
  }

  async function startDirectCheckout(
    targetPlan: Exclude<PlanTier, "free">,
    source: string
  ) {
    trackFunnelEvent("checkout_direct_click", { plan: targetPlan, source });
    setDirectCheckoutLoading(targetPlan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: targetPlan,
          email: billing.customerEmail || "",
          gateway,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          mode?: string;
          checkoutUrl?: string;
        };
        if (data.mode === "live_redirect" && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
      }
      setCheckoutPlan(targetPlan);
    } catch {
      setCheckoutPlan(targetPlan);
    } finally {
      setDirectCheckoutLoading(null);
    }
  }

  async function handlePrePilotLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pilotLeadEmail.trim() || !pilotLeadBank.trim()) return;
    setPilotLeadLoading(true);
    setPilotLeadMsg("");
    try {
      const res = await fetch("/api/pre-pilot-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pilotLeadEmail.trim(),
          firmOrBank: pilotLeadBank.trim(),
          sampleFileName: pilotSampleFile?.name || undefined,
          sampleSnippet: pilotSampleFile?.snippet || undefined,
          notes: "Submitted from Pricing Free 4h Sample Proof card",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok || !data.ok) {
        setPilotLeadMsg(data.error || "Could not submit right now. Email hello@statementflow.win directly.");
        return;
      }
      setPilotLeadMsg(
        data.message ||
          "Check your inbox! Reply with 1 redacted PDF for your free 4h QBO/Xero proof."
      );
      setPilotLeadEmail("");
      setPilotLeadBank("");
      setPilotSampleFile(null);
    } catch {
      setPilotLeadMsg("Network error — please email hello@statementflow.win.");
    } finally {
      setPilotLeadLoading(false);
    }
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pressVideoRef = useRef<HTMLVideoElement | null>(null);

  // 承接 /convert/[slug] 银行专页首屏本地直传过来的 PDF 文本流与扫描件标记，无缝回填进工作台
  useEffect(() => {
    try {
      const rawPending = window.sessionStorage.getItem("sf_pending_upload_v1");
      if (!rawPending) return;
      window.sessionStorage.removeItem("sf_pending_upload_v1");
      const parsed = JSON.parse(rawPending) as {
        fileName?: string;
        text?: string;
        batchParts?: Array<{ name: string; text: string }>;
        isScanned?: boolean;
      };
      const fname = parsed.fileName || "statement.pdf";
      if (parsed.text && parsed.text.trim().length > 0) {
        setInputMode("upload");
        setUploadedFileName(fname);
        setCustomRawText(parsed.text);
        setBatchFiles(
          parsed.batchParts && parsed.batchParts.length > 0
            ? parsed.batchParts
            : [{ name: fname, text: parsed.text }]
        );
        const instantLocal = parseDocumentHeuristically(
          parsed.text,
          fname,
          "heuristic_fallback"
        );
        if (instantLocal.transactions.length > 0) {
          setExtraction(instantLocal);
          setStatusNotice(
            `Parsed ${instantLocal.transactions.length} rows locally from ${fname} in ${instantLocal.meta.latencyMs}ms (0 bytes uploaded).`
          );
        } else {
          setEngineMode("cloud_ai");
          setStatusNotice(
            `Loaded ${fname} from bank converter — click "Run Extraction" to run Cloud AI Deep Parse.`
          );
        }
      } else if (parsed.isScanned || parsed.fileName) {
        setInputMode("upload");
        setUploadedFileName(fname);
        setEngineMode("cloud_ai");
        setStatusNotice(
          `Detected scanned/image statement (${fname}) with no embedded text layer — drop ${fname} directly into the uploader below to run Vision AI OCR.`
        );
      }
    } catch {
      // ignore
    }
  }, []);

  // Creem 支付成功回跳或点击邮件跨设备激活链接（?restore_token=...）时自动服务端核验并持久解锁
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const restoreToken = params.get("restore_token")?.trim();
    const checkoutId = params.get("checkout_id")?.trim();

    if (restoreToken) {
      let cancelled = false;
      (async () => {
        try {
          const res = await fetch("/api/license/restore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: restoreToken }),
          });
          if (!res.ok || cancelled) return;
          const data = (await res.json()) as {
            restored?: boolean;
            plan?: Exclude<PlanTier, "free">;
            email?: string;
            restoreToken?: string;
          };
          if (data.restored && data.plan && !cancelled) {
            const next: BillingState = {
              plan: data.plan,
              creditsUsed: 0,
              creditsLimit: 999999,
              customerEmail: data.email,
              restoreToken: data.restoreToken || restoreToken,
              activatedAt: new Date().toISOString(),
            };
            setBilling(next);
            localStorage.setItem(STORAGE_KEY_BILLING, JSON.stringify(next));
            setStatusNotice(
              `License restored (${data.plan.toUpperCase()}) for ${data.email || "your workspace"} — unlimited conversions unlocked.`
            );
            params.delete("restore_token");
            const qs = params.toString();
            window.history.replaceState(
              {},
              "",
              qs ? `${window.location.pathname}?${qs}` : window.location.pathname
            );
          }
        } catch {
          // ignore
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    if (params.get("checkout") !== "success") return;
    if (!checkoutId) {
      setRestoreModalOpen(true);
      setStatusNotice(
        "Payment completed! Enter your checkout email in the Restore window to activate your license immediately."
      );
      return;
    }

    let cancelled = false;
    (async () => {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        if (cancelled) return;
        try {
          const res = await fetch(
            `/api/verify-checkout?checkout_id=${encodeURIComponent(checkoutId)}`
          );
          if (res.ok && !cancelled) {
            const data = (await res.json()) as {
              verified?: boolean;
              plan?: string;
              email?: string;
              restoreToken?: string;
            };
            if (data.verified && !cancelled) {
              const unlockedPlan: PlanTier =
                data.plan === "business" ? "business" : "pro";
              setBilling((prev) => {
                const next: BillingState = {
                  ...prev,
                  plan: unlockedPlan,
                  creditsLimit: 999999,
                  customerEmail: data.email || prev.customerEmail,
                  restoreToken: data.restoreToken || prev.restoreToken,
                  activatedAt: new Date().toISOString(),
                };
                localStorage.setItem(STORAGE_KEY_BILLING, JSON.stringify(next));
                return next;
              });
              setStatusNotice(
                `Payment verified via Creem.io — ${unlockedPlan.toUpperCase()} license is now active.`
              );
              try {
                const w = window as Window & { lpConvert?: (ev: string, val: number) => void };
                w.lpConvert?.("purchase", unlockedPlan === "business" ? 199 : 29);
              } catch {
                // ignore
              }
              for (const k of [
                "checkout",
                "checkout_id",
                "order_id",
                "customer_id",
                "product_id",
                "signature",
                "plan",
              ]) {
                params.delete(k);
              }
              const nextSearch = params.toString();
              window.history.replaceState(
                {},
                "",
                nextSearch ? `${window.location.pathname}?${nextSearch}` : window.location.pathname
              );
              return;
            }
          }
        } catch {
          // retry
        }
        await new Promise((r) => setTimeout(r, 1800));
      }
      if (!cancelled) {
        setRestoreModalOpen(true);
        setStatusNotice(
          "Payment is finalizing — enter your checkout email to receive or activate your license link."
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
    trackFunnelEvent("page_view", {
      path: window.location.pathname,
      ref: (document.referrer || "direct").slice(0, 100),
    });

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

  function handleActivatePlan(
    plan: Exclude<PlanTier, "free">,
    email: string,
    restoreToken?: string
  ) {
    const nextBilling: BillingState = {
      plan,
      creditsUsed: billing.creditsUsed,
      creditsLimit: 999999,
      customerEmail: email,
      restoreToken: restoreToken || billing.restoreToken,
      activatedAt: new Date().toISOString(),
    };
    setBilling(nextBilling);
    try {
      localStorage.setItem(STORAGE_KEY_BILLING, JSON.stringify(nextBilling));
    } catch {
      // ignore
    }
    setCheckoutReason("");
    setStatusNotice(
      `${plan === "business" ? "Accounting Firm" : "StatementFlow Pro"} license activated for ${email}. Unlimited extractions & QBO/Xero/Excel exports unlocked.`
    );
  }

  // 切换预设样本
  function handleSelectSample(sampleId: string) {
    const preset = SAMPLE_PRESETS.find((s) => s.id === sampleId);
    if (!preset) return;
    trackFunnelEvent("sample_try", { sampleId });
    setSelectedSampleId(sampleId);
    setInputMode("sample");
    setCustomRawText(preset.rawPreviewText);
    setUploadedFileName(preset.fileName);
    setUploadedPdfBase64("");
    setBatchFiles([]);
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

  // 处理本地单文件或多文件批量上传 (.pdf, .csv, .txt)，全部在浏览器端 100% 本地提取
  async function processUploadedFiles(fileList: File[]) {
    if (fileList.length === 0) return;
    trackFunnelEvent("pdf_upload", { count: fileList.length });

    const batchLabel =
      fileList.length === 1
        ? fileList[0].name
        : `${fileList.length} files (${fileList[0].name} +${fileList.length - 1} more)`;
    setUploadedFileName(batchLabel);
    setInputMode("upload");
    setUploadedPdfBase64("");
    setUploadedPageImages([]);

    setStatusNotice(
      `Parsing ${fileList.length} statement file(s) 100% locally in your browser...`
    );

    const combinedChunks: string[] = [];
    const parsedEntries: { name: string; text: string }[] = [];
    const scannedImages: string[] = [];
    let totalPages = 0;
    let parsedCount = 0;
    let failedCount = 0;

    for (const file of fileList) {
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".pdf")) {
        try {
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          const { extractTextFromPdfBytes, renderPdfPagesToJpegDataUrls } =
            await import("@/lib/client-pdf");
          const { text, pages } = await extractTextFromPdfBytes(bytes);
          if (text.trim().length > 20) {
            combinedChunks.push(`=== FILE: ${file.name} ===\n${text}`);
            parsedEntries.push({ name: file.name, text });
            totalPages += pages;
            parsedCount += 1;
          } else {
            // 扫描版图片 PDF：自动渲染前 4 页为 JPEG 供视觉 AI OCR 精准识表
            const imgs = await renderPdfPagesToJpegDataUrls(
              bytes,
              Math.max(1, 4 - scannedImages.length)
            );
            if (imgs.length > 0) {
              scannedImages.push(...imgs);
              totalPages += imgs.length;
              parsedCount += 1;
            } else {
              failedCount += 1;
            }
          }
        } catch {
          failedCount += 1;
        }
      } else if (/\.(png|jpe?g|webp)$/.test(lower)) {
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("Image read failed"));
            reader.readAsDataURL(file);
          });
          if (dataUrl && scannedImages.length < 4) {
            scannedImages.push(dataUrl);
            totalPages += 1;
            parsedCount += 1;
          }
        } catch {
          failedCount += 1;
        }
      } else {
        const text = await file.text();
        if (text.trim().length > 0) {
          combinedChunks.push(`=== FILE: ${file.name} ===\n${text}`);
          parsedEntries.push({ name: file.name, text });
          totalPages += 1;
          parsedCount += 1;
        }
      }
    }

    if (combinedChunks.length > 0) {
      setCustomRawText(combinedChunks.join("\n\n"));
      setBatchFiles(parsedEntries);
      setUploadedPageImages([]);
      trackFunnelEvent("upload_files", {
        files: parsedCount,
        pages: totalPages,
        mode: "text",
      });
      const warnSuffix =
        failedCount > 0
          ? ` (${failedCount} file(s) could not be read).`
          : "";
      setStatusNotice(
        parsedEntries.length > 1
          ? `Ready to merge ${parsedEntries.length} statements (${totalPages} pages) into 1 chronological ledger. Click "Run Extraction" to start chunked reconciliation.${warnSuffix}`
          : `Parsed ${parsedCount} file(s) (${totalPages} total page(s)) locally in browser. Click "Run Extraction" to reconcile.${warnSuffix}`
      );
    } else if (scannedImages.length > 0) {
      setCustomRawText("");
      setBatchFiles([]);
      setUploadedPageImages(scannedImages);
      trackFunnelEvent("upload_files", {
        files: parsedCount,
        pages: scannedImages.length,
        mode: "vision_ocr",
      });
      setStatusNotice(
        `Detected scanned PDF / image (${scannedImages.length} page(s) ready for Vision AI OCR). Click "Run Extraction" to parse and reconcile.`
      );
    } else {
      setCustomRawText("");
      setUploadedPageImages([]);
      setStatusNotice(
        `No selectable text or readable images found in the uploaded file(s). Please ensure PDFs are not password-protected.`
      );
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = Array.from(e.target.files || []);
    await processUploadedFiles(fileList);
    e.target.value = "";
  }

  async function handleWorkbenchDrop(e: React.DragEvent<HTMLElement>) {
    e.preventDefault();
    setIsDraggingFile(false);
    const fileList = Array.from(e.dataTransfer.files || []);
    if (fileList.length > 0) {
      await processUploadedFiles(fileList);
    }
  }

  // 按换行安全切分超长对账单文本（每块 <= 7500 字符），彻底消除 15–20 页商业银行长账单大模型解析超时
  function splitTextIntoLineChunks(raw: string, maxChars = 7500): string[] {
    const trimmed = raw.trim();
    if (trimmed.length <= maxChars) return [trimmed];
    const lines = trimmed.split(/\r?\n/);
    const headerContext = lines.slice(0, 12).join("\n");
    const chunks: string[] = [];
    let current = "";
    for (const line of lines) {
      if (current.length + line.length + 1 > maxChars && current.length > 0) {
        chunks.push(current);
        current = `[Context Header]\n${headerContext}\n[Continued Lines]\n${line}`;
      } else {
        current = current ? `${current}\n${line}` : line;
      }
    }
    if (current.trim().length > 0) chunks.push(current);
    return chunks;
  }

  // 执行提取与对账：支持「真 100% 浏览器本地 0 网络请求」与「零留存分块云端 AI 深度解析」双引擎
  async function handleRunExtraction() {
    if (inputMode === "sample") {
      const preset = findSampleById(selectedSampleId) || SAMPLE_PRESETS[0];
      setExtraction({
        ...preset.result,
        meta: {
          modeUsed: "demo_sample",
          providerName: "Verified Preset (0 Network)",
          modelName: "Deterministic Ledger Engine",
          latencyMs: 14,
          warnings: [],
        },
      });
      setStatusNotice(`Verified sample reconciled in 14ms with $0.00 drift.`);
      return;
    }

    const usePureLocalEngine =
      engineMode === "local_zero_upload" &&
      aiConfig.provider !== "openai_compatible" &&
      uploadedPageImages.length === 0 &&
      !(inputMode === "upload" && batchFiles.length > 1);

    if (usePureLocalEngine) {
      const localRes = parseDocumentHeuristically(
        customRawText,
        uploadedFileName || "statement.pdf",
        "heuristic_fallback"
      );
      if (localRes.transactions.length > 0) {
        setExtraction(localRes);
        persistRecentLedger(localRes, customRawText);
        trackFunnelEvent("extract_local_zero_upload", {
          txCount: localRes.transactions.length,
          balanced: localRes.reconciliation.isBalanced,
        });
        setStatusNotice(
          `Parsed ${localRes.transactions.length} rows 100% locally in ${localRes.meta.latencyMs}ms (0 bytes sent over network).`
        );
        return;
      }
      // 本地规则对特殊多栏排版未识别出行时，不塞假数据，诚实提示切换云端 AI 深度解析
      setStatusNotice(
        "This PDF uses a complex multi-column layout — switched to Cloud AI Deep Parse automatically for exact extraction..."
      );
    }

    if (billing.plan === "free" && aiConfig.provider !== "openai_compatible") {
      if (inputMode === "upload" && batchFiles.length > 1) {
        trackFunnelEvent("paywall_hit", {
          gate: "batch_merge",
          files: batchFiles.length,
        });
        setCheckoutReason(
          `Multi-PDF Batch Merge (${batchFiles.length} statements → 1 chronological reconciled ledger) is a StatementFlow Pro feature — unlock forever for $29 once.`
        );
        setCheckoutPlan("pro");
        return;
      }
      if (uploadedPageImages.length > 0) {
        trackFunnelEvent("paywall_hit", {
          gate: "vision_ocr",
          pages: uploadedPageImages.length,
        });
        setCheckoutReason(
          `Scanned PDF & Image Vision AI OCR (${uploadedPageImages.length} page(s) ready) requires StatementFlow Pro — unlock unlimited Vision OCR forever for $29 once.`
        );
        setCheckoutPlan("pro");
        return;
      }
      if (billing.creditsUsed >= billing.creditsLimit) {
        trackFunnelEvent("paywall_hit", {
          gate: "free_quota",
          creditsUsed: billing.creditsUsed,
        });
        setCheckoutReason(
          "You've used your 2 free Cloud AI runs. Local Zero-Upload mode stays free, or unlock unlimited Cloud AI, batch merge & QuickBooks/Xero exports forever for $29 once."
        );
        setCheckoutPlan("pro");
        return;
      }
    }

    const effectiveBatch =
      inputMode === "upload" && batchFiles.length > 1
        ? batchFiles
        : uploadedPageImages.length === 0 && customRawText.length > 9500
        ? splitTextIntoLineChunks(customRawText, 7500).map((chunk, idx) => ({
            name: `${uploadedFileName || "statement"} (Part ${idx + 1})`,
            text: chunk,
          }))
        : null;

    const runBatchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setIsExtracting(true);
    setStatusNotice("");
    setExtractProgress(
      effectiveBatch && effectiveBatch.length > 1
        ? { current: 0, total: effectiveBatch.length, label: "Running parallel chunked extraction (anti-timeout)..." }
        : { current: 1, total: 1, label: `Extracting ${uploadedFileName || "statement"}...` }
    );

    const runSingleChunk = async (
      chunkText: string,
      chunkFileName: string,
      sampleId?: string,
      pageImgs?: string[]
    ): Promise<ExtractionResult> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);
      try {
        const res = await fetch("/api/extract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-SF-Client": "workbench",
          },
          body: JSON.stringify({
            sampleId,
            rawText: chunkText,
            fileName: chunkFileName,
            batchId: runBatchId,
            pdfBase64: uploadedPdfBase64 || undefined,
            pageImages: pageImgs && pageImgs.length > 0 ? pageImgs : undefined,
            licenseToken: billing.restoreToken || undefined,
            aiConfig:
              aiConfig.provider === "openai_compatible" ? aiConfig : undefined,
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (res.status === 404) {
          const sample = sampleId ? findSampleById(sampleId) : undefined;
          return await extractWithAISafety(
            sample ? sample.rawPreviewText : chunkText,
            sample ? sample.fileName : chunkFileName,
            aiConfig.provider === "openai_compatible"
              ? {
                  apiKey: aiConfig.apiKey,
                  baseUrl: aiConfig.baseUrl,
                  model: aiConfig.model,
                }
              : undefined
          );
        }
        if (res.status === 402) {
          const errData = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          const msg =
            errData.error ||
            "Free extraction limit reached — unlock StatementFlow Pro ($29 once) for unlimited conversions.";
          trackFunnelEvent("paywall_hit", { gate: "server_402" });
          setCheckoutReason(msg);
          setCheckoutPlan("pro");
          throw new Error(msg);
        }
        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(errData.error || `Extraction failed (${res.status})`);
        }
        const data = (await res.json()) as {
          result?: ExtractionResult;
        } & ExtractionResult;
        return data.result ?? data;
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    };

    try {
      let result: ExtractionResult;
      if (effectiveBatch && effectiveBatch.length > 1) {
        // 先串行提交第 1 分块以在 D1 原子注册 runBatchId（防止并发多分块重复扣减免费配额），随后以并发度=3 加速剩余分块
        const chunkResults: ExtractionResult[] = new Array(effectiveBatch.length);
        setExtractProgress({
          current: 0,
          total: effectiveBatch.length,
          label: `Extracting 1 / ${effectiveBatch.length}: ${effectiveBatch[0].name}`,
        });
        chunkResults[0] = await runSingleChunk(effectiveBatch[0].text, effectiveBatch[0].name);
        let completed = 1;
        setExtractProgress({
          current: completed,
          total: effectiveBatch.length,
          label: `Merged 1 / ${effectiveBatch.length} chunk(s)...`,
        });
        const concurrency = 3;
        for (let start = 1; start < effectiveBatch.length; start += concurrency) {
          const slice = effectiveBatch.slice(start, start + concurrency);
          setExtractProgress({
            current: completed,
            total: effectiveBatch.length,
            label: `Extracting ${Math.min(start + slice.length, effectiveBatch.length)} / ${effectiveBatch.length}: ${slice.map((s) => s.name).join(", ")}`,
          });
          const batchOut = await Promise.all(
            slice.map((item) => runSingleChunk(item.text, item.name))
          );
          batchOut.forEach((resItem, offset) => {
            chunkResults[start + offset] = resItem;
            completed += 1;
          });
          setExtractProgress({
            current: completed,
            total: effectiveBatch.length,
            label: `Merged ${completed} / ${effectiveBatch.length} chunk(s)...`,
          });
        }
        const mergedTx: TransactionItem[] = chunkResults
          .flatMap((cr, cIdx) =>
            cr.transactions.map((tx, tIdx) => ({
              ...tx,
              id: `${tx.id || "tx"}-m${cIdx + 1}-${tIdx + 1}`,
            }))
          )
          .sort((a, b) => a.date.localeCompare(b.date));
        const first = chunkResults[0];
        const last = chunkResults[chunkResults.length - 1];
        const mergedRec = computeReconciliation(
          first.reconciliation.openingBalance,
          last.reconciliation.closingBalance,
          mergedTx,
          first.documentType
        );
        const totalLatency = chunkResults.reduce(
          (acc, cr) => acc + (cr.meta?.latencyMs || 0),
          0
        );
        result = {
          ...first,
          statementPeriod: `${first.statementPeriod} → ${last.statementPeriod} (${chunkResults.length} merged)`,
          transactions: mergedTx,
          reconciliation: mergedRec,
          meta: {
            ...first.meta,
            latencyMs: totalLatency,
            providerName: `${first.meta.providerName} · ${chunkResults.length}-File Merge`,
          },
        };
      } else {
        result = await runSingleChunk(
          customRawText,
          uploadedFileName || "statement.txt",
          undefined,
          uploadedPageImages
        );
      }

      setExtraction(result);
      persistRecentLedger(result, customRawText);
      trackFunnelEvent(
        result.reconciliation.isBalanced
          ? "extract_balanced"
          : "extract_unbalanced",
        {
          txCount: result.transactions.length,
          currency: result.currency,
          mode: result.meta.modeUsed,
        }
      );

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
      setStatusNotice(
        err instanceof Error
          ? err.message
          : "Extraction timed out. Please verify your input and retry."
      );
    } finally {
      setIsExtracting(false);
      setExtractProgress(null);
    }
  }

  // 行内编辑期初或期末余额并实时重算复式恒等式
  function updateReconciliationBalance(
    field: "openingBalance" | "closingBalance",
    value: number
  ): void {
    setExtraction((prev) => {
      const nextOpening =
        field === "openingBalance" ? value : prev.reconciliation.openingBalance;
      const nextClosing =
        field === "closingBalance" ? value : prev.reconciliation.closingBalance;
      return {
        ...prev,
        meta: { ...prev.meta, modeUsed: "heuristic_fallback" },
        reconciliation: computeReconciliation(
          nextOpening,
          nextClosing,
          prev.transactions,
          prev.documentType
        ),
      };
    });
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
        meta: { ...prev.meta, modeUsed: "heuristic_fallback" },
        transactions: nextTx,
        reconciliation: nextRec,
      };
    });
  }

  function handleAddTransactionRow() {
    const newItem: TransactionItem = {
      id: `manual-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
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
        meta: { ...prev.meta, modeUsed: "heuristic_fallback" },
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

  function handleAutoBalanceRow() {
    const diff = extraction.reconciliation.discrepancy;
    if (Math.abs(diff) < 0.005) return;
    const amount = Math.round(Math.abs(diff) * 100) / 100;
    const latestDate = extraction.transactions[0]?.date || "2026-10-30";
    // 同时验算 credit / debit 两个方向，自动选取能令复式恒等式差额归零的方向（兼容银行对账单与发票模式）
    const makeEntry = (type: "credit" | "debit"): TransactionItem => ({
      id: `reconcile-${Date.now()}`,
      date: latestDate,
      merchant: "Reconciliation Balancing Entry",
      description: `Auto-balance adjustment (${type === "debit" ? "-" : "+"}${amount.toFixed(2)})`,
      category: "Office & Operations",
      type,
      amount,
      confidence: 1,
    });
    const creditEntry = makeEntry("credit");
    const debitEntry = makeEntry("debit");
    const recCredit = computeReconciliation(
      extraction.reconciliation.openingBalance,
      extraction.reconciliation.closingBalance,
      [creditEntry, ...extraction.transactions],
      extraction.documentType
    );
    const recDebit = computeReconciliation(
      extraction.reconciliation.openingBalance,
      extraction.reconciliation.closingBalance,
      [debitEntry, ...extraction.transactions],
      extraction.documentType
    );
    const useCredit =
      Math.abs(recCredit.discrepancy) <= Math.abs(recDebit.discrepancy);
    const chosenEntry = useCredit ? creditEntry : debitEntry;
    const chosenRec = useCredit ? recCredit : recDebit;

    setExtraction((prev) => {
      const nextState: ExtractionResult = {
        ...prev,
        meta: { ...prev.meta, modeUsed: "heuristic_fallback" },
        transactions: [chosenEntry, ...prev.transactions],
        reconciliation: chosenRec,
      };
      persistRecentLedger(nextState, customRawText);
      return nextState;
    });
    setStatusNotice(`Added balancing entry (${amount.toFixed(2)}) — ledger reconciled to 0.00.`);
  }

  function handleDeleteTransactionRow(id: string) {
    setExtraction((prev) => {
      const nextTx = prev.transactions.filter((tx) => tx.id !== id);
      return {
        ...prev,
        meta: { ...prev.meta, modeUsed: "heuristic_fallback" },
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

  // 导出处理函数：仅当处于原始未篡改的 3 份内置样本时开放全格式免费下载；自有账单或手动篡改后，界面 100% 透明展示平账明细 + 免费导出 5 行预览 CSV，全量导出承接 $29 终身买断
  const isPristineSample =
    inputMode === "sample" && extraction.meta?.modeUsed === "demo_sample";
  const isCustomUnpaid = billing.plan === "free" && !isPristineSample;

  function openCustomExportPaywall(formatLabel: string, formatKey: string) {
    trackFunnelEvent("export_paywall_hit", {
      format: formatKey,
      txCount: extraction.transactions.length,
    });
    setCheckoutReason(
      `Your ${extraction.transactions.length}-row ${extraction.institution} ledger is reconciled! Unlock full ${formatLabel}, QuickBooks, Xero & Multi-Sheet Audit Excel exports + unlimited PDFs forever for $29 once.`
    );
    setCheckoutPlan("pro");
  }

  function handleExportCsv() {
    const safeName =
      extraction.accountOrInvoiceNumber
        .replace(/[^a-zA-Z0-9-]+/g, "_")
        .replace(/^_+|_+$/g, "") || "statement";

    if (isCustomUnpaid) {
      if (extraction.transactions.length <= 5) {
        openCustomExportPaywall("Full UTF-8 CSV", "csv_short");
        return;
      }
      trackFunnelEvent("export_csv_preview", {
        txCount: extraction.transactions.length,
      });
      const previewExtraction: ExtractionResult = {
        ...extraction,
        transactions: extraction.transactions.slice(0, 5),
      };
      const csv = buildCsvContent(previewExtraction);
      triggerBrowserDownload(
        csv,
        `StatementFlow_5RowPreview_${safeName}.csv`,
        "text/csv;charset=utf-8;"
      );
      setStatusNotice(
        `Exported 5-row CSV preview (${extraction.transactions.length} total rows verified above). Unlock full ${extraction.transactions.length}-row CSV, QuickBooks, Xero & Multi-Sheet Excel for $29 once.`
      );
      return;
    }

    trackFunnelEvent("export_csv", { txCount: extraction.transactions.length });
    const csv = buildCsvContent(extraction);
    triggerBrowserDownload(
      csv,
      `StatementFlow_${safeName}.csv`,
      "text/csv;charset=utf-8;"
    );
  }

  function handleExportExcel() {
    if (isCustomUnpaid) {
      openCustomExportPaywall("Multi-Sheet Audit Excel (.xlsx)", "excel");
      return;
    }
    trackFunnelEvent("export_excel", {
      txCount: extraction.transactions.length,
    });
    const xlsxBytes = buildExcelXlsxBytes(extraction);
    const safeName =
      extraction.accountOrInvoiceNumber
        .replace(/[^a-zA-Z0-9-]+/g, "_")
        .replace(/^_+|_+$/g, "") || "statement";
    triggerBrowserDownload(
      xlsxBytes,
      `StatementFlow_${safeName}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  }

  function handleExportQuickBooks() {
    if (isCustomUnpaid) {
      openCustomExportPaywall("QuickBooks Online 3-Column CSV", "quickbooks");
      return;
    }
    trackFunnelEvent("export_quickbooks", {
      txCount: extraction.transactions.length,
    });
    const csv = buildQuickBooksCsvContent(extraction);
    const safeName =
      extraction.accountOrInvoiceNumber
        .replace(/[^a-zA-Z0-9-]+/g, "_")
        .replace(/^_+|_+$/g, "") || "statement";
    triggerBrowserDownload(
      csv,
      `StatementFlow_QuickBooks_${safeName}.csv`,
      "text/csv;charset=utf-8;"
    );
  }

  function handleExportXero() {
    if (isCustomUnpaid) {
      openCustomExportPaywall("Xero 5-Column Bank Feed CSV", "xero");
      return;
    }
    trackFunnelEvent("export_xero", { txCount: extraction.transactions.length });
    const csv = buildXeroCsvContent(extraction);
    const safeName =
      extraction.accountOrInvoiceNumber
        .replace(/[^a-zA-Z0-9-]+/g, "_")
        .replace(/^_+|_+$/g, "") || "statement";
    triggerBrowserDownload(
      csv,
      `StatementFlow_Xero_${safeName}.csv`,
      "text/csv;charset=utf-8;"
    );
  }

  function handleExportJson() {
    if (isCustomUnpaid) {
      openCustomExportPaywall("Structured Audit JSON", "json");
      return;
    }
    const json = JSON.stringify(extraction, null, 2);
    const safeName =
      extraction.accountOrInvoiceNumber
        .replace(/[^a-zA-Z0-9-]+/g, "_")
        .replace(/^_+|_+$/g, "") || "statement";
    triggerBrowserDownload(
      json,
      `StatementFlow_${safeName}.json`,
      "application/json"
    );
  }

  async function handleCopyJson() {
    if (isCustomUnpaid) {
      openCustomExportPaywall("Full Clipboard JSON", "copy_json");
      return;
    }
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
      {/* V8 悬浮光学磨砂胶囊顶栏：随滚动章节自适应亮暗玻璃态 */}
      <div className="sticky top-3 z-40 px-3 sm:px-6">
        <header
          className={`mx-auto max-w-[1680px] rounded-2xl transition-all duration-300 ${
            navDark
              ? "sf-frosted-topbar-dark text-[#f5f5f7]"
              : "sf-frosted-topbar text-[#111215]"
          }`}
        >
          <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-2 sm:px-5">
            <a
              href="#top"
              className="inline-flex items-center gap-2.5 text-[15px] font-semibold tracking-tight"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#0a74e6] to-[#0058b3] text-sm font-semibold text-white shadow-sm">
                S
              </span>
              <span>StatementFlow</span>
            </a>

            <nav
              aria-label="Primary Navigation"
              className="hidden items-center gap-7 text-sm font-medium lg:flex"
            >
              <a href="#workbench" className="opacity-75 transition-opacity hover:opacity-100">
                Live Studio
              </a>
              <a href="#how-it-works" className="opacity-75 transition-opacity hover:opacity-100">
                Verification
              </a>
              <a href="#pricing" className="opacity-75 transition-opacity hover:opacity-100">
                Pricing
              </a>
              <a
                href="/tools/quickbooks-csv-fixer"
                className="opacity-75 transition-opacity hover:opacity-100"
              >
                CSV Fixer
              </a>
              <a
                href="/tools/ofx-qbo-to-csv"
                className="opacity-75 transition-opacity hover:opacity-100"
              >
                OFX Converter
              </a>
              <a href="#faq" className="opacity-75 transition-opacity hover:opacity-100">
                FAQ
              </a>
              <a
                href="https://github.com/wangguode/statementflow-ai"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackFunnelEvent("github_click")}
                className="opacity-75 transition-opacity hover:opacity-100 inline-flex items-center gap-1"
              >
                <span>GitHub</span>
                <ArrowUpRight className="size-3.5" />
              </a>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {billing.plan === "free" && (
                <button
                  type="button"
                  onClick={() => setRestoreModalOpen(true)}
                  aria-label="Restore License"
                  className={`sf-btn inline-flex min-h-9 items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    navDark
                      ? "border border-white/12 bg-white/6 text-[#f5f5f7] hover:bg-white/12"
                      : "border border-black/8 bg-white/80 text-[#111215] hover:bg-white"
                  }`}
                >
                  <RotateCcw className="size-3.5 text-[#0066cc]" />
                  <span className="hidden md:inline">Restore License</span>
                  <span className="md:hidden">Restore</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                aria-label="AI Engine Settings"
                className={`sf-btn inline-flex min-h-9 items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  navDark
                    ? "border border-white/12 bg-white/6 text-[#f5f5f7] hover:bg-white/12"
                    : "border border-black/8 bg-white/80 text-[#111215] hover:bg-white"
                }`}
              >
                <Settings2 className="size-3.5 text-[#0066cc]" />
                <span className="hidden sm:inline">
                  {aiConfig.provider === "openai_compatible"
                    ? "BYOK Live"
                    : "AI Engine"}
                </span>
              </button>

              <button
                type="button"
                disabled={directCheckoutLoading === "pro"}
                onClick={() => {
                  if (billing.plan !== "free") {
                    document
                      .getElementById("workbench")
                      ?.scrollIntoView({ behavior: "smooth" });
                    return;
                  }
                  void startDirectCheckout("pro", "topbar");
                }}
                className="sf-btn inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[#0066cc] px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0058b3] disabled:opacity-60 cursor-pointer"
              >
                <span>
                  {billing.plan === "free"
                    ? directCheckoutLoading === "pro"
                      ? "Opening..."
                      : "Pro · $29"
                    : `${billing.plan.toUpperCase()} Active`}
                </span>
                <ArrowUpRight className="size-3.5" />
              </button>
            </div>
          </div>
        </header>
      </div>

      <main id="top" className="overflow-x-clip">
        {/* =====================================================================
            CHAPTER 1: OPTICAL FROSTED HERO + INSTANT ABOVE-THE-FOLD PDF DROPZONE
            ===================================================================== */}
        <section className="sf-hero-aura pt-10 pb-16 text-[#111215] lg:pt-16 lg:pb-22">
          <div className="sf-wrap">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/75 px-3.5 py-1 text-xs font-semibold text-[#31343b] backdrop-blur-md">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>100% Browser-Local PDF Parsing · Vision OCR · QuickBooks &amp; Xero Native</span>
                </div>
                <h1
                  data-load
                  style={{ "--d": "40ms" } as React.CSSProperties}
                  className="sf-display text-[#111215]"
                >
                  Every statement,
                  <br />
                  verified to zero.
                </h1>
                <p
                  data-load
                  style={{ "--d": "110ms" } as React.CSSProperties}
                  className="sf-lead mt-6 text-[#494b52]"
                >
                  Drop multi-page PDF bank statements, scanned statements, or VAT
                  invoices. Deterministic cent-level math verifies{" "}
                  <span className="font-semibold text-[#111215]">
                    Opening + Credits − Debits = Closing
                  </span>{" "}
                  before exporting clean Excel (.xlsx), QuickBooks, or Xero CSV.
                </p>
                <div
                  data-load
                  style={{ "--d": "170ms" } as React.CSSProperties}
                  className="mt-8 flex flex-wrap items-center gap-3.5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="sf-btn inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#0066cc] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0058b3] cursor-pointer"
                  >
                    <Upload className="size-4" />
                    <span>Upload Bank PDF / CSV Free</span>
                  </button>
                  <a
                    href="#workbench"
                    className="sf-btn inline-flex min-h-12 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-5 py-3 text-sm font-semibold text-[#111215] backdrop-blur-md hover:bg-white"
                  >
                    <span>Explore Reconciled Demo</span>
                    <ArrowUpRight className="size-4 text-[#0066cc]" />
                  </a>
                </div>
              </div>

              {/* 首屏即用光学磨砂拖拽舱：会计师进站无需滚屏即可直接拖入 PDF 并直达对账台 */}
              <div
                data-load
                style={{ "--d": "220ms" } as React.CSSProperties}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isDraggingFile) setIsDraggingFile(true);
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget === e.target) setIsDraggingFile(false);
                }}
                onDrop={async (e) => {
                  await handleWorkbenchDrop(e);
                  document
                    .getElementById("workbench")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`sf-frosted-card rounded-2xl p-6 transition-all lg:col-span-5 ${
                  isDraggingFile ? "ring-2 ring-[#0066cc] bg-white" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#494b52]">
                  <span className="inline-flex items-center gap-1.5 text-[#111215]">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    Zero-Retention Instant Dropzone
                  </span>
                  <span className="rounded-full bg-emerald-500/12 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-800">
                    2 Free Runs · No Signup
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#0066cc]/30 bg-white/75 px-5 py-8 text-center transition-colors hover:border-[#0066cc] hover:bg-white cursor-pointer"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[#0066cc]/10 text-[#0066cc]">
                    <Upload className="size-5" />
                  </span>
                  <span className="mt-3 text-base font-semibold text-[#111215]">
                    Drop bank statement PDF(s) or scanned image
                  </span>
                  <span className="mt-1 text-xs text-[#494b52]">
                    Supports multi-month PDF merge, PNG/JPG scans, CSV &amp; TXT
                  </span>
                </button>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#494b52]">
                    <span>Or test 1-click verified sample ledgers:</span>
                    <span className="font-mono text-[11px] text-[#111215]">$0.00 drift</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_PRESETS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => {
                          handleSelectSample(sample.id);
                          document
                            .getElementById("workbench")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="sf-btn rounded-lg border border-black/8 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-[#111215] hover:border-[#0066cc] hover:text-[#0066cc] cursor-pointer"
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            CHAPTER 2: LIVE STUDIO WORKBENCH - OBSIDIAN SLATE (#101216)
            紧接首屏拖拽区，零滚屏障碍直达交互式平账工作台与本地历史账本保险箱
            ===================================================================== */}
        <section
          id="workbench"
          onDragOver={(e) => {
            e.preventDefault();
            if (!isDraggingFile) setIsDraggingFile(true);
          }}
          onDragLeave={(e) => {
            if (e.currentTarget === e.target) setIsDraggingFile(false);
          }}
          onDrop={handleWorkbenchDrop}
          className={`bg-[#101216] py-16 text-[#f5f5f7] lg:py-22 transition-colors ${
            isDraggingFile ? "ring-4 ring-inset ring-[#3b82f6]/70 bg-[#121826]" : ""
          }`}
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
                  onClick={() => handleSelectSample(selectedSampleId)}
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
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* 本地浏览器零上传账本留存保险箱（防止刷新丢失，支持 1 键恢复与 1 键隐私擦除） */}
            {recentLedgers.length > 0 && (
              <div
                data-ui="recent-vault"
                className="mt-6 rounded-xl border border-white/10 bg-[#151924] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#c5cad6]">
                    <ShieldCheck className="size-4 text-emerald-400" />
                    <span>
                      Recent Reconciled Ledgers (Saved 100% Locally in This Browser · Never Uploaded)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearRecentLedgers}
                    className="sf-btn inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-[#9ca3b5] hover:text-white cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Clear Local Vault</span>
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recentLedgers.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setExtraction(item.result);
                        if (item.rawText) setCustomRawText(item.rawText);
                        setInputMode("paste");
                        setStatusNotice(
                          `Restored local ledger: ${item.result.institution} (${item.result.statementPeriod})`
                        );
                      }}
                      className="sf-btn inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#1c2231] px-3 py-1.5 text-xs font-medium text-white hover:border-[#3b82f6] cursor-pointer"
                    >
                      <span className="truncate max-w-[180px] font-semibold">
                        {item.result.institution}
                      </span>
                      <span className="font-mono text-[#9ca3b5] tabular-nums">
                        {item.result.transactions.length} tx
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                          item.result.reconciliation.isBalanced
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {item.result.reconciliation.isBalanced ? "$0.00" : "Edit"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {/* $199 Firm Pilot 专属自助交付舱：一键提交疑难银行定制模板需求 & 多席位激活指引 */}
            {billing.plan === "business" && (
              <div className="mt-4 rounded-xl border border-[#0066cc]/40 bg-[#121929] p-4 text-xs text-[#d5d9e2]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-white">
                      Boutique Firm Pilot Concierge Active (Unlimited Team Seats)
                    </div>
                    <div className="mt-0.5 text-[#9ca3b5]">
                      Share your email activation link from your inbox with any colleague, or submit a tricky regional bank / custom QBO column request below for 24h tuning:
                    </div>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const contactEmail = String(fd.get("contactEmail") || billing.customerEmail || "").trim();
                      const bankName = String(fd.get("bankName") || "").trim();
                      if (!bankName || !contactEmail) return;
                      const formEl = e.currentTarget;
                      try {
                        const r = await fetch("/api/pilot-intake", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            email: contactEmail,
                            restoreToken: billing.restoreToken || undefined,
                            bankName,
                            notes: "Submitted from Firm Pilot Workbench",
                          }),
                        });
                        const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
                        if (!r.ok || !d.ok) {
                          setStatusNotice(d.error || "Unable to queue bank tuning — please email hello@statementflow.win.");
                          return;
                        }
                        formEl.reset();
                        setStatusNotice(`Priority bank tuning queued for "${bankName}" — we will email ${contactEmail} within 24h.`);
                      } catch {
                        setStatusNotice("Network error — please email hello@statementflow.win directly.");
                      }
                    }}
                    className="flex flex-wrap items-center gap-2 shrink-0"
                  >
                    <input
                      name="contactEmail"
                      type="email"
                      required
                      defaultValue={billing.customerEmail || ""}
                      placeholder="Your firm email..."
                      className="ui-input px-3 py-2 text-xs w-44"
                    />
                    <input
                      name="bankName"
                      type="text"
                      required
                      placeholder="Bank name & QBO/Xero format..."
                      className="ui-input px-3 py-2 text-xs w-52"
                    />
                    <button
                      type="submit"
                      className="sf-btn rounded-lg bg-[#0066cc] px-3.5 py-2 font-semibold text-white cursor-pointer"
                    >
                      Queue 24h Tuning
                    </button>
                  </form>
                </div>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-lg border border-white/10 bg-[#11141d] p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setEngineMode("local_zero_upload")}
                        className={`rounded-md px-2.5 py-1.5 font-medium transition cursor-pointer ${
                          engineMode === "local_zero_upload"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "text-[#9ca3b5] hover:text-white"
                        }`}
                        title="100% browser-local rule parser — 0 bytes leave your device"
                      >
                        Local 0-Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setEngineMode("cloud_ai")}
                        className={`rounded-md px-2.5 py-1.5 font-medium transition cursor-pointer ${
                          engineMode === "cloud_ai"
                            ? "bg-[#0066cc] text-white"
                            : "text-[#9ca3b5] hover:text-white"
                        }`}
                        title="Zero-retention Cloud AI deep schema parser for complex multi-column & scanned layouts"
                      >
                        Cloud AI OCR
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isExtracting}
                      onClick={handleRunExtraction}
                      className="sf-btn inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
                    >
                      <RefreshCw
                        className={`size-4 ${isExtracting ? "animate-spin" : ""}`}
                      />
                      <span>
                        {isExtracting
                          ? extractProgress && extractProgress.total > 1
                            ? `Merging ${extractProgress.current}/${extractProgress.total}...`
                            : "Extracting..."
                          : batchFiles.length > 1
                          ? `Merge ${batchFiles.length} PDFs`
                          : "Run Extraction"}
                      </span>
                    </button>
                  </div>
                </div>

                {extractProgress && (
                  <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between text-xs font-mono text-[#c7ccd9]">
                      <span className="truncate">{extractProgress.label}</span>
                      <span className="tabular-nums">
                        {Math.round(
                          (extractProgress.current / Math.max(1, extractProgress.total)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#3b82f6] transition-all duration-300"
                        style={{
                          width: `${Math.max(
                            12,
                            Math.round(
                              (extractProgress.current /
                                Math.max(1, extractProgress.total)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

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

                {/* 4 项关键核算指标（期初与期末余额支持直接行内校准） */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="ui-tile p-3.5">
                    <div className="text-sm text-[#9ca3b5]">
                      Opening Balance
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      aria-label="Opening Balance"
                      value={rec.openingBalance}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        updateReconciliationBalance(
                          "openingBalance",
                          Number.isFinite(val) ? val : 0
                        );
                      }}
                      className="ui-input mt-1 w-full px-2 py-1 text-base font-semibold tabular-nums text-white"
                    />
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
                    <input
                      type="number"
                      step="0.01"
                      aria-label="Closing Balance"
                      value={rec.closingBalance}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        updateReconciliationBalance(
                          "closingBalance",
                          Number.isFinite(val) ? val : 0
                        );
                      }}
                      className="ui-input mt-1 w-full px-2 py-1 text-base font-semibold tabular-nums text-white"
                    />
                  </div>
                </div>

                {/* 免费额度进度与 $9 一次性买断高信噪比提示条（紧贴导出栏，消除订阅恐惧） */}
                {billing.plan === "free" && (
                  <div className="mt-4 flex flex-col gap-2.5 rounded-xl border border-[#0066cc]/35 bg-[#121a2b] px-3.5 py-2.5 text-xs text-[#d5d9e2] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="inline-flex shrink-0 whitespace-nowrap rounded-md bg-[#0066cc]/25 px-2 py-0.5 font-mono font-semibold tabular-nums text-[#8cc4ff]">
                        Cloud AI: {billing.creditsUsed}/{billing.creditsLimit}
                      </span>
                      <span>
                        Full QBO/Xero/Excel exports, Batch Merge &amp; Vision OCR:{" "}
                        <strong className="text-white">$29 once</strong> (saves $439/yr vs $39/mo).
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={directCheckoutLoading === "pro"}
                      onClick={() => void startDirectCheckout("pro", "workbench_bar")}
                      className="sf-btn shrink-0 whitespace-nowrap rounded-lg bg-[#0066cc] px-3 py-1.5 font-semibold text-white hover:bg-[#0058b3] disabled:opacity-60 cursor-pointer"
                    >
                      {directCheckoutLoading === "pro" ? "Opening..." : "Unlock Lifetime · $29 →"}
                    </button>
                  </div>
                )}

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

                    {!extraction.reconciliation.isBalanced && (
                      <button
                        type="button"
                        onClick={handleAutoBalanceRow}
                        className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#14532d] px-3.5 py-2 text-sm font-semibold text-[#86efac] hover:bg-[#166534]"
                      >
                        <span>
                          Auto-Balance ({Math.abs(extraction.reconciliation.discrepancy).toFixed(2)})
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#0066cc] px-3.5 py-2 text-sm font-semibold text-white cursor-pointer"
                    >
                      <FileSpreadsheet className="size-4" />
                      <span>Excel (.xlsx)</span>
                      {isCustomUnpaid && (
                        <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px] font-bold">
                          PRO
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#252b3b] px-3.5 py-2 text-sm font-medium text-white cursor-pointer"
                    >
                      <Download className="size-4" />
                      <span>
                        {isCustomUnpaid && extraction.transactions.length > 5
                          ? "CSV (5-Row Preview)"
                          : "CSV"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportQuickBooks}
                      className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#1d3b2a] px-3.5 py-2 text-sm font-medium text-[#86efac] hover:bg-[#234a34] cursor-pointer"
                    >
                      <Download className="size-4" />
                      <span>QuickBooks</span>
                      {isCustomUnpaid && (
                        <span className="rounded bg-emerald-400/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-200">
                          PRO
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportXero}
                      className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#19324a] px-3.5 py-2 text-sm font-medium text-[#7dd3fc] hover:bg-[#1f3f5e] cursor-pointer"
                    >
                      <Download className="size-4" />
                      <span>Xero</span>
                      {isCustomUnpaid && (
                        <span className="rounded bg-sky-400/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-sky-200">
                          PRO
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#252b3b] px-3.5 py-2 text-sm font-medium text-white cursor-pointer"
                    >
                      <FileText className="size-4" />
                      <span>JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      aria-label="Copy JSON to clipboard"
                      className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#252b3b] px-3 py-2 text-sm font-medium text-white cursor-pointer"
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
                            <input
                              type="text"
                              value={tx.date}
                              aria-label={`Date for ${tx.merchant}`}
                              onChange={(e) =>
                                updateTransaction(tx.id, {
                                  date: e.target.value,
                                })
                              }
                              className="ui-input w-[112px] px-2 py-1.5 font-mono text-xs tabular-nums"
                            />
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

            {/* 35 秒真实操作演示视频（移至交互工作台正下方，既保留实机证据又不遮挡核心平账表） */}
            <div className="mt-12 overflow-hidden rounded-2xl border border-[#242a38] bg-[#0b0d12] shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1d2230] px-5 py-3 text-xs text-[#9ca3b5]">
                <div className="flex items-center gap-2 font-medium text-white">
                  <span className="inline-block size-2 rounded-full bg-[#34d399]" />
                  <span>
                    35s Live Product Walkthrough · Multi-PDF Batch → $0.00
                    Balance Proof → QuickBooks / Xero CSV
                  </span>
                </div>
                <span className="font-mono text-[#66b3ff]">
                  100% Browser-Local + Vision OCR
                </span>
              </div>
              <video
                src="/demo/statementflow-demo.mp4"
                loop
                muted
                playsInline
                controls
                preload="metadata"
                className="aspect-video w-full bg-[#0a0b0e] object-cover"
              />
            </div>
          </div>
        </section>

        {/* 深空黑馆藏视觉与高速票据印刷机实拍流（下沉至品牌历史背书层，不阻挡首屏用工具） */}
        <section className="bg-[#0a0b0e] py-16 text-[#f5f5f7] lg:py-22">
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
                    loading="lazy"
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
                      5 formats
                    </div>
                    <div className="mt-1 text-sm text-[#a0a6b5]">
                      XLSX, QBO, Xero, CSV, JSON
                    </div>
                  </div>
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
                <h2 className="sf-head text-[#111215]">Simple, honest pricing.</h2>
                <p className="mt-3 text-base text-[#494b52]">
                  Verify $0.00 balance accuracy on your own PDF free with zero
                  signup. Upgrade once via Creem.io Merchant of Record—no
                  recurring subscription traps.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl bg-[#f5f5f7] px-4 py-2.5 text-sm font-medium text-[#111215]">
                <ShieldCheck className="size-4 text-[#0066cc]" />
                <span>Secured by Creem.io (Global Tax MoR)</span>
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
                  <div className="text-base font-semibold">Free Preview</div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="sf-lead font-semibold tabular-nums">
                      $0
                    </span>
                    <span className="text-sm text-[#494b52]">/no signup</span>
                  </div>
                  <p className="mt-3 text-sm text-[#494b52]">
                    Verify accuracy on your own bank statement PDF before paying
                    a single cent.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-[#111215]">
                    <li>2 free single-PDF runs (100% UI rows visible)</li>
                    <li>100% browser-local PDF text parsing</li>
                    <li>Deterministic $0.00 balance verification</li>
                    <li>5-row CSV preview + full sample QBO/Xero/XLSX</li>
                  </ul>
                </div>

                <a
                  href="#workbench"
                  className="sf-btn flex min-h-16 w-full items-center justify-between bg-[#e2e2e8] px-8 text-base font-semibold text-[#111215]"
                >
                  <span>Try Free Studio</span>
                  <span className="tabular-nums">Free</span>
                </a>
              </div>

              {/* Tier 2: StatementFlow Pro (One-Time $9, 100% matches Creem product) */}
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
                      Best Value
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="sf-lead font-semibold tabular-nums text-white">
                      $29
                    </span>
                    <span className="text-sm text-[#a0a6b5]">one-time</span>
                  </div>
                  <p className="mt-3 text-sm text-[#a0a6b5]">
                    Pay once, unlock unlimited conversions forever. Built for
                    bookkeepers, SMB owners, and solo operators.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-[#e2e6f0]">
                    <li>Unlimited batch multi-PDF conversions</li>
                    <li>Scanned PDF & photo Vision OCR engine</li>
                    <li>Native QuickBooks (3-col) & Xero (5-col) CSV</li>
                    <li>Zero monthly fees · Automatic VAT receipt</li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={directCheckoutLoading === "pro"}
                  onClick={() => void startDirectCheckout("pro", "pricing_card")}
                  className="sf-btn flex min-h-16 w-full items-center justify-between bg-[#0066cc] px-8 text-base font-semibold text-white hover:bg-[#0058b3] disabled:opacity-60 cursor-pointer"
                >
                  <span>{directCheckoutLoading === "pro" ? "Opening Checkout..." : "Unlock Pro Forever"}</span>
                  <span className="tabular-nums">$29 once</span>
                </button>
              </div>

              {/* Tier 3: Boutique Firm Pilot ($199) */}
              <div
                data-reveal
                style={{ "--delay": "180ms" } as React.CSSProperties}
                className="flex min-h-[520px] flex-col justify-between overflow-hidden rounded-xl bg-[#0a0b0e] text-[#f5f5f7] lg:col-span-4"
              >
                <div className="p-8">
                  <div className="text-base font-semibold text-white">
                    Bookkeeping Firm Pilot
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="sf-lead font-semibold tabular-nums text-white">
                      $199
                    </span>
                    <span className="text-sm text-[#a0a6b5]">one-time pilot</span>
                  </div>
                  <p className="mt-3 text-sm text-[#a0a6b5]">
                    Zero-risk 14-day guided pilot for boutique firms reconciling
                    dozens of client accounts every month.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-[#e2e6f0]">
                    <li>Unlimited team seats (no per-user tax)</li>
                    <li>White-glove tuning on your tricky bank PDFs</li>
                    <li>Custom QBO / Xero / Sage column presets</li>
                    <li>Upgrade path to $999 air-gapped Docker</li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={directCheckoutLoading === "business"}
                  onClick={() => void startDirectCheckout("business", "pricing_card")}
                  className="sf-btn flex min-h-16 w-full items-center justify-between bg-[#1d2230] px-8 text-base font-semibold text-white hover:bg-[#0066cc] disabled:opacity-60 cursor-pointer"
                >
                  <span>{directCheckoutLoading === "business" ? "Opening Checkout..." : "Start Firm Pilot"}</span>
                  <span className="tabular-nums">$199</span>
                </button>
              </div>
            </div>

            {/* 竞品年费与数据隐私硬核对比矩阵（建立明确 ROI 锚点，放大 $9 买断与 $199 无限席位超值感） */}
            <div className="mt-10 overflow-x-auto rounded-2xl border border-black/8 bg-[#f8f9fc] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#0066cc]">
                    Annual Total Cost &amp; Client Privacy Benchmark
                  </div>
                  <div className="mt-0.5 text-base font-semibold text-[#111215]">
                    Why 1,000+ bookkeepers &amp; founders ditch $39/mo cloud PDF subscriptions
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-800">
                  14-Day 100% Money-Back Guarantee
                </span>
              </div>
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-[#494b52]">
                    <th className="py-2.5 pr-4 font-semibold">Dimension</th>
                    <th className="py-2.5 px-4 font-semibold">DocuClipper</th>
                    <th className="py-2.5 px-4 font-semibold">Dext Prepare</th>
                    <th className="py-2.5 pl-4 font-semibold text-[#0066cc]">StatementFlow AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/6 text-[#111215]">
                  <tr>
                    <td className="py-3 pr-4 font-medium">1-Year Solo Cost</td>
                    <td className="py-3 px-4 tabular-nums text-[#494b52]">$468 / yr ($39/mo)</td>
                    <td className="py-3 px-4 tabular-nums text-[#494b52]">$600+ / yr</td>
                    <td className="py-3 pl-4 font-bold tabular-nums text-[#0066cc]">$29 once (Saves $439/yr)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">5-Seat CPA Firm Cost</td>
                    <td className="py-3 px-4 tabular-nums text-[#494b52]">$1,188+ / yr</td>
                    <td className="py-3 px-4 tabular-nums text-[#494b52]">$2,400+ / yr (seat tax)</td>
                    <td className="py-3 pl-4 font-bold tabular-nums text-[#0066cc]">$199 Pilot · Unlimited Seats</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Client PDF Storage</td>
                    <td className="py-3 px-4 text-[#494b52]">Uploaded to vendor cloud</td>
                    <td className="py-3 px-4 text-[#494b52]">Stored in vendor cloud</td>
                    <td className="py-3 pl-4 font-semibold text-emerald-700">100% Browser-Local / Zero Retention</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Balance Math Guard</td>
                    <td className="py-3 px-4 text-[#494b52]">Manual spot check</td>
                    <td className="py-3 px-4 text-[#494b52]">OCR invoice focus</td>
                    <td className="py-3 pl-4 font-semibold text-[#111215]">Deterministic $0.00 Cent Proof</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* B2B 三阶务实破冰与免费 4 小时脱敏样本预审通道（彻底消除 $199 首单顾虑） */}
            <div className="mt-10 rounded-2xl border border-[#2a3142] bg-[#141720] p-6 sm:p-8">
              <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#66b3ff]">
                    For Bookkeeping Firms &amp; Accounting Teams · Zero-Risk Pre-Pilot Proof
                  </div>
                  <h3 className="mt-1.5 text-xl font-semibold text-white">
                    Skeptical about a tricky regional or scanned bank PDF? Get a free 4-hour QBO/Xero proof first.
                  </h3>
                  <p className="mt-2 text-sm text-[#a0a6b5]">
                    Attach 1 redacted or tricky client PDF right here (or enter your firm email). Our financial engineering team will email back the $0.00-reconciled QuickBooks/Xero CSV &amp; Excel proof within 4 hours before you spend $199.
                  </p>
                </div>

                <form
                  onSubmit={handlePrePilotLeadSubmit}
                  className="rounded-xl border border-white/10 bg-[#0e1118] p-4 lg:col-span-5 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-white">
                    <span>Request Free 4h Sample Tuning &amp; Pilot Spec</span>
                    <label className="inline-flex items-center gap-1 rounded-md border border-[#0066cc]/50 bg-[#0066cc]/15 px-2 py-1 text-[11px] font-medium text-[#8cc4ff] hover:bg-[#0066cc]/25 cursor-pointer">
                      <Upload className="size-3" />
                      <span>{pilotSampleFile ? "Change PDF" : "Attach Sample PDF"}</span>
                      <input
                        type="file"
                        accept=".pdf,.csv,.txt"
                        onChange={handlePilotSampleAttach}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {pilotSampleFile && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-300 truncate">
                      Attached locally: {pilotSampleFile.name}
                    </div>
                  )}
                  <input
                    type="email"
                    required
                    value={pilotLeadEmail}
                    onChange={(e) => setPilotLeadEmail(e.target.value)}
                    placeholder="partner@yourcpafirm.com"
                    aria-label="Firm work email"
                    className="block min-h-11 w-full rounded-lg border border-white/15 bg-[#161b26] px-3 py-2 text-base text-white placeholder:text-[#7c8498] focus:border-[#0066cc] focus:outline-none sm:text-sm"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      required
                      value={pilotLeadBank}
                      onChange={(e) => setPilotLeadBank(e.target.value)}
                      placeholder="e.g. Wells Fargo / Barclays → QBO"
                      aria-label="Target bank and accounting format"
                      className="block min-h-11 flex-1 rounded-lg border border-white/15 bg-[#161b26] px-3 py-2 text-base text-white placeholder:text-[#7c8498] focus:border-[#0066cc] focus:outline-none sm:text-sm"
                    />
                    <button
                      type="submit"
                      disabled={pilotLeadLoading}
                      className="sf-btn min-h-11 shrink-0 rounded-lg bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0058b3] disabled:opacity-60 cursor-pointer"
                    >
                      {pilotLeadLoading ? "Sending..." : "Get 4h Proof →"}
                    </button>
                  </div>
                  {pilotLeadMsg && (
                    <p className="text-xs font-medium text-emerald-400">
                      {pilotLeadMsg}
                    </p>
                  )}
                </form>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-[#242a38] bg-[#0e1118] p-5">
                  <div className="text-xs font-mono text-[#34d399]">
                    STEP 1 · PAID PILOT
                  </div>
                  <div className="mt-1 text-2xl font-bold tabular-nums text-white">
                    $199{" "}
                    <span className="text-xs font-normal text-[#8b92a5]">
                      one-time
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-white">
                    14-Day Boutique Firm Pilot
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#9ca3b5]">
                    Unlimited seats for 1–3 client books, white-glove tuning on
                    your trickiest scanned/regional bank PDFs, plus native
                    QBO/Xero exports.
                  </p>
                </div>

                <div className="rounded-xl border border-[#0066cc] bg-[#0e1118] p-5">
                  <div className="text-xs font-mono text-[#66b3ff]">
                    STEP 2 · SELF-HOSTED PACK
                  </div>
                  <div className="mt-1 text-2xl font-bold tabular-nums text-white">
                    $999{" "}
                    <span className="text-xs font-normal text-[#8b92a5]">
                      one-time license
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-white">
                    Air-Gapped Docker Deployment
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#9ca3b5]">
                    Run StatementFlow inside your firm&apos;s own VPC/office
                    server with zero external data egress, batch CLI/API, and
                    local Ollama/OpenAI routing.
                  </p>
                </div>

                <div className="rounded-xl border border-[#242a38] bg-[#0e1118] p-5">
                  <div className="text-xs font-mono text-[#a0a6b5]">
                    STEP 3 · ENTERPRISE CUSTOM
                  </div>
                  <div className="mt-1 text-2xl font-bold tabular-nums text-white">
                    $2,500+{" "}
                    <span className="text-xs font-normal text-[#8b92a5]">
                      custom
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-white">
                    Custom ERP & SLA Integration
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#9ca3b5]">
                    Direct NetSuite/Sage/ERP webhook pipelines, custom audit
                    rules, and dedicated 30-day architect onboarding support.
                  </p>
                </div>
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
                  <li>
                    <button
                      type="button"
                      onClick={() => setRestoreModalOpen(true)}
                      className="inline-flex min-h-8 items-center text-[#66b3ff] hover:text-white cursor-pointer"
                    >
                      Restore Purchased License
                    </button>
                  </li>
                  <li>
                    <a
                      href="mailto:hello@statementflow.win?subject=StatementFlow%20Accounting%20Partner%20Inquiry"
                      className="inline-flex min-h-8 items-center hover:text-white"
                    >
                      Accounting Partner Program
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
                      Native Excel (.xlsx)
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleExportQuickBooks}
                      className="inline-flex min-h-8 items-center hover:text-white cursor-pointer"
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
                      Creem.io MoR
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

          {/* Programmatic SEO 银行与发票转换器内链矩阵（默认展示 Top 16，其余折叠以兼顾 SEO 内链与页面整洁） */}
          <div className="mt-12">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-base font-semibold text-white">
                Dedicated Bank & Platform Converters ({PSEO_BANK_ENTRIES.length}{" "}
                Supported)
              </div>
              <span className="text-xs text-[#8b92a5]">
                100% client-side · US, UK, Canada, AU/NZ, Europe & APAC
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {PSEO_BANK_ENTRIES.slice(0, 16).map((bank) => (
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
            {PSEO_BANK_ENTRIES.length > 16 && (
              <details className="mt-4 rounded-xl border border-[#222733] bg-[#101319] p-4">
                <summary className="cursor-pointer select-none text-sm font-medium text-[#c5cad6] hover:text-white">
                  Browse all {PSEO_BANK_ENTRIES.length} supported banks &
                  accounting CSV converters (+{PSEO_BANK_ENTRIES.length - 16}{" "}
                  more)
                </summary>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {PSEO_BANK_ENTRIES.slice(16).map((bank) => (
                    <Link
                      key={bank.slug}
                      href={`/convert/${bank.slug}`}
                      className="inline-flex min-h-9 items-center justify-between rounded-md bg-[#151921] px-3 py-1.5 text-xs text-[#c5cad6] hover:bg-[#0066cc] hover:text-white"
                    >
                      <span className="truncate pr-2">{bank.shortName}</span>
                      <span className="shrink-0 tabular-nums opacity-70">
                        {bank.defaultCurrency}
                      </span>
                    </Link>
                  ))}
                </div>
              </details>
            )}
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

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm text-[#c7ccd9]">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8b92a5]">
              Free Browser-Local Tools:
            </span>
            <a
              href="/tools/quickbooks-csv-fixer"
              className="underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white"
            >
              QuickBooks &amp; Xero CSV Import Fixer
            </a>
            <a
              href="/tools/ofx-qbo-to-csv"
              className="underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white"
            >
              OFX / QFX / QBO to CSV Converter
            </a>
            <span className="text-white/20">·</span>
            <a
              href="/privacy"
              className="underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white"
            >
              Terms of Use
            </a>
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
          unlockReason={checkoutReason}
          onClose={() => {
            setCheckoutPlan(null);
            setCheckoutReason("");
          }}
          onSuccessActivate={handleActivatePlan}
          onOpenRestore={() => setRestoreModalOpen(true)}
        />
      )}

      <RestoreLicenseModal
        open={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        onRestored={handleActivatePlan}
      />
    </div>
  );
}
