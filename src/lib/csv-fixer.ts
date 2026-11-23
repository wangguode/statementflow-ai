/**
 * QuickBooks Online / Xero CSV 导入报错自动诊断与修复引擎（100% 浏览器本地运行）
 * 解决海外会计师高频痛点：
 * 1. 日期格式不统一（DD/MM/YYYY vs MM/DD/YYYY vs DD-MMM-YYYY）
 * 2. Debit / Credit 拆分列合并为带正负号单列 Amount
 * 3. 货币符号（$, €, £）、括号负数 (120.50)、千分位逗号清洗
 * 4. 多行换行符与特殊字符导致的错列修复
 * 5. 信用卡账单正负号一键反转 + 原生 QuickBooks 3列 / Xero 5列导出
 */

export type TargetSoftware = "quickbooks_3col" | "xero_5col";
export type DateOutputFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";

export interface FixerOptions {
  target: TargetSoftware;
  dateFormat: DateOutputFormat;
  sourceDateOrder: "auto" | "MDY" | "DMY";
  invertSigns: boolean;
  stripSpecialChars: boolean;
  dropZeroRows: boolean;
}

export interface FixedRow {
  date: string;
  description: string;
  payee: string;
  amount: number;
  reference: string;
  issues: string[];
}

export interface FixerDiagnostics {
  delimiter: string;
  skippedHeaderRows: number;
  rawRowCount: number;
  cleanRowCount: number;
  detectedColumns: {
    date: string | null;
    description: string | null;
    amount: string | null;
    debit: string | null;
    credit: string | null;
    reference: string | null;
  };
  fixedCounts: {
    datesNormalized: number;
    currencyOrParensCleaned: number;
    splitColumnsMerged: number;
    multilineSanitized: number;
    emptyOrSummarySkipped: number;
    signsInverted: number;
  };
  totalCredits: number;
  totalDebits: number;
  netFlow: number;
  warnings: string[];
}

export interface FixerResult {
  rows: FixedRow[];
  diagnostics: FixerDiagnostics;
  outputCsv: string;
}

const MONTH_MAP: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  sept: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

/**
 * 自动检测 CSV 分隔符（逗号 / 分号 / 制表符）
 */
function detectDelimiter(text: string): string {
  const sampleLines = text
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .slice(0, 15);
  const candidates = [",", ";", "\t"];
  let best = ",";
  let bestScore = -1;
  for (const delim of candidates) {
    let score = 0;
    for (const line of sampleLines) {
      const count = line.split(delim).length - 1;
      if (count >= 2) score += count;
    }
    if (score > bestScore) {
      bestScore = score;
      best = delim;
    }
  }
  return best;
}

/**
 * RFC 4180 容错 CSV 解析器，正确处理引号内换行与转义引号
 */
function parseCsvMatrix(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const cleaned = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    const next = cleaned[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\r" && next === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
    } else if (ch === "\n" || ch === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * 解析并标准化各种常见银行日期格式
 */
function parseDateValue(
  raw: string,
  sourceOrder: "auto" | "MDY" | "DMY"
): { year: number; month: number; day: number; normalized: boolean } | null {
  const s = raw.trim().replace(/^['"]|['"]$/g, "");
  if (!s) return null;

  // YYYY-MM-DD 或 YYYY/MM/DD
  const iso = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return { year: y, month: m, day: d, normalized: true };
    }
  }

  // DD-MMM-YYYY 或 DD MMM YYYY 或 MMM DD, YYYY
  const dmyText = s.match(/^(\d{1,2})[\s-/]+([A-Za-z]{3,9})[\s-/,]+(\d{2,4})/);
  if (dmyText) {
    const d = Number(dmyText[1]);
    const m = MONTH_MAP[dmyText[2].toLowerCase().slice(0, 3)];
    let y = Number(dmyText[3]);
    if (y < 100) y += 2000;
    if (m && d >= 1 && d <= 31) {
      return { year: y, month: m, day: d, normalized: true };
    }
  }

  const mdyText = s.match(/^([A-Za-z]{3,9})[\s-]+(\d{1,2}),?[\s-]+(\d{2,4})/);
  if (mdyText) {
    const m = MONTH_MAP[mdyText[1].toLowerCase().slice(0, 3)];
    const d = Number(mdyText[2]);
    let y = Number(mdyText[3]);
    if (y < 100) y += 2000;
    if (m && d >= 1 && d <= 31) {
      return { year: y, month: m, day: d, normalized: true };
    }
  }

  // MM/DD/YYYY 或 DD/MM/YYYY
  const slash = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (slash) {
    const a = Number(slash[1]);
    const b = Number(slash[2]);
    let y = Number(slash[3]);
    if (y < 100) y += 2000;
    let month = a;
    let day = b;
    if (sourceOrder === "DMY") {
      day = a;
      month = b;
    } else if (sourceOrder === "MDY") {
      month = a;
      day = b;
    } else {
      // auto：若首段 > 12 则必为日
      if (a > 12 && b <= 12) {
        day = a;
        month = b;
      } else {
        month = a;
        day = b;
      }
    }
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year: y, month, day, normalized: true };
    }
  }

  return null;
}

