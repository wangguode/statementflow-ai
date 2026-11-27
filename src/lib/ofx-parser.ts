/**
 * OFX / QFX / QBO 银行文件纯浏览器解析器（零上传）
 * 同时兼容 OFX 1.x (SGML 无闭合标签) 与 OFX 2.x (标准 XML)
 * 专门解决 QuickBooks Web Connect Error -16802 与银行仅提供 .qbo/.qfx 无法导进 Excel/Xero 的问题
 */

export interface OfxTransaction {
  fitId: string;
  dateIso: string;
  dateUs: string;
  dateUk: string;
  type: string;
  amount: number;
  name: string;
  memo: string;
  checkNum: string;
}

export interface OfxParseResult {
  format: "OFX 2.x (XML)" | "OFX 1.x (SGML)";
  currency: string;
  bankId: string;
  accountIdMasked: string;
  accountType: string;
  ledgerBalance: number | null;
  balanceDate: string | null;
  transactions: OfxTransaction[];
  totalCredits: number;
  totalDebits: number;
  netFlow: number;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * 提取单个 SGML/XML 标签值（同时支持 <TAG>value</TAG> 与 <TAG>value\n）
 */
function extractTag(block: string, tag: string): string {
  const xmlRe = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const xmlMatch = block.match(xmlRe);
  if (xmlMatch) {
    return decodeHtmlEntities(xmlMatch[1].replace(/\s+/g, " "));
  }
  const sgmlRe = new RegExp(`<${tag}>([^<\\r\\n]+)`, "i");
  const sgmlMatch = block.match(sgmlRe);
  if (sgmlMatch) {
    return decodeHtmlEntities(sgmlMatch[1].replace(/\s+/g, " "));
  }
  return "";
}

/**
 * 解析 OFX 时间戳（如 20261115120000[-5:EST] 或 20261115）
 */
function parseOfxDate(raw: string): { iso: string; us: string; uk: string } {
  const m = raw.trim().match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) return { iso: raw, us: raw, uk: raw };
  const [, yyyy, mm, dd] = m;
  return {
    iso: `${yyyy}-${mm}-${dd}`,
    us: `${mm}/${dd}/${yyyy}`,
    uk: `${dd}/${mm}/${yyyy}`,
  };
}

function maskAccountId(id: string): string {
  if (!id) return "N/A";
  if (id.length <= 4) return id;
  return `${"*".repeat(Math.max(4, id.length - 4))}${id.slice(-4)}`;
}

export function parseOfxContent(rawText: string): OfxParseResult {
  const isXml = /<\?xml/i.test(rawText) || /<\/STMTTRN>/i.test(rawText);
  const currency = extractTag(rawText, "CURDEF") || "USD";
  const bankId = extractTag(rawText, "BANKID") || extractTag(rawText, "INTU.BID") || "N/A";
  const acctId = extractTag(rawText, "ACCTID");
  const accountType = extractTag(rawText, "ACCTTYPE") || (/<CCSTMTRS>/i.test(rawText) ? "CREDITCARD" : "CHECKING");

  const ledgerBlockMatch = rawText.match(/<LEDGERBAL>([\s\S]*?)(?:<\/LEDGERBAL>|<AVAILBAL>|<\/STMTRS>|<\/CCSTMTRS>|$)/i);
  const ledgerBlock = ledgerBlockMatch ? ledgerBlockMatch[1] : "";
  const balRaw = extractTag(ledgerBlock, "BALAMT");
  const balDateRaw = extractTag(ledgerBlock, "DTASOF");
  const ledgerBalance = balRaw && Number.isFinite(Number(balRaw)) ? Number(balRaw) : null;
  const balanceDate = balDateRaw ? parseOfxDate(balDateRaw).iso : null;

  // 切分所有 <STMTTRN> 块（兼容无闭合标签的 SGML）
  const chunks = rawText.split(/<STMTTRN>/i).slice(1);
  const transactions: OfxTransaction[] = [];
  let totalCredits = 0;
  let totalDebits = 0;

  for (const chunk of chunks) {
    const endIdx = chunk.search(/<\/STMTTRN>|<\/BANKTRANLIST>|<LEDGERBAL>/i);
    const block = endIdx >= 0 ? chunk.slice(0, endIdx) : chunk;
    const rawDate = extractTag(block, "DTPOSTED") || extractTag(block, "DTUSER");
    const rawAmt = extractTag(block, "TRNAMT").replace(/,/g, "");
    const amount = Number(rawAmt);
    if (!rawDate || !Number.isFinite(amount)) continue;

    const dates = parseOfxDate(rawDate);
    const rounded = Math.round(amount * 100) / 100;
    if (rounded >= 0) {
      totalCredits = Math.round((totalCredits + rounded) * 100) / 100;
    } else {
      totalDebits = Math.round((totalDebits + Math.abs(rounded)) * 100) / 100;
    }

    transactions.push({
      fitId: extractTag(block, "FITID"),
      dateIso: dates.iso,
      dateUs: dates.us,
      dateUk: dates.uk,
      type: extractTag(block, "TRNTYPE") || (rounded >= 0 ? "CREDIT" : "DEBIT"),
      amount: rounded,
      name: extractTag(block, "NAME") || extractTag(block, "PAYEE") || "Bank Transaction",
      memo: extractTag(block, "MEMO"),
      checkNum: extractTag(block, "CHECKNUM"),
    });
  }

  return {
    format: isXml ? "OFX 2.x (XML)" : "OFX 1.x (SGML)",
    currency,
    bankId,
    accountIdMasked: maskAccountId(acctId),
    accountType,
    ledgerBalance,
    balanceDate,
    transactions,
    totalCredits,
    totalDebits,
    netFlow: Math.round((totalCredits - totalDebits) * 100) / 100,
  };
}

