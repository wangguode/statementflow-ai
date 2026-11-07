import { computeReconciliation } from "@/lib/schema";
import type { ExtractionResult, TransactionItem } from "@/types/statement";

export interface SamplePreset {
  id: string;
  badge: string;
  name: string;
  fileName: string;
  pages: number;
  rawPreviewText: string;
  result: Omit<ExtractionResult, "meta">;
}

const chaseTransactions: TransactionItem[] = [
  {
    id: "chase-1",
    date: "2026-10-02",
    description: "STRIPE TRANSFER ST-99284102 NORTH AMERICA",
    merchant: "Stripe Payouts",
    category: "Revenue & Payouts",
    type: "credit",
    amount: 16450.0,
    confidence: 0.99,
  },
  {
    id: "chase-2",
    date: "2026-10-05",
    description: "AMAZON WEB SERVICES AWS.AMAZON.COM WA",
    merchant: "Amazon Web Services",
    category: "Cloud & SaaS",
    type: "debit",
    amount: 1842.6,
    confidence: 0.98,
  },
  {
    id: "chase-3",
    date: "2026-10-09",
    description: "GUSTO PAYROLL PPD ID: 9841204411",
    merchant: "Gusto Payroll",
    category: "Payroll & Contractors",
    type: "debit",
    amount: 6850.0,
    confidence: 0.99,
  },
  {
    id: "chase-4",
    date: "2026-10-12",
    description: "FIGMA INC. SAN FRANCISCO CA RECURRING",
    merchant: "Figma",
    category: "Cloud & SaaS",
    type: "debit",
    amount: 144.0,
    confidence: 0.97,
  },
  {
    id: "chase-5",
    date: "2026-10-16",
    description: "FEDWIRE CREDIT NORTHSTAR TREASURY LLC INV-1084",
    merchant: "Northstar Treasury LLC",
    category: "Revenue & Payouts",
    type: "credit",
    amount: 11950.0,
    confidence: 0.99,
  },
  {
    id: "chase-6",
    date: "2026-10-19",
    description: "GOOGLE *ADS783910294 MOUNTAIN VIEW CA",
    merchant: "Google Ads",
    category: "Marketing & Ads",
    type: "debit",
    amount: 1420.0,
    confidence: 0.96,
  },
  {
    id: "chase-7",
    date: "2026-10-24",
    description: "WEWORK MEMBERSHIP OCT-2026 NEW YORK NY",
    merchant: "WeWork",
    category: "Office & Operations",
    type: "debit",
    amount: 1650.0,
    confidence: 0.98,
  },
  {
    id: "chase-8",
    date: "2026-10-29",
    description: "INTERNATIONAL WIRE FEE DOMESTIC/INTL",
    merchant: "JPMorgan Chase Fee",
    category: "Taxes & Fees",
    type: "debit",
    amount: 36.0,
    confidence: 0.99,
  },
];

const stripeInvoiceItems: TransactionItem[] = [
  {
    id: "inv-1",
    date: "2026-10-01",
    description: "Vercel Enterprise Pro Seat Allocation (12 Seats x $40)",
    merchant: "Vercel Inc.",
    category: "Cloud & SaaS",
    type: "debit",
    amount: 480.0,
    taxAmount: 42.6,
    confidence: 0.99,
  },
  {
    id: "inv-2",
    date: "2026-10-14",
    description: "FastOrigin Global Edge Network Bandwidth (2.4 TB Overage)",
    merchant: "Vercel Inc.",
    category: "Cloud & SaaS",
    type: "debit",
    amount: 360.0,
    taxAmount: 31.95,
    confidence: 0.98,
  },
  {
    id: "inv-3",
    date: "2026-10-28",
    description: "Serverless Function Compute GB-Hours & Speed Insights",
    merchant: "Vercel Inc.",
    category: "Cloud & SaaS",
    type: "debit",
    amount: 215.5,
    taxAmount: 19.13,
    confidence: 0.97,
  },
  {
    id: "inv-4",
    date: "2026-10-31",
    description: "US State & Local Digital Services Sales Tax (8.875%)",
    merchant: "NY Tax Authority",
    category: "Taxes & Fees",
    type: "debit",
    amount: 93.68,
    confidence: 0.99,
  },
];