function formatDate(
  d: { year: number; month: number; day: number },
  fmt: DateOutputFormat
): string {
  const mm = String(d.month).padStart(2, "0");
  const dd = String(d.day).padStart(2, "0");
  const yyyy = String(d.year);
  if (fmt === "MM/DD/YYYY") return `${mm}/${dd}/${yyyy}`;
  if (fmt === "DD/MM/YYYY") return `${dd}/${mm}/${yyyy}`;
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 解析金额：支持货币符号、会计括号负数 (120.50)、欧式逗号小数 (1.234,56)、前导小数点 (.50)
 */
function parseAmountValue(raw: string): { value: number | null; wasDirty: boolean } {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null, wasDirty: false };

  let s = trimmed;
  let negative = false;
  let wasDirty = false;

  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1).trim();
    wasDirty = true;
  }

  if (/[A-Za-z$€£¥₹\s]/.test(s)) {
    wasDirty = true;
  }
  s = s.replace(/[A-Za-z$€£¥₹\s]/g, "");

  if (s.startsWith("-")) {
    negative = !negative;
    s = s.slice(1);
  } else if (s.startsWith("+")) {
    s = s.slice(1);
    wasDirty = true;
  }

  // 处理欧式小数逗号（例如 1.234,56 -> 1234.56）
  if (/^\d{1,3}(\.\d{3})*,\d{1,2}$/.test(s) || /^\d+,\d{1,2}$/.test(s)) {
    s = s.replace(/\./g, "").replace(",", ".");
    wasDirty = true;
  } else if (s.includes(",")) {
    s = s.replace(/,/g, "");
    wasDirty = true;
  }

  if (s.startsWith(".")) {
    s = "0" + s;
    wasDirty = true;
  }

  const num = Number(s);
  if (!Number.isFinite(num)) return { value: null, wasDirty };
  const signed = negative ? -Math.abs(num) : num;
  return { value: Math.round(signed * 100) / 100, wasDirty };
}

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 定位真正的表头行（跳过银行导出顶部的账户信息、余额汇总行）
 */
function findHeaderRowIndex(matrix: string[][]): number {
  const keywords = [
    "date",
    "description",
    "details",
    "memo",
    "payee",
    "merchant",
    "amount",
    "debit",
    "credit",
    "withdrawal",
    "deposit",
    "money in",
    "money out",
  ];
  for (let i = 0; i < Math.min(matrix.length, 20); i++) {
    const row = matrix[i].map((c) => c.trim().toLowerCase());
    if (row.filter(Boolean).length < 2) continue;
    let hits = 0;
    for (const cell of row) {
      if (keywords.some((k) => cell === k || cell.includes(k))) hits++;
    }
    if (hits >= 2) return i;
  }
  return 0;
}

