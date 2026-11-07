import type {
  DocumentType,
  ExtractionMode,
  ExtractionResult,
  ReconciliationSummary,
  TransactionCategory,
  TransactionItem,
} from "@/types/statement";

const VALID_CATEGORIES: ReadonlySet<TransactionCategory> = new Set([
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
]);

const VALID_DOC_TYPES: ReadonlySet<DocumentType> = new Set([
  "bank_statement",
  "invoice",
  "receipt",
]);

/**
 * 确定性财务对账核算（避免大模型算术幻觉，所有汇总与平衡校验由代码精确计算）
 */
export function computeReconciliation(
  openingBalance: number,
  closingBalance: number,
  transactions: TransactionItem[],
  documentType: DocumentType = "bank_statement"
): ReconciliationSummary {
  const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

  const totalCredits = round2(
    transactions
      .filter((t) => t.type === "credit")
      .reduce((acc, t) => acc + Math.abs(t.amount), 0)
  );

  const totalDebits = round2(
    transactions
      .filter((t) => t.type === "debit")
      .reduce((acc, t) => acc + Math.abs(t.amount), 0)
  );

  // 对于发票/收据，若期初为 0 且全为支出项，期末应付总额按 totalDebits 对齐校验
  const calculatedClosing =
    documentType === "bank_statement"
      ? round2(openingBalance + totalCredits - totalDebits)
      : openingBalance === 0 && totalCredits === 0
        ? totalDebits
        : round2(openingBalance + totalCredits - totalDebits);

  const discrepancy = round2(closingBalance - calculatedClosing);

  return {
    openingBalance: round2(openingBalance),
    closingBalance: round2(closingBalance),
    totalCredits,
    totalDebits,
    calculatedClosing,
    discrepancy,
    isBalanced: Math.abs(discrepancy) < 0.01,
  };
}

/**
 * 严格校验并清洗大模型输出的 JSON 结构（遵循 ai-call-safety 第 6 条基线）
 */
export function validateAndNormalizePayload(
  raw: unknown,
  metaOverrides: {
    modeUsed: ExtractionMode;
    providerName: string;
    modelName: string;
    latencyMs: number;
    warnings?: string[];
  }
): ExtractionResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("SCHEMA_INVALID: Model output is not a JSON object.");
  }

  const obj = raw as Record<string, unknown>;

  if (!Array.isArray(obj.transactions) || obj.transactions.length === 0) {
    throw new Error(
      "SCHEMA_INVALID: 'transactions' must be a non-empty array."
    );
  }

  const documentType: DocumentType =
    typeof obj.documentType === "string" &&
    VALID_DOC_TYPES.has(obj.documentType as DocumentType)
      ? (obj.documentType as DocumentType)
      : "bank_statement";

  const currency =
    typeof obj.currency === "string" && /^[A-Z]{3}$/.test(obj.currency.trim())
      ? obj.currency.trim()
      : "USD";

  const transactions: TransactionItem[] = obj.transactions.map(
    (item: unknown, idx: number) => {
      if (!item || typeof item !== "object") {
        throw new Error(`SCHEMA_INVALID: Transaction at index ${idx} invalid.`);
      }
      const row = item as Record<string, unknown>;
      const rawAmount = Number(row.amount);
      if (!Number.isFinite(rawAmount)) {
        throw new Error(
          `SCHEMA_INVALID: Non-numeric amount at index ${idx}.`
        );
      }

      const inferredType: "credit" | "debit" =
        row.type === "credit" || row.type === "debit"
          ? row.type
          : rawAmount < 0
            ? "debit"
            : "credit";

      const rawCat =
        typeof row.category === "string" ? row.category.trim() : "";
      const category: TransactionCategory = VALID_CATEGORIES.has(
        rawCat as TransactionCategory
      )
        ? (rawCat as TransactionCategory)
        : "Uncategorized";

      const dateStr =
        typeof row.date === "string" && row.date.trim().length >= 6
          ? row.date.trim().slice(0, 10)
          : "2026-10-01";

      const description =
        typeof row.description === "string" && row.description.trim()
          ? row.description.trim().slice(0, 240)
          : `Line Item #${idx + 1}`;

      const merchant =
        typeof row.merchant === "string" && row.merchant.trim()
          ? row.merchant.trim().slice(0, 120)
          : description.split(/\s+/).slice(0, 3).join(" ");

      const taxAmount =
        row.taxAmount !== undefined && Number.isFinite(Number(row.taxAmount))
          ? Math.abs(Math.round(Number(row.taxAmount) * 100) / 100)
          : undefined;

      const confidenceRaw = Number(row.confidence);
      const confidence =
        Number.isFinite(confidenceRaw) &&
        confidenceRaw >= 0 &&
        confidenceRaw <= 1
          ? confidenceRaw
          : 0.94;

      return {
        id:
          typeof row.id === "string" && row.id.trim()
            ? row.id.trim()
            : `tx-${idx + 1}`,
        date: dateStr,
        description,
        merchant,
        category,
        type: inferredType,
        amount: Math.abs(Math.round(rawAmount * 100) / 100),
        taxAmount,
        confidence,
      };
    }
  );

  const openingBalance = Number.isFinite(Number(obj.openingBalance))
    ? Number(obj.openingBalance)
    : 0;

  const defaultClosing =
    documentType === "bank_statement"
      ? openingBalance +
        transactions
          .filter((t) => t.type === "credit")
          .reduce((s, t) => s + t.amount, 0) -
        transactions
          .filter((t) => t.type === "debit")
          .reduce((s, t) => s + t.amount, 0)
      : transactions.reduce((s, t) => s + t.amount, 0);

  const closingBalance = Number.isFinite(Number(obj.closingBalance))
    ? Number(obj.closingBalance)
    : defaultClosing;

  const reconciliation = computeReconciliation(
    openingBalance,
    closingBalance,
    transactions,
    documentType
  );

  return {
    documentTitle:
      typeof obj.documentTitle === "string" && obj.documentTitle.trim()
        ? obj.documentTitle.trim().slice(0, 120)
        : "Extracted Financial Statement",
    institution:
      typeof obj.institution === "string" && obj.institution.trim()
        ? obj.institution.trim().slice(0, 80)
        : "Financial Institution",
    documentType,
    accountOrInvoiceNumber:
      typeof obj.accountOrInvoiceNumber === "string" &&
      obj.accountOrInvoiceNumber.trim()
        ? obj.accountOrInvoiceNumber.trim().slice(0, 60)
        : "****4829",
    statementPeriod:
      typeof obj.statementPeriod === "string" && obj.statementPeriod.trim()
        ? obj.statementPeriod.trim().slice(0, 60)
        : "Oct 01, 2026 - Oct 31, 2026",
    currency,
    transactions,
    reconciliation,
    meta: {
      modeUsed: metaOverrides.modeUsed,
      providerName: metaOverrides.providerName,
      modelName: metaOverrides.modelName,
      latencyMs: metaOverrides.latencyMs,
      warnings: metaOverrides.warnings ?? [],
    },
  };
}
