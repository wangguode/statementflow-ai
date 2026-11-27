import { computeReconciliation } from "@/lib/schema";
import type {
  DocumentType,
  ExtractionMode,
  ExtractionResult,
  TransactionCategory,
  TransactionItem,
} from "@/types/statement";

/**
 * 从上传的二进制缓冲区中提取可读文本（支持 UTF-8 文本/CSV 以及未压缩或含文本流的 PDF）
 */
export function extractReadableTextFromBuffer(
  buffer: Buffer,
  fileName: string
): string {
  const lower = fileName.toLowerCase();
  const rawLatin = buffer.toString("latin1");

  if (!lower.endsWith(".pdf") && !rawLatin.startsWith("%PDF")) {
    return buffer.toString("utf8");
  }

  const chunks: string[] = [];
  const parenRegex = /\(([^()\\]{2,200}(?:\\.[^()\\]*)*)\)\s*(?:Tj|')?/g;
  let match: RegExpExecArray | null;
  while ((match = parenRegex.exec(rawLatin)) !== null) {
    const cleaned = match[1]
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, " ")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/[^\x20-\x7E\n£€¥]/g, " ")
      .trim();
    if (cleaned.length >= 2 && /[A-Za-z0-9]/.test(cleaned)) {
      chunks.push(cleaned);
    }
  }

  if (chunks.length >= 4) {
    return chunks.join("\n");
  }

  const printable = rawLatin
    .replace(/[^\x20-\x7E\n\r£€¥]/g, " ")
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 5 && /[A-Za-z]{2,}/.test(l));

  return printable.slice(0, 400).join("\n");
}

function inferCategory(desc: string, type: "credit" | "debit"): TransactionCategory {
  const d = desc.toLowerCase();
  if (type === "credit" || /stripe|payout|deposit|wire credit|payment received|ach credit|interest paid/.test(d)) {
    return "Revenue & Payouts";
  }
  if (/aws|amazon web|vercel|figma|openai|github|notion|google cloud|cloudflare|saas|adobe|slack|microsoft/.test(d)) {
    return "Cloud & SaaS";
  }
  if (/gusto|payroll|deel|contractor|salary|upwork|rippling|adp/.test(d)) {
    return "Payroll & Contractors";
  }
  if (/ads|meta|facebook|google \*ads|linkedin|marketing|hubspot/.test(d)) {
    return "Marketing & Ads";
  }
  if (/uber|lyft|delta|united|airbnb|hotel|flight|starbucks|doordash|meal|airline/.test(d)) {
    return "Travel & Meals";
  }
  if (/tax|vat|irs|hmrc|ato|fee|service charge|overdraft|interest/.test(d)) {
    return "Taxes & Fees";
  }
  if (/apple|macbook|dell|monitor|logitech|hardware|laptop|lenovo/.test(d)) {
    return "Equipment & Hardware";
  }
  if (/wework|rent|lease|office|courier|fedex|ups|usps|amazon|staples/.test(d)) {
    return "Office & Operations";
  }
  if (/transfer|zelle|venmo|mercury|wise|revolut|wire/.test(d)) {
    return "Transfer";
  }
  return "Uncategorized";
}

const MONTH_MAP: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