export function fixBankCsv(rawCsv: string, options: FixerOptions): FixerResult {
  const delimiter = detectDelimiter(rawCsv);
  const matrix = parseCsvMatrix(rawCsv, delimiter);
  const headerIdx = findHeaderRowIndex(matrix);
  const headers = (matrix[headerIdx] || []).map((h) => h.trim());
  const lowerHeaders = headers.map((h) => h.toLowerCase());

  const findCol = (patterns: RegExp[]): number =>
    lowerHeaders.findIndex((h) => patterns.some((re) => re.test(h)));

  const dateCol = findCol([/^date$/, /post.*date/, /trans.*date/, /booking.*date/, /date/]);
  const descCol = findCol([/^description$/, /narrative/, /merchant/, /payee/, /details/, /memo/, /particulars/]);
  const amountCol = findCol([/^amount$/, /value/, /net/, /total/]);
  const debitCol = findCol([/debit/, /withdrawal/, /money out/, /paid out/, /charge/, /expense/]);
  const creditCol = findCol([/credit/, /deposit/, /money in/, /paid in/]);
  const refCol = findCol([/^ref/, /check/, /cheque/, /transaction id/, /fitid/]);

  const diagnostics: FixerDiagnostics = {
    delimiter: delimiter === "\t" ? "TAB" : delimiter,
    skippedHeaderRows: headerIdx,
    rawRowCount: Math.max(0, matrix.length - headerIdx - 1),
    cleanRowCount: 0,
    detectedColumns: {
      date: dateCol >= 0 ? headers[dateCol] : null,
      description: descCol >= 0 ? headers[descCol] : null,
      amount: amountCol >= 0 ? headers[amountCol] : null,
      debit: debitCol >= 0 ? headers[debitCol] : null,
      credit: creditCol >= 0 ? headers[creditCol] : null,
      reference: refCol >= 0 ? headers[refCol] : null,
    },
    fixedCounts: {
      datesNormalized: 0,
      currencyOrParensCleaned: 0,
      splitColumnsMerged: 0,
      multilineSanitized: 0,
      emptyOrSummarySkipped: 0,
      signsInverted: 0,
    },
    totalCredits: 0,
    totalDebits: 0,
    netFlow: 0,
    warnings: [],
  };

  if (dateCol < 0) {
    diagnostics.warnings.push(
      "Could not detect a Date column automatically. Ensure your file has a Date header."
    );
  }
  if (amountCol < 0 && debitCol < 0 && creditCol < 0) {
    diagnostics.warnings.push(
      "Could not detect Amount, Debit, or Credit columns."
    );
  }

  // 自动判断全局日期顺序（如果发现任何首段 > 12，则整表按 DMY 解析）
  let effectiveDateOrder = options.sourceDateOrder;
  if (effectiveDateOrder === "auto" && dateCol >= 0) {
    for (let i = headerIdx + 1; i < matrix.length; i++) {
      const cell = (matrix[i][dateCol] || "").trim();
      const m = cell.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
      if (m && Number(m[1]) > 12) {
        effectiveDateOrder = "DMY";
        break;
      }
    }
  }

  const rows: FixedRow[] = [];

  for (let i = headerIdx + 1; i < matrix.length; i++) {
    const cols = matrix[i];
    if (!cols || cols.every((c) => c.trim() === "")) {
      diagnostics.fixedCounts.emptyOrSummarySkipped++;
      continue;
    }

    const rawDate = dateCol >= 0 ? (cols[dateCol] || "").trim() : "";
    const parsedDate = parseDateValue(rawDate, effectiveDateOrder);
    if (!parsedDate) {
      diagnostics.fixedCounts.emptyOrSummarySkipped++;
      continue;
    }

    const issues: string[] = [];
    const formattedDate = formatDate(parsedDate, options.dateFormat);
    if (formattedDate !== rawDate) {
      diagnostics.fixedCounts.datesNormalized++;
      issues.push(`Date: ${rawDate} → ${formattedDate}`);
    }

    let rawDesc = descCol >= 0 ? cols[descCol] || "" : "";
    if (/[\r\n]/.test(rawDesc)) {
      rawDesc = rawDesc.replace(/\s*[\r\n]+\s*/g, " ").trim();
      diagnostics.fixedCounts.multilineSanitized++;
      issues.push("Flattened multiline description");
    }
    rawDesc = rawDesc.replace(/\s{2,}/g, " ").trim();
    if (options.stripSpecialChars) {
      const sanitized = rawDesc.replace(/[#*^|~`]/g, "").trim();
      if (sanitized !== rawDesc) {
        rawDesc = sanitized;
        issues.push("Removed illegal QuickBooks symbols");
      }
    }
    if (!rawDesc) rawDesc = "Bank Transaction";

    let amount: number | null = null;
    if (amountCol >= 0 && (cols[amountCol] || "").trim() !== "") {
      const parsed = parseAmountValue(cols[amountCol] || "");
      amount = parsed.value;
      if (parsed.wasDirty) {
        diagnostics.fixedCounts.currencyOrParensCleaned++;
        issues.push("Cleaned currency/brackets");
      }
    } else if (debitCol >= 0 || creditCol >= 0) {
      const debitParsed = debitCol >= 0 ? parseAmountValue(cols[debitCol] || "") : { value: null, wasDirty: false };
      const creditParsed = creditCol >= 0 ? parseAmountValue(cols[creditCol] || "") : { value: null, wasDirty: false };
      if (debitParsed.value !== null || creditParsed.value !== null) {
        const dVal = debitParsed.value ? Math.abs(debitParsed.value) : 0;
        const cVal = creditParsed.value ? Math.abs(creditParsed.value) : 0;
        amount = Math.round((cVal - dVal) * 100) / 100;
        diagnostics.fixedCounts.splitColumnsMerged++;
        issues.push("Merged Debit/Credit → Amount");
        if (debitParsed.wasDirty || creditParsed.wasDirty) {
          diagnostics.fixedCounts.currencyOrParensCleaned++;
        }
      }
    }

    if (amount === null || (options.dropZeroRows && amount === 0)) {
      diagnostics.fixedCounts.emptyOrSummarySkipped++;
      continue;
    }

    if (options.invertSigns && amount !== 0) {
      amount = -amount;
      diagnostics.fixedCounts.signsInverted++;
      issues.push("Inverted sign");
    }

    if (amount >= 0) {
      diagnostics.totalCredits = Math.round((diagnostics.totalCredits + amount) * 100) / 100;
    } else {
      diagnostics.totalDebits = Math.round((diagnostics.totalDebits + Math.abs(amount)) * 100) / 100;
    }

    const reference = refCol >= 0 ? (cols[refCol] || "").replace(/[\r\n]+/g, " ").trim() : "";
    const payee = rawDesc.split(/\s+-\s+|\s+\|\s+/)[0].slice(0, 60).trim() || rawDesc.slice(0, 60);

    rows.push({
      date: formattedDate,
      description: rawDesc,
      payee,
      amount,
      reference,
      issues,
    });
  }

  diagnostics.cleanRowCount = rows.length;
  diagnostics.netFlow = Math.round((diagnostics.totalCredits - diagnostics.totalDebits) * 100) / 100;

  let outputLines: string[] = [];
  if (options.target === "quickbooks_3col") {
    outputLines = [
      "Date,Description,Amount",
      ...rows.map((r) =>
        [csvEscape(r.date), csvEscape(r.description), r.amount.toFixed(2)].join(",")
      ),
    ];
  } else {
    outputLines = [
      "*Date,*Amount,Payee,Description,Reference",
      ...rows.map((r) =>
        [
          csvEscape(r.date),
          r.amount.toFixed(2),
          csvEscape(r.payee),
          csvEscape(r.description),
          csvEscape(r.reference),
        ].join(",")
      ),
    ];
  }

  return {
    rows,
    diagnostics,
    outputCsv: outputLines.join("\r\n"),
  };
}

export const SAMPLE_MESSY_BANK_CSV = `Account Summary: Chase Business Checking ****4821
Exported On: 2026-11-20,,
,,
Posting Date,Transaction Details,Debit,Credit,Reference
15/11/2026,"AWS CLOUD SERVICES
US-EAST-1 #INV-8821","$1,240.50",,ACH-9021
16-Nov-2026,"STRIPE PAYOUT #2026-11",,"$8,450.00",DEP-4410
2026-11-17,"GUSTO PAYROLL **NOV RUN**","($3,820.75)",,ACH-9029
18/11/2026,"SLACK TECHNOLOGIES #PRO",".50",,CARD-1102
19/11/2026,"CLIENT RETAINER - ACME CORP",,"$4,200.00",WIRE-7712
TOTALS SUMMARY,,"$5,061.75","$12,650.00",`;