function csvEscape(value: string): string {
  const safe =
    !/^[+-]?\d+(\.\d+)?$/.test(value.trim()) && /^[=+\-@]/.test(value)
      ? `'${value}`
      : value;
  if (/[",\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function exportOfxToCsv(
  parsed: OfxParseResult,
  mode: "standard" | "quickbooks" | "xero",
  maxRows?: number
): string {
  const list = typeof maxRows === "number" ? parsed.transactions.slice(0, maxRows) : parsed.transactions;
  if (mode === "quickbooks") {
    return (
      "\uFEFF" +
      [
        "Date,Description,Amount",
        ...list.map((t) => {
          const desc = t.memo && t.memo !== t.name ? `${t.name} - ${t.memo}` : t.name;
          return [csvEscape(t.dateUs), csvEscape(desc), t.amount.toFixed(2)].join(",");
        }),
      ].join("\r\n")
    );
  }
  if (mode === "xero") {
    return (
      "\uFEFF" +
      [
        "*Date,*Amount,Payee,Description,Reference",
        ...list.map((t) =>
          [
            csvEscape(t.dateUk),
            t.amount.toFixed(2),
            csvEscape(t.name),
            csvEscape(t.memo || t.name),
            csvEscape(t.checkNum || t.fitId),
          ].join(",")
        ),
      ].join("\r\n")
    );
  }
  return (
    "\uFEFF" +
    [
      "Date,Type,Payee,Memo,Amount,CheckNum,FITID",
      ...list.map((t) =>
        [
          csvEscape(t.dateIso),
          csvEscape(t.type),
          csvEscape(t.name),
          csvEscape(t.memo),
          t.amount.toFixed(2),
          csvEscape(t.checkNum),
          csvEscape(t.fitId),
        ].join(",")
      ),
    ].join("\r\n")
  );
}

export const SAMPLE_QBO_FILE = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS><CODE>0<SEVERITY>INFO</STATUS>
<DTSERVER>20261120120000[-5:EST]
<LANGUAGE>ENG
<INTU.BID>2430
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1001
<STMTRS>
<CURDEF>USD
<BANKACCTFROM>
<BANKID>021000021
<ACCTID>883920194821
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>20261101000000
<DTEND>20261120000000
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20261103120000[-5:EST]
<TRNAMT>9450.00
<FITID>202611030001
<NAME>STRIPE PAYOUT
<MEMO>MERCHANT SETTLEMENT #9921
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20261105120000[-5:EST]
<TRNAMT>-1240.50
<FITID>202611050002
<NAME>AMAZON WEB SERVICES
<MEMO>CLOUD INFRASTRUCTURE BILLING
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20261110120000[-5:EST]
<TRNAMT>-3820.75
<FITID>202611100003
<NAME>GUSTO PAYROLL
<MEMO>BIWEEKLY PAYROLL RUN
</STMTTRN>
<STMTTRN>
<TRNTYPE>CHECK
<DTPOSTED>20261114120000[-5:EST]
<TRNAMT>-650.00
<FITID>202611140004
<CHECKNUM>1042
<NAME>OFFICE LEASE LLC
<MEMO>SUITE 400 STORAGE
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20261118120000[-5:EST]
<TRNAMT>4200.00
<FITID>202611180005
<NAME>ACME CORP WIRE
<MEMO>NOV RETAINER INVOICE #118
</STMTTRN>
</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>24890.15
<DTASOF>20261120120000[-5:EST]
</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;