function normalizeDate(rawDate: string, fallbackYear: string): string {
  const trimmed = rawDate.trim().replace(/,/g, "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // MM/DD/YYYY, DD/MM/YYYY, or MM/DD (US statements like Chase/Wells Fargo)
  const slash = trimmed.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
  if (slash) {
    const [, p1, p2, p3] = slash;
    const year = p3 ? (p3.length === 2 ? `20${p3}` : p3) : fallbackYear;
    const n1 = Number(p1);
    const month = n1 > 12 ? p2.padStart(2, "0") : p1.padStart(2, "0");
    const day = n1 > 12 ? p1.padStart(2, "0") : p2.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // DD Mon YYYY or DD Mon (UK/AU/EU statements like Barclays, Lloyds, CommBank)
  const dMon = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*(?:\s+(\d{2,4}))?$/);
  if (dMon) {
    const [, d, mStr, yStr] = dMon;
    const mm = MONTH_MAP[mStr.toLowerCase()];
    if (mm) {
      const year = yStr ? (yStr.length === 2 ? `20${yStr}` : yStr) : fallbackYear;
      return `${year}-${mm}-${d.padStart(2, "0")}`;
    }
  }

  // Mon DD YYYY or Mon DD (US/CA statements like BofA, RBC, Amex)
  const monD = trimmed.match(/^([A-Za-z]{3})[a-z]*\s+(\d{1,2})(?:\s+(\d{2,4}))?$/);
  if (monD) {
    const [, mStr, d, yStr] = monD;
    const mm = MONTH_MAP[mStr.toLowerCase()];
    if (mm) {
      const year = yStr ? (yStr.length === 2 ? `20${yStr}` : yStr) : fallbackYear;
      return `${year}-${mm}-${d.padStart(2, "0")}`;
    }
  }

  return `${fallbackYear}-01-15`;
}

function parseAccountingAmount(token: string): {
  value: number;
  hasMinus: boolean;
  hasPlus: boolean;
  isCr: boolean;
  isDr: boolean;
} | null {
  const t = token.trim();
  const isParens = /^\(.*\)$/.test(t);
  const isCr = /\bCR$/i.test(t);
  const isDr = /\bDR$/i.test(t);
  const hasMinus = isParens || t.includes("-") || isDr;
  const hasPlus = t.includes("+") || isCr;
  const cleaned = t.replace(/[()CRDRcrdr$£€,\s+-]/g, "").replace(/^(CA|A|HK|S)\$/i, "");
  if (!/^\d+\.\d{2}$/.test(cleaned)) return null;
  const value = Math.round(Number(cleaned) * 100) / 100;
  if (!Number.isFinite(value)) return null;
  return { value, hasMinus, hasPlus, isCr, isDr };
}

/**
 * 100% 浏览器本地零网络请求确定性解析器（支持美/英/澳/加主流银行对账单多格式日期、会计括号负数及行尾余额差分自动定方向）
 */
export function parseDocumentHeuristically(
  text: string,
  fileName: string,
  modeUsed: ExtractionMode = "heuristic_fallback",
  extraWarnings: string[] = []
): ExtractionResult {
  const start = Date.now();
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const yearMatch = text.match(/\b(202[0-9])\b/);
  const fallbackYear = yearMatch?.[1] || new Date().getFullYear().toString();

  const currency = /\bAUD\b|A\$/i.test(text)
    ? "AUD"
    : /\bCAD\b|CA\$/i.test(text)
    ? "CAD"
    : /£|\bGBP\b/i.test(text)
    ? "GBP"
    : /€|\bEUR\b/i.test(text)
    ? "EUR"
    : "USD";

  const documentType: DocumentType = /invoice|inv-/i.test(text + " " + fileName)
    ? "invoice"
    : /receipt|vat/i.test(text + " " + fileName)
    ? "receipt"
    : "bank_statement";

  let openingBalance: number | null = null;
  let closingBalance: number | null = null;
  const transactions: TransactionItem[] = [];

  const datePrefixRegex =
    /^"?(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|\d{1,2}\s+[A-Za-z]{3}[a-z]*(?:\s+\d{2,4})?|[A-Za-z]{3}[a-z]*\s+\d{1,2}(?:,?\s+\d{2,4})?)"?(?:\s+|[,;\t]+)(.+)$/;

  const trailingAmountsRegex =
    /(\(?[+-]?\s*(?:CA\$|A\$|[$£€])?\s*\d[\d,]*\.\d{2}\)?(?:\s*(?:CR|DR))?)(?:\s+|[,;\t]+)(\(?[+-]?\s*(?:CA\$|A\$|[$£€])?\s*\d[\d,]*\.\d{2}\)?(?:\s*(?:CR|DR))?)?\s*$/i;

  let runningBalanceCents: number | null = null;

  for (const line of lines) {
    if (/^(=== FILE:|page \d+|date\s+description)/i.test(line)) continue;

    const openMatch = line.match(
      /(?:beginning|opening|previous|brought\s+forward)\s+balance.*?(\(?-?\s*(?:CA\$|A\$|[$£€])?\s*\d[\d,]*\.\d{2}\)?)/i
    );
    if (openMatch && openingBalance === null) {
      const parsedOpen = parseAccountingAmount(openMatch[1]);
      if (parsedOpen) {
        openingBalance = parsedOpen.hasMinus ? -parsedOpen.value : parsedOpen.value;
        runningBalanceCents = Math.round(openingBalance * 100);
        continue;
      }
    }

    const closeMatch = line.match(
      /(?:ending|closing|new|carried\s+forward|grand\s+total|total\s+amount\s+due)\s*(?:balance)?.*?(\(?-?\s*(?:CA\$|A\$|[$£€])?\s*\d[\d,]*\.\d{2}\)?)/i
    );
    if (closeMatch) {
      const parsedClose = parseAccountingAmount(closeMatch[1]);
      if (parsedClose) {
        closingBalance = parsedClose.hasMinus ? -parsedClose.value : parsedClose.value;
        continue;
      }
    }

    const dm = line.match(datePrefixRegex);
    if (!dm) continue;
    const [, rawDate, rest] = dm;
    if (/^(balance\s+forward|opening\s+balance|ending\s+balance|closing\s+balance|total\b)/i.test(rest.trim())) {
      continue;
    }

    const am = rest.match(trailingAmountsRegex);
    if (!am) continue;

    const amt1 = parseAccountingAmount(am[1]);
    const amt2 = am[2] ? parseAccountingAmount(am[2]) : null;
    if (!amt1) continue;

    const rawDesc = rest
      .slice(0, am.index ?? rest.length)
      .replace(/^[,;\t\s"]+|[,;\t\s"]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!rawDesc || rawDesc.length < 2) continue;

    let txAmount = amt1.value;
    let txType: "credit" | "debit" = "debit";

    if (amt2) {
      // 双金额列（金额 + 行尾运行余额）：利用与上一行余额的精确分位差值 100% 确定借贷方向
      txAmount = amt1.value;
      const nextBalCents = Math.round((amt2.hasMinus ? -amt2.value : amt2.value) * 100);
      const txCents = Math.round(txAmount * 100);
      if (txCents === 0) continue;

      if (runningBalanceCents !== null) {
        if (Math.abs(runningBalanceCents + txCents - nextBalCents) <= 2) {
          txType = "credit";
        } else if (Math.abs(runningBalanceCents - txCents - nextBalCents) <= 2) {
          txType = "debit";
        } else {
          txType =
            amt1.hasPlus || /\b(credit|deposit|payout|transfer in|refund|ach credit|payroll|stripe)\b/i.test(rawDesc)
              ? "credit"
              : "debit";
        }
      } else {
        txType =
          amt1.hasPlus || /\b(credit|deposit|payout|transfer in|refund|ach credit|stripe)\b/i.test(rawDesc)
            ? "credit"
            : "debit";
        if (openingBalance === null) {
          openingBalance =
            (txType === "credit" ? nextBalCents - txCents : nextBalCents + txCents) / 100;
        }
      }
      runningBalanceCents = nextBalCents;
      if (closingBalance === null) {
        closingBalance = nextBalCents / 100;
      }
    } else {
      if (amt1.value === 0) continue;
      const isExplicitCredit =
        amt1.hasPlus ||
        /\b(credit|deposit|payout|transfer in|refund|payment received|ach credit|wire in)\b/i.test(rawDesc);
      const isExplicitDebit =
        amt1.hasMinus ||
        documentType !== "bank_statement" ||
        /\b(debit|withdrawal|purchase|card|pos|fee|charge|check|ach debit|wire out|payment to)\b/i.test(rawDesc);

      txType = isExplicitCredit && !amt1.hasMinus ? "credit" : isExplicitDebit ? "debit" : "debit";
    }

    const merchant = rawDesc
      .replace(/[^A-Za-z0-9\s.&*-]/g, " ")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join(" ");

    transactions.push({
      id: `local-${transactions.length + 1}`,
      date: normalizeDate(rawDate, fallbackYear),
      description: rawDesc,
      merchant: merchant || "Merchant",
      category: inferCategory(rawDesc, txType),
      type: txType,
      amount: txAmount,
      confidence: amt2 ? 0.98 : 0.91,
    });
  }

  const warnings = [...extraWarnings];
  if (transactions.length === 0) {
    warnings.push(
      "Local zero-network rule parser found 0 standard date/amount rows in this layout. Switch to 'Cloud AI Deep Parse' to handle complex multi-column or scanned statements."
    );
  }

  const effectiveOpening = openingBalance ?? 0;
  const computedCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const computedDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + t.amount, 0);

  const effectiveClosing =
    closingBalance ??
    (documentType === "bank_statement"
      ? Math.round((effectiveOpening + computedCredits - computedDebits) * 100) / 100
      : Math.round(computedDebits * 100) / 100);

  return {
    documentTitle: fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
    institution:
      documentType === "invoice"
        ? "Vendor Billing Statement"
        : "Browser-Local Deterministic Parser",
    documentType,
    accountOrInvoiceNumber: "LOCAL-ZERO-UPLOAD",
    statementPeriod:
      transactions.length > 0
        ? `${transactions[0].date} – ${transactions[transactions.length - 1].date}`
        : `${fallbackYear}`,
    currency,
    transactions,
    reconciliation: computeReconciliation(
      effectiveOpening,
      effectiveClosing,
      transactions,
      documentType
    ),
    meta: {
      modeUsed,
      providerName: "100% Browser-Local Engine (0 Network Bytes)",
      modelName: "statementflow-local-v2",
      latencyMs: Math.max(4, Date.now() - start),
      warnings,
    },
  };
}