const ukReceiptItems: TransactionItem[] = [
  {
    id: "uk-1",
    date: "2026-10-18",
    description: "Apple Mac Studio M4 Max Workstation (36GB Unified, 1TB SSD)",
    merchant: "Amazon Business EU S.a.r.l.",
    category: "Equipment & Hardware",
    type: "debit",
    amount: 2099.0,
    taxAmount: 349.83,
    confidence: 0.99,
  },
  {
    id: "uk-2",
    date: "2026-10-18",
    description: "Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)",
    merchant: "Amazon Business EU S.a.r.l.",
    category: "Equipment & Hardware",
    type: "debit",
    amount: 489.5,
    taxAmount: 81.58,
    confidence: 0.98,
  },
  {
    id: "uk-3",
    date: "2026-10-18",
    description: "Logitech MX Master 3S Wireless Performance Mouse",
    merchant: "Amazon Business EU S.a.r.l.",
    category: "Office & Operations",
    type: "debit",
    amount: 89.99,
    taxAmount: 15.0,
    confidence: 0.99,
  },
  {
    id: "uk-4",
    date: "2026-10-18",
    description: "Commercial Next-Day Courier Handling & Packaging",
    merchant: "Amazon Logistics UK",
    category: "Office & Operations",
    type: "debit",
    amount: 14.5,
    taxAmount: 2.42,
    confidence: 0.97,
  },
];

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "chase-checking-oct",
    badge: "US Bank PDF",
    name: "Chase Business Checking",
    fileName: "Chase_Commercial_2026_10.pdf",
    pages: 3,
    rawPreviewText: `JPMORGAN CHASE BANK, N.A. - COMMERCIAL COMPLETE CHECKING
Account Number: 00000948274829   Statement Period: Oct 01, 2026 through Oct 31, 2026
--------------------------------------------------------------------------------
CHECKING SUMMARY                                                    AMOUNT (USD)
Beginning Balance                                                     $42,850.00
Deposits and Additions (2)                                           +$28,400.00
Electronic Withdrawals & Fees (6)                                    -$11,942.60
Ending Balance                                                        $59,307.40
--------------------------------------------------------------------------------
DATE        DESCRIPTION                                                   AMOUNT
10/02/2026  STRIPE TRANSFER ST-99284102 NORTH AMERICA                 +16,450.00
10/05/2026  AMAZON WEB SERVICES AWS.AMAZON.COM WA                      -1,842.60
10/09/2026  GUSTO PAYROLL PPD ID: 9841204411                           -6,850.00
10/12/2026  FIGMA INC. SAN FRANCISCO CA RECURRING                        -144.00
10/16/2026  FEDWIRE CREDIT NORTHSTAR TREASURY LLC INV-1084            +11,950.00
10/19/2026  GOOGLE *ADS783910294 MOUNTAIN VIEW CA                      -1,420.00
10/24/2026  WEWORK MEMBERSHIP OCT-2026 NEW YORK NY                     -1,650.00
10/29/2026  INTERNATIONAL WIRE FEE DOMESTIC/INTL                          -36.00`,
    result: {
      documentTitle: "Chase Commercial Complete Checking Statement",
      institution: "JPMorgan Chase Bank, N.A.",
      documentType: "bank_statement",
      accountOrInvoiceNumber: "****4829",
      statementPeriod: "Oct 01, 2026 – Oct 31, 2026",
      currency: "USD",
      transactions: chaseTransactions,
      reconciliation: computeReconciliation(
        42850.0,
        59307.4,
        chaseTransactions,
        "bank_statement"
      ),
    },
  },
  {
    id: "vercel-stripe-invoice",
    badge: "SaaS Tax Invoice",
    name: "Stripe / Vercel Invoice",
    fileName: "Invoice_INV-2026-8841.pdf",
    pages: 1,
    rawPreviewText: `TAX INVOICE - VERCEL INC. (BILLED VIA STRIPE)
Invoice Number: INV-2026-8841    Billing Period: Oct 01, 2026 – Oct 31, 2026
Billed To: Northstar Digital Studio LLC, 228 Park Ave S, New York, NY 10003
--------------------------------------------------------------------------------
QTY   ITEM DESCRIPTION                                      NET (USD)   TAX (USD)
12    Vercel Enterprise Pro Seat Allocation                   $480.00      $42.60
1     FastOrigin Global Edge Network Bandwidth (2.4 TB)       $360.00      $31.95
1     Serverless Function Compute GB-Hours & Insights         $215.50      $19.13
--------------------------------------------------------------------------------
Subtotal (Excl. Tax):                                                  $1,055.50
NY State & Local Sales Tax (8.875%):                                      $93.68
Total Amount Due (Paid via Corporate Visa ****9012):                   $1,149.18`,
    result: {
      documentTitle: "Vercel Enterprise Monthly Tax Invoice",
      institution: "Vercel Inc. (via Stripe Billing)",
      documentType: "invoice",
      accountOrInvoiceNumber: "INV-2026-8841",
      statementPeriod: "Oct 01, 2026 – Oct 31, 2026",
      currency: "USD",
      transactions: stripeInvoiceItems,
      reconciliation: computeReconciliation(
        0,
        1149.18,
        stripeInvoiceItems,
        "invoice"
      ),
    },
  },
  {
    id: "amazon-uk-receipt",
    badge: "Multi-Currency GBP",
    name: "Amazon UK VAT Receipt",
    fileName: "Amazon_Business_VAT_UK_771.pdf",
    pages: 2,
    rawPreviewText: `AMAZON BUSINESS EU S.A.R.L., UK BRANCH - VAT INVOICE
VAT Reg No: GB 727 2558 21       Order Ref: 204-8839201-4491028
Invoice Date: 18 October 2026    Currency: GBP (£)
--------------------------------------------------------------------------------
DATE        ITEM                                           GROSS (GBP)  INC. VAT
2026-10-18  Apple Mac Studio M4 Max Workstation (36GB/1TB)   £2,099.00   £349.83
2026-10-18  Dell UltraSharp 27 4K USB-C Hub Monitor            £489.50    £81.58
2026-10-18  Logitech MX Master 3S Performance Mouse             £89.99    £15.00
2026-10-18  Commercial Next-Day Courier Handling                £14.50     £2.42
--------------------------------------------------------------------------------
Invoice Grand Total (GBP):                                             £2,692.99`,
    result: {
      documentTitle: "Amazon Business UK VAT Procurement Invoice",
      institution: "Amazon Business EU S.a.r.l.",
      documentType: "receipt",
      accountOrInvoiceNumber: "204-8839201-4491028",
      statementPeriod: "Oct 18, 2026",
      currency: "GBP",
      transactions: ukReceiptItems,
      reconciliation: computeReconciliation(
        0,
        2692.99,
        ukReceiptItems,
        "receipt"
      ),
    },
  },
];

export function findSampleById(sampleId: string): SamplePreset | undefined {
  return SAMPLE_PRESETS.find((s) => s.id === sampleId);
}
