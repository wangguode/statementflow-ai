import * as XLSX from "xlsx";
import type { ExtractionResult } from "@/types/statement";

function sanitizeFormulaCell(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function escapeCsvCell(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  // 防止 CSV 公式注入（=, +, -, @ 开头加单引号转义）
  const safeStr = /^[=+\-@]/.test(str) ? `'${str}` : str;
  if (/[",\n\r]/.test(safeStr)) {
    return `"${safeStr.replace(/"/g, '""')}"`;
  }
  return safeStr;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * 生成带 UTF-8 BOM 的标准 CSV（兼容海外 QuickBooks / Xero 及 Windows/Mac Excel 直接打开不乱码）
 */
export function buildCsvContent(data: ExtractionResult): string {
  const headers = [
    "Date",
    "Merchant",
    "Description",
    "Category",
    "Type",
    `Signed Amount (${data.currency})`,
    `Debit (${data.currency})`,
    `Credit (${data.currency})`,
    `Tax (${data.currency})`,
    "Confidence",
  ];

  const rows = data.transactions.map((tx) => {
    const signed = tx.type === "debit" ? -tx.amount : tx.amount;
    return [
      tx.date,
      tx.merchant,
      tx.description,
      tx.category,
      tx.type.toUpperCase(),
      signed.toFixed(2),
      tx.type === "debit" ? tx.amount.toFixed(2) : "",
      tx.type === "credit" ? tx.amount.toFixed(2) : "",
      tx.taxAmount !== undefined ? tx.taxAmount.toFixed(2) : "",
      `${Math.round(tx.confidence * 100)}%`,
    ]
      .map(escapeCsvCell)
      .join(",");
  });

  return "\uFEFF" + [headers.map(escapeCsvCell).join(","), ...rows].join("\r\n");
}

/**
 * 生成严格符合 QuickBooks Online 官方 3 列导入规范的 CSV（Date, Description, Amount）
 * 日期统一为 MM/DD/YYYY，无货币符号、无多余千分位逗号，避免 QBO 拒收
 */
export function buildQuickBooksCsvContent(data: ExtractionResult): string {
  const headers = ["Date", "Description", "Amount"];
  const rows = data.transactions.map((tx) => {
    const signed = tx.type === "debit" ? -tx.amount : tx.amount;
    const parts = tx.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const qboDate = parts ? `${parts[2]}/${parts[3]}/${parts[1]}` : tx.date;
    const desc =
      tx.merchant && tx.merchant !== tx.description
        ? `${tx.merchant} - ${tx.description}`
        : tx.description;
    return [qboDate, desc, signed.toFixed(2)].map(escapeCsvCell).join(",");
  });
  return [headers.join(","), ...rows].join("\r\n");
}

/**
 * 生成严格符合 Xero 官方银行对账单导入规范的 5 列 CSV（Date, Amount, Payee, Description, Reference）
 */
export function buildXeroCsvContent(data: ExtractionResult): string {
  const headers = ["Date", "Amount", "Payee", "Description", "Reference"];
  const rows = data.transactions.map((tx) => {
    const signed = tx.type === "debit" ? -tx.amount : tx.amount;
    return [
      tx.date,
      signed.toFixed(2),
      tx.merchant || tx.description,
      tx.description,
      tx.id,
    ]
      .map(escapeCsvCell)
      .join(",");
  });
  return [headers.join(","), ...rows].join("\r\n");
}

/**
 * 生成包含「交易明细」与「财务对账汇总」双工作表的原生 Excel XML Workbook (.xls)
 */
export function buildExcelWorkbookXml(data: ExtractionResult): string {
  const txRowsXml = data.transactions
    .map((tx) => {
      const signed = tx.type === "debit" ? -tx.amount : tx.amount;
      return `<Row>
        <Cell><Data ss:Type="String">${escapeXml(tx.date)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(tx.merchant)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(tx.description)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(tx.category)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(tx.type.toUpperCase())}</Data></Cell>
        <Cell ss:StyleID="Currency"><Data ss:Type="Number">${signed.toFixed(2)}</Data></Cell>
        <Cell ss:StyleID="Currency"><Data ss:Type="Number">${(tx.taxAmount ?? 0).toFixed(2)}</Data></Cell>
      </Row>`;
    })
    .join("\n");

  const rec = data.reconciliation;

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Currency">
      <NumberFormat ss:Format="#,##0.00"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Transactions">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Date</Data></Cell>
        <Cell><Data ss:Type="String">Merchant</Data></Cell>
        <Cell><Data ss:Type="String">Description</Data></Cell>
        <Cell><Data ss:Type="String">Category</Data></Cell>
        <Cell><Data ss:Type="String">Direction</Data></Cell>
        <Cell><Data ss:Type="String">Amount (${escapeXml(data.currency)})</Data></Cell>
        <Cell><Data ss:Type="String">Tax (${escapeXml(data.currency)})</Data></Cell>
      </Row>
      ${txRowsXml}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="Reconciliation">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Metric</Data></Cell>
        <Cell><Data ss:Type="String">Value (${escapeXml(data.currency)})</Data></Cell>
      </Row>
      <Row><Cell><Data ss:Type="String">Institution</Data></Cell><Cell><Data ss:Type="String">${escapeXml(data.institution)}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Account / Ref</Data></Cell><Cell><Data ss:Type="String">${escapeXml(data.accountOrInvoiceNumber)}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Period</Data></Cell><Cell><Data ss:Type="String">${escapeXml(data.statementPeriod)}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Opening Balance</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${rec.openingBalance.toFixed(2)}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Total Credits (+)</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${rec.totalCredits.toFixed(2)}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Total Debits (-)</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${rec.totalDebits.toFixed(2)}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Closing Balance</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${rec.closingBalance.toFixed(2)}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Reconciliation Status</Data></Cell><Cell><Data ss:Type="String">${rec.isBalanced ? "BALANCED (0.00 Discrepancy)" : `UNBALANCED (${rec.discrepancy.toFixed(2)})`}</Data></Cell></Row>
    </Table>
  </Worksheet>
</Workbook>`;
}

/**
 * 生成真正原生无警告的双工作表 .xlsx 文件（OOXML 标准格式，兼容 Excel / Google Sheets / Numbers）
 * 自动防御公式注入（=, +, -, @ 开头加单引号）并设定清晰列宽
 */
export function buildExcelXlsxBytes(data: ExtractionResult): Uint8Array {
  const wb = XLSX.utils.book_new();

  const txHeaders = [
    "Date",
    "Merchant",
    "Description",
    "Category",
    "Direction",
    `Amount (${data.currency})`,
    `Tax (${data.currency})`,
    "Confidence",
  ];

  const txRows = data.transactions.map((tx) => {
    const signed = tx.type === "debit" ? -tx.amount : tx.amount;
    return [
      sanitizeFormulaCell(tx.date),
      sanitizeFormulaCell(tx.merchant),
      sanitizeFormulaCell(tx.description),
      sanitizeFormulaCell(tx.category),
      tx.type.toUpperCase(),
      Number(signed.toFixed(2)),
      Number((tx.taxAmount ?? 0).toFixed(2)),
      `${Math.round(tx.confidence * 100)}%`,
    ];
  });

  const wsTx = XLSX.utils.aoa_to_sheet([txHeaders, ...txRows]);
  wsTx["!cols"] = [
    { wch: 12 },
    { wch: 24 },
    { wch: 42 },
    { wch: 20 },
    { wch: 10 },
    { wch: 16 },
    { wch: 12 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTx, "Transactions");

  const rec = data.reconciliation;
  const recRows = [
    ["Metric", `Value (${data.currency})`],
    ["Institution", sanitizeFormulaCell(data.institution)],
    ["Account / Ref", sanitizeFormulaCell(data.accountOrInvoiceNumber)],
    ["Period", sanitizeFormulaCell(data.statementPeriod)],
    ["Opening Balance", Number(rec.openingBalance.toFixed(2))],
    ["Total Credits (+)", Number(rec.totalCredits.toFixed(2))],
    ["Total Debits (-)", Number(rec.totalDebits.toFixed(2))],
    ["Closing Balance", Number(rec.closingBalance.toFixed(2))],
    [
      "Reconciliation Status",
      rec.isBalanced
        ? "BALANCED (0.00 Discrepancy)"
        : `UNBALANCED (${rec.discrepancy.toFixed(2)})`,
    ],
  ];

  const wsRec = XLSX.utils.aoa_to_sheet(recRows);
  wsRec["!cols"] = [{ wch: 26 }, { wch: 36 }];
  XLSX.utils.book_append_sheet(wb, wsRec, "Reconciliation");

  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return new Uint8Array(buffer);
}

export function triggerBrowserDownload(
  content: string | Uint8Array,
  fileName: string,
  mimeType: string
): void {
  const blobPart: BlobPart =
    content instanceof Uint8Array
      ? content.slice().buffer
      : content;
  const blob = new Blob([blobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
