// Programmatic SEO (pSEO) 银行与财务平台长尾词落地页数据源
// 覆盖美、英、欧及跨境电商最高转化率的 12 个 PDF/账单转 Excel/CSV/QuickBooks 搜索意图

export interface PseoBankEntry {
  slug: string;
  institutionName: string;
  shortName: string;
  region: "United States" | "United Kingdom" | "Canada" | "Australia & NZ" | "Europe & Global" | "Asia-Pacific";
  defaultCurrency: "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "SGD" | "HKD";
  targetFormat: "Excel (.xlsx)" | "CSV" | "QuickBooks CSV" | "Xero CSV";
  recommendedSampleId:
    | "chase-checking-oct"
    | "vercel-stripe-invoice"
    | "amazon-uk-receipt";
  heroHeadline: string;
  heroSubheadline: string;
  statementQuirkTitle: string;
  statementQuirkDescription: string;
  supportedAccountTypes: string[];
  extractedColumns: string[];
  specificFaqs: {
    q: string;
    a: string;
  }[];
}

export const PSEO_BANK_ENTRIES: PseoBankEntry[] = [
  {
    slug: "chase-bank-statement-to-excel",
    institutionName: "JPMorgan Chase Bank",
    shortName: "Chase PDF to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Chase statements, verified to zero.",
    heroSubheadline:
      "Convert JPMorgan Chase Total Checking, Sapphire, and Commercial Complete PDF statements into multi-sheet Excel workbooks and QuickBooks CSVs with cent-level balance verification.",
    statementQuirkTitle: "Handling Chase Split Deposit & Withdrawal Sections",
    statementQuirkDescription:
      "Chase monthly PDFs separate Deposits and Additions from Electronic Withdrawals and Daily Ending Balances. StatementFlow merges both sections chronologically, assigns signed amounts, and verifies Opening + Credits - Debits against your Chase Ending Balance.",
    supportedAccountTypes: [
      "Chase Business Complete Checking",
      "Chase Total Checking & Premier Plus",
      "Chase Ink Business Preferred Credit Card",
      "JPMorgan Commercial Treasury Accounts",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant Name",
      "PPD / Wire / Card Description",
      "Expense Category",
      "Signed Amount & Separate Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Does StatementFlow handle multi-page Chase Commercial Checking PDFs?",
        a: "Yes. Page headers, legal disclosures, and daily ending balance tables are stripped automatically so only real cashflow transactions enter your Excel worksheet.",
      },
      {
        q: "How are Zelle, ACH PPD IDs, and Stripe payouts categorized?",
        a: "The parser extracts the clean counterparty name while preserving the full reference string in the description column for audit traceability.",
      },
    ],
  },
  {
    slug: "wells-fargo-statement-to-csv",
    institutionName: "Wells Fargo Bank",
    shortName: "Wells Fargo to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Wells Fargo PDFs, ready for import.",
    heroSubheadline:
      "Transform Wells Fargo Initiate Business Checking and Everyday Checking PDF statements into clean, UTF-8 BOM CSV and multi-tab Excel files without manual copy-pasting.",
    statementQuirkTitle: "Resolving Wells Fargo Running Balance & Check Columns",
    statementQuirkDescription:
      "Wells Fargo statements interleave check numbers, credits, and debits in multi-line descriptions. StatementFlow collapses wrapped lines into a single ledger row and checks the closing total to the cent.",
    supportedAccountTypes: [
      "Wells Fargo Initiate Business Checking",
      "Wells Fargo Navigate & Optimize Business",
      "Wells Fargo Everyday Checking",
      "Wells Fargo Signify Business Cash Card",
    ],
    extractedColumns: [
      "Transaction Date",
      "Check / Serial Reference",
      "Counterparty & Memo",
      "Chart-of-Accounts Category",
      "Verified Debit / Credit Columns",
    ],
    specificFaqs: [
      {
        q: "What if my Wells Fargo PDF spans across two calendar years?",
        a: "StatementFlow infers the statement period header and assigns the exact 4-digit year to December and January rows automatically.",
      },
      {
        q: "Can I import the exported CSV directly into QuickBooks Online?",
        a: "Yes. Both signed-amount and split Debit/Credit columns are included in every CSV export.",
      },
    ],
  },
  {
    slug: "bank-of-america-to-quickbooks",
    institutionName: "Bank of America",
    shortName: "BofA to QuickBooks",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "QuickBooks CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Bank of America, straight to ledger.",
    heroSubheadline:
      "Extract Bank of America Advantage Business and Advantage Banking PDF statements into QuickBooks-ready CSV and reconciled Excel tabs in under two seconds.",
    statementQuirkTitle: "Parsing BofA Confirmation Numbers & Card Suffixes",
    statementQuirkDescription:
      "Bank of America appends 10-digit confirmation codes and cardholder suffixes to every line item. StatementFlow isolates the merchant name for clean QuickBooks vendor matching while keeping the confirmation code intact.",
    supportedAccountTypes: [
      "BofA Business Advantage Fundamentals",
      "BofA Business Advantage Relationship",
      "Bank of America SafeBalance & Plus Banking",
      "BofA Customized Cash Rewards Business",
    ],
    extractedColumns: [
      "Posting Date",
      "Clean Vendor Name for QuickBooks",
      "BofA Confirmation / DES Info",
      "Tax-Ready Expense Category",
      "Reconciled USD Amount",
    ],
    specificFaqs: [
      {
        q: "Why use StatementFlow when older Bank of America statements are PDF-only?",
        a: "Bank of America restricts native CSV downloads for archived historical periods. StatementFlow converts any archived PDF statement back into a reconciled spreadsheet.",
      },
      {
        q: "Does it verify the Bank of America Summary box on page 1?",
        a: "Yes. Opening balance, total deposits, and total subtractions are cross-checked against the sum of extracted rows.",
      },
    ],
  },
  {
    slug: "citibank-statement-to-excel",
    institutionName: "Citibank Commercial",
    shortName: "Citibank to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Citibank statements, balanced fast.",
    heroSubheadline:
      "Convert Citibank CitiBusiness Checking and Citigold multi-account PDF statements into two-tab Excel workbooks with automatic discrepancy detection.",
    statementQuirkTitle: "Separating Combined Citibank Checking & Savings Pages",
    statementQuirkDescription:
      "Citibank often bundles checking, money market, and CD summaries inside one consolidated PDF. StatementFlow targets the active transaction table and verifies the exact period opening and closing balances.",
    supportedAccountTypes: [
      "CitiBusiness Streamlined Checking",
      "CitiBusiness Flexible Checking",
      "Citigold & Citi Priority Accounts",
      "Citi Commercial Bank Treasury Ledgers",
    ],
    extractedColumns: [
      "Effective Date",
      "Payee / Originator",
      "Wire & ACH Reference",
      "Ledger Category",
      "Signed Amount (USD)",
    ],
    specificFaqs: [
      {
        q: "Can I edit a Citibank row before downloading the Excel file?",
        a: "Yes. Every merchant name, category, direction, and amount is editable inline inside the live studio, and the balance equation updates on every keystroke.",
      },
      {
        q: "Are international SWIFT wire descriptions preserved?",
        a: "All multi-line wire remittance notes are concatenated into a clean single-row description.",
      },
    ],
  },
  {
    slug: "mercury-bank-statement-to-csv",
    institutionName: "Mercury Financial",
    shortName: "Mercury Startup CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "QuickBooks CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Mercury statements, audit-ready.",
    heroSubheadline:
      "Turn Mercury Checking, Treasury, and IO Credit PDF statements into investor-grade Excel workbooks and categorized CSVs for startup bookkeeping.",
    statementQuirkTitle: "Reconciling Mercury Treasury Sweeps & IO Card Spend",
    statementQuirkDescription:
      "Venture-backed startups using Mercury frequently sweep funds between checking, FDIC vaults, and Treasury accounts. StatementFlow categorizes internal transfers separately from SaaS burn and customer revenue.",
    supportedAccountTypes: [
      "Mercury Commercial Checking",
      "Mercury Treasury & Vault Sweeps",
      "Mercury IO Corporate Credit Card",
      "Multi-Entity Venture Holding Accounts",
    ],
    extractedColumns: [
      "Settlement Date",
      "SaaS / Payroll Counterparty",
      "Raw Bank Descriptor",
      "Burn / Revenue Category",
      "Verified Net Cashflow",
    ],
    specificFaqs: [
      {
        q: "Does StatementFlow recognize AWS, Vercel, Figma, and Gusto payroll lines?",
        a: "Yes. Cloud infrastructure, SaaS tools, Stripe payouts, and payroll runs are automatically mapped to their matching accounting categories.",
      },
      {
        q: "Can fractional CFOs use this across multiple startup clients?",
        a: "Yes. The Bookkeeping Firm Pilot ($199 one-time) includes unlimited team seats and unlimited statement conversions across client books.",
      },
    ],
  },
  {
    slug: "stripe-invoice-to-excel",
    institutionName: "Stripe Billing & Payouts",
    shortName: "Stripe Invoice Excel",
    region: "Europe & Global",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "vercel-stripe-invoice",
    heroHeadline: "Stripe invoices, parsed to the cent.",
    heroSubheadline:
      "Extract line items, metered usage tiers, proration credits, and regional sales tax from Stripe Billing PDF invoices into structured Excel and JSON.",
    statementQuirkTitle: "Capturing Usage Tiers, Seat Prorations & Tax Lines",
    statementQuirkDescription:
      "Stripe tax invoices for AWS, Vercel, OpenAI, and B2B SaaS contain complex quantity multipliers and tax percentages. StatementFlow extracts each line item and verifies that subtotal plus tax equals the exact invoice total.",
    supportedAccountTypes: [
      "Stripe Billing B2B Tax Invoices",
      "Vercel / OpenAI / Supabase / Linear Invoices",
      "Stripe Merchant Payout Summary PDFs",
      "Multi-Currency SaaS Receipts",
    ],
    extractedColumns: [
      "Billing Date",
      "Vendor & Product Tier",
      "Quantity & Unit Description",
      "Allocated Tax Amount",
      "Line Item Gross Total",
    ],
    specificFaqs: [
      {
        q: "Can I test a real Stripe / Vercel Enterprise invoice right now?",
        a: "Yes. Click the button above to open the live studio with our verified Stripe Enterprise Tax Invoice preset preloaded.",
      },
      {
        q: "Does it extract the tax column separately for VAT/GST reclaim?",
        a: "Every row includes a dedicated Tax column alongside the net/gross amount in both Excel (.xlsx) and CSV exports.",
      },
    ],
  },
  {
    slug: "paypal-statement-to-csv",
    institutionName: "PayPal Business",
    shortName: "PayPal PDF to CSV",
    region: "Europe & Global",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "PayPal statements, reconciled clean.",
    heroSubheadline:
      "Convert PayPal Business monthly activity PDFs into balanced Excel and CSV spreadsheets with gross sales, processing fees, and bank withdrawals separated.",
    statementQuirkTitle: "Untangling PayPal Gross Receipts vs. Merchant Fees",
    statementQuirkDescription:
      "PayPal activity PDFs list gross incoming payments alongside separate fee deductions and currency conversions. StatementFlow classifies fees under Taxes & Fees so your net payout matches your ending PayPal balance.",
    supportedAccountTypes: [
      "PayPal Business Merchant Statements",
      "PayPal Working Capital & Zettle Summaries",
      "Multi-Currency PayPal Balance Ledgers",
      "E-Commerce Payout Reconciliation PDFs",
    ],
    extractedColumns: [
      "Transaction Date",
      "Buyer / Counterparty",
      "PayPal Transaction ID & Type",
      "Revenue vs. Fee Category",
      "Signed Net Impact",
    ],
    specificFaqs: [
      {
        q: "Does it prevent Excel from corrupting PayPal transaction IDs?",
        a: "Yes. Reference strings and formulas are escaped safely so Microsoft Excel never converts long IDs into scientific notation.",
      },
      {
        q: "Are GBP, EUR, and USD PayPal statements supported?",
        a: "StatementFlow detects the statement currency symbol automatically and formats all exported columns accordingly.",
      },
    ],
  },
  {
    slug: "wise-statement-to-xero",
    institutionName: "Wise (TransferWise)",
    shortName: "Wise Multi-Currency",
    region: "Europe & Global",
    defaultCurrency: "EUR",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Wise multi-currency, Xero-ready.",
    heroSubheadline:
      "Convert Wise Business GBP, EUR, and USD balance statements into clean Xero and QuickBooks CSVs with deterministic balance verification.",
    statementQuirkTitle: "Handling Wise FX Conversions & Reference Memos",
    statementQuirkDescription:
      "Wise statements include exchange rates, transfer fees, and IBAN/Sort Code details below each transaction. StatementFlow condenses each transfer into one clean accounting line and verifies the currencyjar closing balance.",
    supportedAccountTypes: [
      "Wise Business Multi-Currency Accounts",
      "Wise GBP Sort Code & EUR IBAN Ledgers",
      "Wise Corporate Debit Card Spend PDFs",
      "Cross-Border Contractor Payout Statements",
    ],
    extractedColumns: [
      "Value Date",
      "Recipient / Sender Name",
      "FX Rate & Transfer Reference",
      "Accounting Category",
      "Currency-Verified Amount",
    ],
    specificFaqs: [
      {
        q: "Does the exported CSV preserve £ and € symbols without garbled characters?",
        a: "Every CSV export starts with a standard UTF-8 BOM byte mark so Excel on both macOS and Windows renders £, €, and ¥ symbols cleanly.",
      },
      {
        q: "Can I switch currencies inside the workbench?",
        a: "Yes. USD, GBP, and EUR statements are supported natively with zero floating-point rounding errors.",
      },
    ],
  },
  {
    slug: "barclays-uk-statement-to-csv",
    institutionName: "Barclays Bank UK",
    shortName: "Barclays UK to CSV",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Barclays UK PDFs, balanced in GBP.",
    heroSubheadline:
      "Convert Barclays Business Current Account and Barclaycard PDF statements into Making Tax Digital (MTD) ready Excel and Xero CSV files.",
    statementQuirkTitle: "Normalizing UK DD/MM Dates & Giro Credits",
    statementQuirkDescription:
      "Barclays UK statements print dates in DD MMM format alongside Money Out and Money In columns. StatementFlow normalizes every date to ISO YYYY-MM-DD and checks your Start Balance + Money In - Money Out = End Balance.",
    supportedAccountTypes: [
      "Barclays Business Current Account",
      "Barclaycard Commercial & Select Cashback",
      "Barclays Premier & Personal Current Accounts",
      "Barclays GBP Treasury & Savings Statements",
    ],
    extractedColumns: [
      "ISO Date (YYYY-MM-DD)",
      "Payee / Direct Debit Originator",
      "Faster Payments / BACS Description",
      "UK Expense Category",
      "Verified GBP (£) Amount",
    ],
    specificFaqs: [
      {
        q: "Is StatementFlow compatible with Xero, FreeAgent, and Sage UK?",
        a: "Yes. The exported CSV and multi-sheet Excel files use standard ISO dates and split Debit/Credit columns ready for UK accounting software.",
      },
      {
        q: "How are UK VAT invoices handled?",
        a: "When you upload a UK VAT receipt or invoice, StatementFlow extracts the 20% VAT column separately for HMRC VAT return reconciliation.",
      },
    ],
  },
  {
    slug: "revolut-business-to-excel",
    institutionName: "Revolut Business",
    shortName: "Revolut to Excel",
    region: "Europe & Global",
    defaultCurrency: "EUR",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Revolut Business, verified to zero.",
    heroSubheadline:
      "Parse Revolut Business EUR, GBP, and USD monthly statement PDFs into two-worksheet Excel files with automated merchant categorization.",
    statementQuirkTitle: "Separating Revolut Card Spend, Fee Lines & Top-Ups",
    statementQuirkDescription:
      "Revolut PDF statements list card authorizations, FX markups, and subscription fees in dense tables. StatementFlow structures every row and checks the exact account summary equation.",
    supportedAccountTypes: [
      "Revolut Business Grow, Scale & Enterprise",
      "Revolut Corporate Physical & Virtual Cards",
      "Revolut EUR IBAN & GBP Local Accounts",
      "Revolut Pro Freelancer Statements",
    ],
    extractedColumns: [
      "Completed Date",
      "Merchant / Counterparty",
      "Card & Reference Details",
      "Operating Category",
      "Reconciled Amount & Tax",
    ],
    specificFaqs: [
      {
        q: "Does Creem.io handle EU and UK VAT for Revolut Business customers?",
        a: "Yes. When unlocking StatementFlow Pro ($29 one-time), Creem.io acts as Merchant of Record and automatically issues compliant EU/UK VAT invoices.",
      },
      {
        q: "Can I export JSON for automated ERP ingestion?",
        a: "Every extraction can be downloaded or copied as strict schema-validated JSON in one click.",
      },
    ],
  },
  {
    slug: "hsbc-commercial-statement-to-excel",
    institutionName: "HSBC Commercial Banking",
    shortName: "HSBC PDF to Excel",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "HSBC statements, zero drift.",
    heroSubheadline:
      "Convert HSBC Kinetic, HSBCnet, and Business Banking PDF statements into reconciled Excel workbooks without manual data entry.",
    statementQuirkTitle: "Reconstructing HSBC Balance Brought Forward Rows",
    statementQuirkDescription:
      "HSBC statements insert 'BALANCE BROUGHT FORWARD' and 'BALANCE CARRIED FORWARD' rows at the top and bottom of every page. StatementFlow filters out page-break subtotals so your transaction table never double-counts.",
    supportedAccountTypes: [
      "HSBC UK Business Banking & Kinetic",
      "HSBCnet Corporate Multi-Currency",
      "HSBC Global Wallet Statements",
      "HSBC Commercial Card Summaries",
    ],
    extractedColumns: [
      "Transaction Date",
      "Beneficiary / Payee",
      "Payment Type (BP / DD / CR / DR)",
      "Expense Classification",
      "Verified GBP / USD Amount",
    ],
    specificFaqs: [
      {
        q: "Are HSBC 'Balance Brought Forward' lines excluded from transaction totals?",
        a: "Yes. Page-break carry-forward lines are stripped automatically so your total credits and debits reconcile accurately.",
      },
      {
        q: "Does StatementFlow store HSBC PDF files on disk?",
        a: "Never. Files are parsed in memory and discarded immediately after returning the structured JSON response.",
      },
    ],
  },
  {
    slug: "amazon-uk-vat-invoice-to-excel",
    institutionName: "Amazon Business EU & UK",
    shortName: "Amazon VAT to Excel",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Amazon VAT invoices, itemized clean.",
    heroSubheadline:
      "Extract hardware, office supplies, courier charges, and 20% UK/EU VAT breakdowns from Amazon Business PDF invoices into multi-sheet Excel workbooks.",
    statementQuirkTitle: "Matching Line-Item VAT to Invoice Grand Totals",
    statementQuirkDescription:
      "Amazon Business VAT invoices list unit prices, net amounts, VAT rates, and gross totals across multiple columns. StatementFlow captures each item's gross and VAT amount and verifies the invoice total to the penny.",
    supportedAccountTypes: [
      "Amazon Business UK VAT Invoices (GB Reg)",
      "Amazon Business EU S.a.r.l. Tax Receipts",
      "Commercial Hardware & IT Procurement Bills",
      "Multi-Item E-Commerce Expense Receipts",
    ],
    extractedColumns: [
      "Invoice Date",
      "Vendor & Order Reference",
      "Itemized Product Description",
      "Reclaimable VAT (£ / €)",
      "Gross Line Total",
    ],
    specificFaqs: [
      {
        q: "Can I preview a real Amazon Business UK VAT invoice right now?",
        a: "Yes. Click 'Launch Studio with Amazon UK Sample' above to load our verified GBP VAT invoice preset immediately.",
      },
      {
        q: "Does the Excel export include both items and the VAT reconciliation summary?",
        a: "Yes. Worksheet 1 contains every itemized row with its VAT column, and Worksheet 2 contains the full reconciliation summary.",
      },
    ],
  },
  {
    slug: "payoneer-statement-to-excel",
    institutionName: "Payoneer Global Payments",
    shortName: "Payoneer to Excel",
    region: "Europe & Global",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "vercel-stripe-invoice",
    heroHeadline: "Payoneer payouts, reconciled clean.",
    heroSubheadline:
      "Convert Payoneer monthly PDF statements and multi-currency receiving account ledgers into balanced Excel workbooks for cross-border e-commerce accounting.",
    statementQuirkTitle: "Separating FX Conversions & Marketplace Payouts",
    statementQuirkDescription:
      "Payoneer PDFs mix marketplace inflows (Amazon, Walmart, Upwork), FX conversion legs, and withdrawal fees. StatementFlow preserves reference IDs and verifies net balances to $0.01.",
    supportedAccountTypes: ["Payoneer USD/EUR/GBP Receiving Accounts", "Marketplace Payout Statements"],
    extractedColumns: ["Date", "Marketplace / Counterparty", "Transaction ID", "Fee / FX", "Net Amount"],
    specificFaqs: [
      { q: "Does it support multi-currency Payoneer statements?", a: "Yes. USD, EUR, and GBP balances are parsed without cross-currency float drift." },
    ],
  },
  {
    slug: "airwallex-statement-to-csv",
    institutionName: "Airwallex Business Account",
    shortName: "Airwallex to CSV",
    region: "Europe & Global",
    defaultCurrency: "USD",
    targetFormat: "QuickBooks CSV",
    recommendedSampleId: "vercel-stripe-invoice",
    heroHeadline: "Airwallex global accounts to CSV.",
    heroSubheadline:
      "Parse Airwallex Global Account monthly PDFs, Borderless Card spend, and multi-currency FX transfers into audit-ready QuickBooks and Xero CSVs.",
    statementQuirkTitle: "Handling Multi-Wallet Airwallex PDFs",
    statementQuirkDescription:
      "Airwallex statements group wallet balances by currency with interleaved FX settlements. StatementFlow extracts each line deterministically and validates ending balances.",
    supportedAccountTypes: ["Airwallex Global Accounts", "Airwallex Borderless Corporate Cards"],
    extractedColumns: ["Settlement Date", "Merchant / Wallet", "Reference", "Currency", "Signed Amount"],
    specificFaqs: [
      { q: "Can I import the exported CSV into Xero or QuickBooks?", a: "Yes. Both Date/Description/Amount and separate Debit/Credit columns are included." },
    ],
  },
  {
    slug: "brex-corporate-card-to-excel",
    institutionName: "Brex Corporate Card & Cash",
    shortName: "Brex PDF to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Brex card statements to Excel.",
    heroSubheadline:
      "Transform Brex Business Account and Corporate Card PDF statements into clean Excel sheets with cardholder merchant names and cent-accurate totals.",
    statementQuirkTitle: "Reconciling Card Swipes & Statement Credits",
    statementQuirkDescription:
      "Brex statements combine pending settlements, cashback credits, and multi-card charges. StatementFlow normalizes credits and debits and proves zero drift.",
    supportedAccountTypes: ["Brex Business Cash Account", "Brex Corporate Credit Card"],
    extractedColumns: ["Post Date", "Merchant", "Cardholder / Memo", "Category", "Amount (USD)"],
    specificFaqs: [
      { q: "Are Brex cashback rewards separated from spend?", a: "Yes. Credits and charges are cleanly signed and summarized in the reconciliation sheet." },
    ],
  },
  {
    slug: "ramp-statement-to-quickbooks",
    institutionName: "Ramp Corporate Card & Treasury",
    shortName: "Ramp to QuickBooks",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "QuickBooks CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Ramp statements ready for QuickBooks.",
    heroSubheadline:
      "Convert Ramp Business Corporation monthly PDF statements into QuickBooks-ready CSVs with deterministic balance verification.",
    statementQuirkTitle: "Cleaning Multi-Line SaaS Vendor Memos",
    statementQuirkDescription:
      "Ramp PDFs include multi-line vendor memos and department tags. StatementFlow merges wrapped rows cleanly without breaking amount alignment.",
    supportedAccountTypes: ["Ramp Corporate Card", "Ramp Business Treasury"],
    extractedColumns: ["Transaction Date", "Vendor", "Department Memo", "Category", "Signed Amount"],
    specificFaqs: [
      { q: "Does it prevent CSV formula injection on vendor memos?", a: "Yes. Any leading =, +, -, or @ in vendor strings is safely escaped." },
    ],
  },
  {
    slug: "amex-business-statement-to-excel",
    institutionName: "American Express Business",
    shortName: "Amex PDF to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Amex Business PDFs to verified Excel.",
    heroSubheadline:
      "Extract American Express Business Platinum, Gold, and Blue Business Plus PDF statements into reconciled Excel workbooks in seconds.",
    statementQuirkTitle: "Handling Multi-Cardholder Sub-Sections",
    statementQuirkDescription:
      "Amex statements split charges by employee cardholder across dozens of pages. StatementFlow flattens all cardholder blocks and verifies total charges + payments.",
    supportedAccountTypes: ["Amex Business Platinum / Gold", "Amex Blue Business Cash"],
    extractedColumns: ["Date", "Merchant", "Cardholder", "Category", "Signed Amount"],
    specificFaqs: [
      { q: "Are employee card subtotals double-counted?", a: "No. Section summary rows are excluded from transaction sums so the balance gate stays exact." },
    ],
  },
  {
    slug: "capital-one-statement-to-csv",
    institutionName: "Capital One Spark Business",
    shortName: "Capital One to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Capital One Spark statements to CSV.",
    heroSubheadline:
      "Convert Capital One Spark Business Checking and Credit Card PDFs into clean, reconciled CSV and Excel ledgers.",
    statementQuirkTitle: "Normalizing Capital One Multi-Column Tables",
    statementQuirkDescription:
      "Capital One separates Credits, Debits, and Daily Balances across wide PDF tables. StatementFlow aligns every transaction row and checks ending balance parity.",
    supportedAccountTypes: ["Spark Business Checking", "Spark Cash Plus Card"],
    extractedColumns: ["Date", "Description", "Debit", "Credit", "Signed Amount"],
    specificFaqs: [
      { q: "Can I export both Excel and CSV?", a: "Yes, every parsed statement supports .xlsx, .csv, and QuickBooks JSON." },
    ],
  },
  {
    slug: "td-bank-statement-to-excel",
    institutionName: "TD Bank Business",
    shortName: "TD Bank PDF to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "TD Bank PDFs converted with zero drift.",
    heroSubheadline:
      "Turn TD Bank Business Checking and TD Canada Trust PDF statements into structured Excel workbooks with automated opening-to-closing balance verification.",
    statementQuirkTitle: "Merging TD Check Images & ACH Batches",
    statementQuirkDescription:
      "TD Bank statements list check serial numbers alongside multi-line ACH descriptions. StatementFlow keeps check references intact without splitting rows.",
    supportedAccountTypes: ["TD Business Convenience Plus", "TD Commercial Checking"],
    extractedColumns: ["Posting Date", "Description", "Check / Ref", "Debit / Credit", "Balance"],
    specificFaqs: [
      { q: "Does it work for both US and Canadian TD PDFs?", a: "Yes, multi-format date and currency normalization handles both US and CA layouts." },
    ],
  },
  {
    slug: "rbc-royal-bank-statement-to-csv",
    institutionName: "RBC Royal Bank Business",
    shortName: "RBC PDF to CSV",
    region: "Europe & Global",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "RBC business statements to CSV.",
    heroSubheadline:
      "Extract RBC Royal Bank Business Account PDF statements into QuickBooks and Xero compatible CSVs without manual re-typing.",
    statementQuirkTitle: "Handling RBC Bilingual & Multi-Line Descriptions",
    statementQuirkDescription:
      "RBC PDFs often wrap merchant names and Interac e-Transfer memos across two lines. StatementFlow reconstructs each complete entry before summing.",
    supportedAccountTypes: ["RBC Business Everyday Checking", "RBC Commercial Accounts"],
    extractedColumns: ["Date", "Description", "Interac / Ref", "Category", "Signed Amount"],
    specificFaqs: [
      { q: "Are Interac e-Transfers preserved accurately?", a: "Yes. Sender/recipient names and transfer IDs remain in the Description column." },
    ],
  },
  {
    slug: "monzo-business-statement-to-csv",
    institutionName: "Monzo Business UK",
    shortName: "Monzo Business to CSV",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Monzo Business PDFs to Xero CSV.",
    heroSubheadline:
      "Convert Monzo Business Pro and Lite UK GBP PDF statements into clean Xero and Excel files verified to £0.01.",
    statementQuirkTitle: "Stripping Pot Transfers from P&L Spend",
    statementQuirkDescription:
      "Monzo statements interleave internal Tax Pot transfers with external Faster Payments. StatementFlow flags internal transfers cleanly for UK bookkeeping.",
    supportedAccountTypes: ["Monzo Business Lite", "Monzo Business Pro"],
    extractedColumns: ["Date", "Counterparty", "Payment Type", "Category", "Amount (GBP)"],
    specificFaqs: [
      { q: "Does it format dates for UK Xero imports?", a: "Yes. Standardized ISO and UK accounting columns are generated cleanly." },
    ],
  },
  {
    slug: "starling-bank-statement-to-excel",
    institutionName: "Starling Bank Business",
    shortName: "Starling PDF to Excel",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Starling Business statements to Excel.",
    heroSubheadline:
      "Parse Starling Bank UK Business GBP and EUR PDF statements into audit-ready Excel workbooks with deterministic cent-level checks.",
    statementQuirkTitle: "Handling Faster Payments & Direct Debits",
    statementQuirkDescription:
      "Starling PDFs include payment type badges and running GBP balances. StatementFlow validates every transaction against the opening and closing balance.",
    supportedAccountTypes: ["Starling Business Account", "Starling Sole Trader Account"],
    extractedColumns: ["Date", "Counterparty", "Type", "Category", "Signed Amount (GBP)"],
    specificFaqs: [
      { q: "Is the raw statement uploaded to third parties?", a: "No. Default heuristic mode runs locally without external LLM API keys." },
    ],
  },
  {
    slug: "n26-business-statement-to-csv",
    institutionName: "N26 Business Europe",
    shortName: "N26 PDF to CSV",
    region: "Europe & Global",
    defaultCurrency: "EUR",
    targetFormat: "CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "N26 Business EUR PDFs to CSV.",
    heroSubheadline:
      "Convert N26 Business Standard, Smart, and Metal EUR statements into clean CSV and Excel tables with European decimal normalization.",
    statementQuirkTitle: "Normalizing European Comma Decimals (1.234,56)",
    statementQuirkDescription:
      "N26 EUR statements use European thousand-dot and decimal-comma formatting. StatementFlow converts 1.234,56 into exact integer cents before reconciling.",
    supportedAccountTypes: ["N26 Business Standard / Metal", "SEPA EUR Accounts"],
    extractedColumns: ["Booking Date", "Payee", "IBAN / Reference", "Category", "Amount (EUR)"],
    specificFaqs: [
      { q: "Does it handle SEPA IBAN references properly?", a: "Yes. Full SEPA end-to-end references are retained without truncation." },
    ],
  },
  {
    slug: "dbs-business-statement-to-excel",
    institutionName: "DBS IDEAL Business Singapore",
    shortName: "DBS PDF to Excel",
    region: "Europe & Global",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "DBS Business PDFs to verified Excel.",
    heroSubheadline:
      "Extract DBS IDEAL Corporate Multi-Currency and SGD/USD monthly PDF statements into balanced Excel workbooks for APAC finance teams.",
    statementQuirkTitle: "Handling Multi-Line GIRO & FAST References",
    statementQuirkDescription:
      "DBS statements wrap FAST, PayNow, and GIRO remittance memos across 3–4 lines. StatementFlow stitches wrapped lines accurately and verifies closing balances.",
    supportedAccountTypes: ["DBS Business Multi-Currency Account", "DBS IDEAL Corporate"],
    extractedColumns: ["Value Date", "Description", "FAST / GIRO Ref", "Debit / Credit", "Balance"],
    specificFaqs: [
      { q: "Does it work for DBS USD and SGD statements?", a: "Yes. Multi-currency symbols and exact decimal reconciliation work out of the box." },
    ],
  },
  {
    slug: "ocbc-business-statement-to-csv",
    institutionName: "OCBC Business Banking",
    shortName: "OCBC PDF to CSV",
    region: "Europe & Global",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "OCBC Business PDFs to clean CSV.",
    heroSubheadline:
      "Convert OCBC Velocity corporate bank statements into clean CSV and Xero/QuickBooks import files with zero rounding errors.",
    statementQuirkTitle: "Preserving Remittance & Telegraphic Transfer IDs",
    statementQuirkDescription:
      "OCBC statements include TT wire codes and multi-line beneficiary notes. StatementFlow preserves full audit trails in the exported ledger.",
    supportedAccountTypes: ["OCBC Business Growth Account", "OCBC Multi-Currency Corporate"],
    extractedColumns: ["Date", "Beneficiary / Sender", "TT / GIRO Ref", "Category", "Signed Amount"],
    specificFaqs: [
      { q: "Can finance teams export directly to Xero?", a: "Yes, Xero and QuickBooks compatible CSV formats are built in." },
    ],
  },
  {
    slug: "square-payout-statement-to-excel",
    institutionName: "Square / Block Seller Payouts",
    shortName: "Square PDF to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "vercel-stripe-invoice",
    heroHeadline: "Square payouts & fees reconciled.",
    heroSubheadline:
      "Convert Square monthly processing statements and deposit summaries into clean Excel sheets separating gross sales, Square fees, and net bank deposits.",
    statementQuirkTitle: "Reconciling Gross Card Sales vs Net Deposits",
    statementQuirkDescription:
      "Square statements report gross sales, refunds, processing fees, and net transfers separately. StatementFlow proves Gross - Fees - Refunds == Net Deposit.",
    supportedAccountTypes: ["Square POS Monthly Summaries", "Square Banking Checking"],
    extractedColumns: ["Date", "Payout / Batch ID", "Gross Sales", "Processing Fee", "Net Deposit"],
    specificFaqs: [
      { q: "Are Square processing fees separated automatically?", a: "Yes. Fee deductions are broken out cleanly for P&L categorization." },
    ],
  },
  {
    slug: "shopify-payouts-statement-to-csv",
    institutionName: "Shopify Payments Payouts",
    shortName: "Shopify Payouts to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "QuickBooks CSV",
    recommendedSampleId: "vercel-stripe-invoice",
    heroHeadline: "Shopify Payments payouts to QuickBooks.",
    heroSubheadline:
      "Extract Shopify Payments payout summaries, chargebacks, and merchant fees from PDF statements into balanced QuickBooks and Xero CSVs.",
    statementQuirkTitle: "Balancing Multi-Order Payout Batches",
    statementQuirkDescription:
      "Shopify batches hundreds of card orders into single bank payouts minus fees and reserves. StatementFlow reconciles payout totals to $0.01.",
    supportedAccountTypes: ["Shopify Payments Payout PDFs", "Shopify Balance Statements"],
    extractedColumns: ["Payout Date", "Payout ID", "Charges & Refunds", "Shopify Fees", "Net Payout"],
    specificFaqs: [
      { q: "Does it work alongside Shopify Balance PDFs?", a: "Yes. Both payout summaries and Shopify Balance account statements are supported." },
    ],
  },
  {
    slug: "quickbooks-bank-feed-csv-converter",
    institutionName: "QuickBooks Online Bank Feed",
    shortName: "PDF to QuickBooks CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "QuickBooks CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Any bank PDF to QuickBooks 3-column CSV.",
    heroSubheadline:
      "Bypass broken bank feeds by converting any historical bank PDF statement into QuickBooks Online's exact Date, Description, and Amount CSV schema.",
    statementQuirkTitle: "Eliminating QuickBooks CSV Import Rejections",
    statementQuirkDescription:
      "QuickBooks rejects CSVs with currency symbols, stray commas, or unbalanced rows. StatementFlow formats clean ISO dates, numeric signed amounts, and verifies totals.",
    supportedAccountTypes: ["QuickBooks 3-Column & 4-Column CSV", "Historical Multi-Year Backfills"],
    extractedColumns: ["Date (MM/DD/YYYY)", "Description", "Credit / Debit", "Category", "Signed Amount"],
    specificFaqs: [
      { q: "Why use StatementFlow instead of manual copy-paste?", a: "Our deterministic balance gate guarantees Opening + Sum == Closing before you import into QuickBooks." },
    ],
  },
  {
    slug: "xero-bank-statement-csv-converter",
    institutionName: "Xero Accounting Bank Feed",
    shortName: "PDF to Xero CSV",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Any bank PDF to Xero-ready CSV.",
    heroSubheadline:
      "Convert missing historical bank statements from PDF into Xero's exact bank statement import format with cent-level double-entry verification.",
    statementQuirkTitle: "Formatting Payee, Reference & Amount for Xero",
    statementQuirkDescription:
      "Xero requires strict Date, Amount, Payee, Description, and Reference headers. StatementFlow outputs clean importable files verified to $0.01 / £0.01.",
    supportedAccountTypes: ["Xero Manual Bank Statement Import", "Multi-Currency UK/AU/NZ Ledgers"],
    extractedColumns: ["Date", "Amount", "Payee", "Description", "Reference"],
    specificFaqs: [
      { q: "Will Xero reject rows with special characters?", a: "No. All fields are sanitized and formula-injection escaped." },
    ],
  },
  {
    slug: "first-citizens-svb-statement-to-excel",
    institutionName: "Silicon Valley Bank (First Citizens)",
    shortName: "SVB PDF to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "SVB Commercial PDFs to verified Excel.",
    heroSubheadline:
      "Convert Silicon Valley Bank / First Citizens Commercial Checking and Money Market PDF statements into audit-ready Excel workbooks.",
    statementQuirkTitle: "Handling Startup Treasury Sweep & Wire Memos",
    statementQuirkDescription:
      "SVB statements contain overnight sweep transfers and lengthy Fedwire beneficiary blocks. StatementFlow separates sweep legs and proves balance parity.",
    supportedAccountTypes: ["SVB Commercial Checking", "Startup Money Market & Sweep Accounts"],
    extractedColumns: ["Effective Date", "Wire / ACH Description", "Reference ID", "Category", "Signed Amount"],
    specificFaqs: [
      { q: "Can it process multi-year historical SVB PDFs?", a: "Yes. Multi-page commercial statements are parsed and verified page by page." },
    ],
  },

  {
    slug: "pnc-bank-statement-to-excel",
    institutionName: "PNC Bank",
    shortName: "PNC Bank PDF to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "PNC Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert PNC Bank PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling PNC Bank Statement Formatting",
    statementQuirkDescription:
      "PNC Bank PDF statements often contain multi-section Activity Detail tables and daily balance summaries. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "PNC Business Checking & Virtual Wallet",
      "PNC Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my PNC Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my PNC Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "us-bank-statement-to-csv",
    institutionName: "U.S. Bank",
    shortName: "U.S. Bank to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "U.S. Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert U.S. Bank PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling U.S. Bank Statement Formatting",
    statementQuirkDescription:
      "U.S. Bank PDF statements often contain split Customer Deposits, Other Withdrawals, and card purchase blocks. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "U.S. Bank Silver/Gold Business Checking",
      "U.S. Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my U.S. Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my U.S. Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "truist-bank-statement-to-excel",
    institutionName: "Truist Bank",
    shortName: "Truist PDF to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Truist Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert Truist Bank PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Truist Bank Statement Formatting",
    statementQuirkDescription:
      "Truist Bank PDF statements often contain merged SunTrust/BB&T legacy layout headers and multi-line ACH descriptions. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Truist Simple/Dynamic Business Checking",
      "Truist Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Truist Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Truist Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "discover-card-statement-to-csv",
    institutionName: "Discover Card",
    shortName: "Discover PDF to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Discover Card PDFs, verified to zero.",
    heroSubheadline:
      "Convert Discover Card PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Discover Card Statement Formatting",
    statementQuirkDescription:
      "Discover Card PDF statements often contain split Transaction Date vs. Post Date columns and cashback credit lines. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Discover it Business & Cash Back Cards",
      "Discover Card Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Discover Card PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Discover Card PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "citizens-bank-statement-to-excel",
    institutionName: "Citizens Bank",
    shortName: "Citizens Bank to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Citizens Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert Citizens Bank PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Citizens Bank Statement Formatting",
    statementQuirkDescription:
      "Citizens Bank PDF statements often contain wrapped debit card merchant strings and interleaved check serial tables. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Citizens Clearly Better Business Checking",
      "Citizens Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Citizens Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Citizens Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "fifth-third-bank-statement-to-csv",
    institutionName: "Fifth Third Bank",
    shortName: "Fifth Third to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Fifth Third Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert Fifth Third Bank PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Fifth Third Bank Statement Formatting",
    statementQuirkDescription:
      "Fifth Third Bank PDF statements often contain multi-column Withdrawals/Deposits with separate daily ledger balances. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Fifth Third Business Standard Checking",
      "Fifth Third Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Fifth Third Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Fifth Third Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "regions-bank-statement-to-excel",
    institutionName: "Regions Bank",
    shortName: "Regions Bank to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Regions Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert Regions Bank PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Regions Bank Statement Formatting",
    statementQuirkDescription:
      "Regions Bank PDF statements often contain grouped ACH debits, card swipes, and check-clearing blocks. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Regions LifeGreen & Business Checking",
      "Regions Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Regions Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Regions Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "keybank-statement-to-csv",
    institutionName: "KeyBank",
    shortName: "KeyBank PDF to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "KeyBank PDFs, verified to zero.",
    heroSubheadline:
      "Convert KeyBank PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling KeyBank Statement Formatting",
    statementQuirkDescription:
      "KeyBank PDF statements often contain long wire reference memos and commercial analysis fee rows. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "KeyBank Basic & Commercial Business Checking",
      "KeyBank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my KeyBank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my KeyBank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "mt-bank-statement-to-excel",
    institutionName: "M&T Bank",
    shortName: "M&T Bank to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "M&T Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert M&T Bank PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling M&T Bank Statement Formatting",
    statementQuirkDescription:
      "M&T Bank PDF statements often contain multi-page electronic transaction grids and check image footers. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "M&T Simple Checking for Business",
      "M&T Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my M&T Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my M&T Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "huntington-bank-statement-to-csv",
    institutionName: "Huntington Bank",
    shortName: "Huntington to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Huntington Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert Huntington Bank PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Huntington Bank Statement Formatting",
    statementQuirkDescription:
      "Huntington Bank PDF statements often contain wrapped POS merchant locations and ACH trace numbers. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Huntington Unlimited Business Checking",
      "Huntington Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Huntington Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Huntington Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "bmo-us-statement-to-excel",
    institutionName: "BMO Bank (US)",
    shortName: "BMO US PDF to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "BMO Bank (US) PDFs, verified to zero.",
    heroSubheadline:
      "Convert BMO Bank (US) PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling BMO Bank (US) Statement Formatting",
    statementQuirkDescription:
      "BMO Bank (US) PDF statements often contain dual-section deposit/withdrawal formatting and daily balance snapshots. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "BMO Business Checking (formerly BMO Harris)",
      "BMO Bank (US) Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my BMO Bank (US) PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my BMO Bank (US) PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "ally-bank-statement-to-csv",
    institutionName: "Ally Bank",
    shortName: "Ally Bank to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Ally Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert Ally Bank PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Ally Bank Statement Formatting",
    statementQuirkDescription:
      "Ally Bank PDF statements often contain interest accrual rows, bucket transfers, and running balance columns. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Ally Spending & High-Yield Savings",
      "Ally Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Ally Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Ally Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "sofi-bank-statement-to-excel",
    institutionName: "SoFi Bank",
    shortName: "SoFi PDF to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "SoFi Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert SoFi Bank PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling SoFi Bank Statement Formatting",
    statementQuirkDescription:
      "SoFi Bank PDF statements often contain vault sub-account transfers and multi-line card authorization descriptors. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "SoFi Checking, Savings & Vaults",
      "SoFi Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my SoFi Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my SoFi Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "chime-bank-statement-to-csv",
    institutionName: "Chime",
    shortName: "Chime PDF to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Chime PDFs, verified to zero.",
    heroSubheadline:
      "Convert Chime PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Chime Statement Formatting",
    statementQuirkDescription:
      "Chime PDF statements often contain mobile-first PDF statement tables with split transfer and card sections. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Chime Checking & Credit Builder",
      "Chime Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Chime PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Chime PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "navy-federal-statement-to-excel",
    institutionName: "Navy Federal Credit Union",
    shortName: "Navy Federal to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Navy Federal Credit Union PDFs, verified to zero.",
    heroSubheadline:
      "Convert Navy Federal Credit Union PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Navy Federal Credit Union Statement Formatting",
    statementQuirkDescription:
      "Navy Federal Credit Union PDF statements often contain combined checking/savings/share-certificate pages inside one monthly PDF. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "NFCU Business & Personal Checking",
      "Navy Federal Credit Union Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Navy Federal Credit Union PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Navy Federal Credit Union PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "usaa-bank-statement-to-csv",
    institutionName: "USAA Federal Savings Bank",
    shortName: "USAA PDF to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "USAA Federal Savings Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert USAA Federal Savings Bank PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling USAA Federal Savings Bank Statement Formatting",
    statementQuirkDescription:
      "USAA Federal Savings Bank PDF statements often contain multi-account PDF packets with separate debit/credit columns. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "USAA Classic Checking & Credit Cards",
      "USAA Federal Savings Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my USAA Federal Savings Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my USAA Federal Savings Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "charles-schwab-statement-to-excel",
    institutionName: "Charles Schwab Bank",
    shortName: "Charles Schwab to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Charles Schwab Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert Charles Schwab Bank PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Charles Schwab Bank Statement Formatting",
    statementQuirkDescription:
      "Charles Schwab Bank PDF statements often contain mixed cash management transactions, ATM fee rebates, and wire transfers. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Schwab Investor Checking & Brokerage",
      "Charles Schwab Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Charles Schwab Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Charles Schwab Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "fidelity-cash-management-to-csv",
    institutionName: "Fidelity Cash Management",
    shortName: "Fidelity PDF to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Fidelity Cash Management PDFs, verified to zero.",
    heroSubheadline:
      "Convert Fidelity Cash Management PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Fidelity Cash Management Statement Formatting",
    statementQuirkDescription:
      "Fidelity Cash Management PDF statements often contain core sweep redemptions interleaved with debit card and ACH bill pay rows. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Fidelity CMA & Core Money Market",
      "Fidelity Cash Management Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Fidelity Cash Management PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Fidelity Cash Management PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "relay-financial-statement-to-quickbooks",
    institutionName: "Relay Financial",
    shortName: "Relay to QuickBooks",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "QuickBooks CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Relay Financial PDFs, verified to zero.",
    heroSubheadline:
      "Convert Relay Financial PDF statements into clean QuickBooks CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Relay Financial Statement Formatting",
    statementQuirkDescription:
      "Relay Financial PDF statements often contain Profit First sub-account transfers and team virtual card expenses. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Relay Multi-Account Business Checking",
      "Relay Financial Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Relay Financial PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Relay Financial PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "novo-bank-statement-to-csv",
    institutionName: "Novo Business Banking",
    shortName: "Novo PDF to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Novo Business Banking PDFs, verified to zero.",
    heroSubheadline:
      "Convert Novo Business Banking PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Novo Business Banking Statement Formatting",
    statementQuirkDescription:
      "Novo Business Banking PDF statements often contain Reserve allocations, Stripe instant payouts, and ACH vendor payments. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Novo Small Business Checking & Reserves",
      "Novo Business Banking Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Novo Business Banking PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Novo Business Banking PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "bluevine-statement-to-quickbooks",
    institutionName: "Bluevine Business Banking",
    shortName: "Bluevine to QuickBooks",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "QuickBooks CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Bluevine Business Banking PDFs, verified to zero.",
    heroSubheadline:
      "Convert Bluevine Business Banking PDF statements into clean QuickBooks CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Bluevine Business Banking Statement Formatting",
    statementQuirkDescription:
      "Bluevine Business Banking PDF statements often contain sub-account transfers, bill-pay batches, and interest payout rows. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Bluevine Business Checking & Line of Credit",
      "Bluevine Business Banking Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Bluevine Business Banking PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Bluevine Business Banking PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "found-banking-statement-to-csv",
    institutionName: "Found Business Banking",
    shortName: "Found PDF to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Found Business Banking PDFs, verified to zero.",
    heroSubheadline:
      "Convert Found Business Banking PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Found Business Banking Statement Formatting",
    statementQuirkDescription:
      "Found Business Banking PDF statements often contain automatic tax-pocket set-asides and Schedule C expense tags. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Found Self-Employed Checking & Tax Pockets",
      "Found Business Banking Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Found Business Banking PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Found Business Banking PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "lili-bank-statement-to-excel",
    institutionName: "Lili Banking",
    shortName: "Lili PDF to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Lili Banking PDFs, verified to zero.",
    heroSubheadline:
      "Convert Lili Banking PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Lili Banking Statement Formatting",
    statementQuirkDescription:
      "Lili Banking PDF statements often contain emergency bucket transfers and wrapped merchant descriptions. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Lili Freelancer & Small Business Checking",
      "Lili Banking Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Lili Banking PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Lili Banking PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "grasshopper-bank-statement-to-csv",
    institutionName: "Grasshopper Bank",
    shortName: "Grasshopper to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Grasshopper Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert Grasshopper Bank PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Grasshopper Bank Statement Formatting",
    statementQuirkDescription:
      "Grasshopper Bank PDF statements often contain startup ACH batches, wire transfers, and cash-back credit lines. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Grasshopper Innovator Business Checking",
      "Grasshopper Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Grasshopper Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Grasshopper Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "bill-divvy-statement-to-quickbooks",
    institutionName: "BILL Spend & Expense (Divvy)",
    shortName: "BILL / Divvy to QuickBooks",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "QuickBooks CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "BILL Spend & Expense (Divvy) PDFs, verified to zero.",
    heroSubheadline:
      "Convert BILL Spend & Expense (Divvy) PDF statements into clean QuickBooks CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling BILL Spend & Expense (Divvy) Statement Formatting",
    statementQuirkDescription:
      "BILL Spend & Expense (Divvy) PDF statements often contain budget-grouped card transactions and multi-department merchant memos. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "BILL Corporate Card & AP Statements",
      "BILL Spend & Expense (Divvy) Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my BILL Spend & Expense (Divvy) PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my BILL Spend & Expense (Divvy) PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "amex-personal-card-to-csv",
    institutionName: "American Express Personal",
    shortName: "Amex Card to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "American Express Personal PDFs, verified to zero.",
    heroSubheadline:
      "Convert American Express Personal PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling American Express Personal Statement Formatting",
    statementQuirkDescription:
      "American Express Personal PDF statements often contain cardmember sub-sections, foreign FX conversion lines, and statement credits. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Amex Platinum, Gold & Blue Cash PDFs",
      "American Express Personal Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my American Express Personal PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my American Express Personal PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "citi-business-card-to-excel",
    institutionName: "Citi Commercial & Credit Cards",
    shortName: "Citi Card to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Citi Commercial & Credit Cards PDFs, verified to zero.",
    heroSubheadline:
      "Convert Citi Commercial & Credit Cards PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Citi Commercial & Credit Cards Statement Formatting",
    statementQuirkDescription:
      "Citi Commercial & Credit Cards PDF statements often contain split sale/post dates and multi-cardholder subtotal blocks. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Citi Custom Cash & Costco Anywhere",
      "Citi Commercial & Credit Cards Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Citi Commercial & Credit Cards PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Citi Commercial & Credit Cards PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "chase-credit-card-to-quickbooks",
    institutionName: "Chase Credit Card (Sapphire / Ink)",
    shortName: "Chase Card to QuickBooks",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "QuickBooks CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Chase Credit Card (Sapphire / Ink) PDFs, verified to zero.",
    heroSubheadline:
      "Convert Chase Credit Card (Sapphire / Ink) PDF statements into clean QuickBooks CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Chase Credit Card (Sapphire / Ink) Statement Formatting",
    statementQuirkDescription:
      "Chase Credit Card (Sapphire / Ink) PDF statements often contain Payments/Credits vs. Purchases sections with signed sign-flip normalization. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Chase Ink Business & Sapphire Statements",
      "Chase Credit Card (Sapphire / Ink) Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Chase Credit Card (Sapphire / Ink) PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Chase Credit Card (Sapphire / Ink) PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "bofa-credit-card-to-csv",
    institutionName: "Bank of America Credit Card",
    shortName: "BofA Card to CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Bank of America Credit Card PDFs, verified to zero.",
    heroSubheadline:
      "Convert Bank of America Credit Card PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Bank of America Credit Card Statement Formatting",
    statementQuirkDescription:
      "Bank of America Credit Card PDF statements often contain 4-digit card reference codes and reference numbers appended to descriptions. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "BofA Business Advantage & Customized Cash",
      "Bank of America Credit Card Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Bank of America Credit Card PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Bank of America Credit Card PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "wells-fargo-credit-card-to-excel",
    institutionName: "Wells Fargo Credit Card",
    shortName: "Wells Fargo Card to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Wells Fargo Credit Card PDFs, verified to zero.",
    heroSubheadline:
      "Convert Wells Fargo Credit Card PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Wells Fargo Credit Card Statement Formatting",
    statementQuirkDescription:
      "Wells Fargo Credit Card PDF statements often contain wrapped merchant cities, reference strings, and payment credit sections. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Wells Fargo Active Cash & Autograph",
      "Wells Fargo Credit Card Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Wells Fargo Credit Card PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Wells Fargo Credit Card PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "lloyds-bank-statement-to-csv",
    institutionName: "Lloyds Bank UK",
    shortName: "Lloyds PDF to CSV",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Lloyds Bank UK PDFs, verified to zero.",
    heroSubheadline:
      "Convert Lloyds Bank UK PDF statements into clean Xero CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Lloyds Bank UK Statement Formatting",
    statementQuirkDescription:
      "Lloyds Bank UK PDF statements often contain UK DD/MM/YY dates, BACS/Faster Payments codes, and Money In/Money Out columns. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to £0.00.",
    supportedAccountTypes: [
      "Lloyds Business & Current Account",
      "Lloyds Bank UK Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Lloyds Bank UK PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Lloyds Bank UK PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (£0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "natwest-bank-statement-to-xero",
    institutionName: "NatWest UK",
    shortName: "NatWest PDF to Xero",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "NatWest UK PDFs, verified to zero.",
    heroSubheadline:
      "Convert NatWest UK PDF statements into clean Xero CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling NatWest UK Statement Formatting",
    statementQuirkDescription:
      "NatWest UK PDF statements often contain multi-line POS/FPO/BAC descriptions and blank date carry-forward rows. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to £0.00.",
    supportedAccountTypes: [
      "NatWest Business & Personal Current",
      "NatWest UK Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my NatWest UK PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my NatWest UK PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (£0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "rbs-bank-statement-to-csv",
    institutionName: "Royal Bank of Scotland (RBS)",
    shortName: "RBS PDF to CSV",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Royal Bank of Scotland (RBS) PDFs, verified to zero.",
    heroSubheadline:
      "Convert Royal Bank of Scotland (RBS) PDF statements into clean Xero CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Royal Bank of Scotland (RBS) Statement Formatting",
    statementQuirkDescription:
      "Royal Bank of Scotland (RBS) PDF statements often contain same-day grouped dates and separate Paid In / Withdrawn columns. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to £0.00.",
    supportedAccountTypes: [
      "RBS Business Current Accounts",
      "Royal Bank of Scotland (RBS) Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Royal Bank of Scotland (RBS) PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Royal Bank of Scotland (RBS) PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (£0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "halifax-bank-statement-to-excel",
    institutionName: "Halifax UK",
    shortName: "Halifax PDF to Excel",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Halifax UK PDFs, verified to zero.",
    heroSubheadline:
      "Convert Halifax UK PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Halifax UK Statement Formatting",
    statementQuirkDescription:
      "Halifax UK PDF statements often contain abbreviated transaction type codes (DEB, FPI, DD) and running GBP balances. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to £0.00.",
    supportedAccountTypes: [
      "Halifax Current & Reward Accounts",
      "Halifax UK Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Halifax UK PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Halifax UK PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (£0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "santander-uk-statement-to-csv",
    institutionName: "Santander UK",
    shortName: "Santander UK to CSV",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Santander UK PDFs, verified to zero.",
    heroSubheadline:
      "Convert Santander UK PDF statements into clean Xero CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Santander UK Statement Formatting",
    statementQuirkDescription:
      "Santander UK PDF statements often contain wrapped card payment descriptions and multi-page statement balance blocks. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to £0.00.",
    supportedAccountTypes: [
      "Santander 1|2|3 & Business Current",
      "Santander UK Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Santander UK PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Santander UK PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (£0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "nationwide-uk-statement-to-excel",
    institutionName: "Nationwide Building Society",
    shortName: "Nationwide to Excel",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Nationwide Building Society PDFs, verified to zero.",
    heroSubheadline:
      "Convert Nationwide Building Society PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Nationwide Building Society Statement Formatting",
    statementQuirkDescription:
      "Nationwide Building Society PDF statements often contain UK date formats and split Out/In columns with multi-line payee details. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to £0.00.",
    supportedAccountTypes: [
      "Nationwide FlexAccount & FlexPlus",
      "Nationwide Building Society Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Nationwide Building Society PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Nationwide Building Society PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (£0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "tide-business-statement-to-xero",
    institutionName: "Tide Business UK",
    shortName: "Tide PDF to Xero",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Tide Business UK PDFs, verified to zero.",
    heroSubheadline:
      "Convert Tide Business UK PDF statements into clean Xero CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Tide Business UK Statement Formatting",
    statementQuirkDescription:
      "Tide Business UK PDF statements often contain FPS payment references, invoice tags, and VAT-ready GBP amounts. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to £0.00.",
    supportedAccountTypes: [
      "Tide UK SME Business Accounts",
      "Tide Business UK Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Tide Business UK PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Tide Business UK PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (£0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "metro-bank-uk-statement-to-csv",
    institutionName: "Metro Bank UK",
    shortName: "Metro Bank to CSV",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Metro Bank UK PDFs, verified to zero.",
    heroSubheadline:
      "Convert Metro Bank UK PDF statements into clean Xero CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Metro Bank UK Statement Formatting",
    statementQuirkDescription:
      "Metro Bank UK PDF statements often contain multi-column Money Out / Money In tables and FX fee sub-rows. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to £0.00.",
    supportedAccountTypes: [
      "Metro Bank Business Current Account",
      "Metro Bank UK Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Metro Bank UK PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Metro Bank UK PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (£0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "tsb-bank-uk-statement-to-excel",
    institutionName: "TSB Bank UK",
    shortName: "TSB UK PDF to Excel",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "TSB Bank UK PDFs, verified to zero.",
    heroSubheadline:
      "Convert TSB Bank UK PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling TSB Bank UK Statement Formatting",
    statementQuirkDescription:
      "TSB Bank UK PDF statements often contain UK DD MMM YY dates and abbreviated payment channel prefixes. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to £0.00.",
    supportedAccountTypes: [
      "TSB Spend & Save / Business Plus",
      "TSB Bank UK Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my TSB Bank UK PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my TSB Bank UK PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (£0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "virgin-money-uk-statement-to-csv",
    institutionName: "Virgin Money UK",
    shortName: "Virgin Money to CSV",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Virgin Money UK PDFs, verified to zero.",
    heroSubheadline:
      "Convert Virgin Money UK PDF statements into clean Xero CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Virgin Money UK Statement Formatting",
    statementQuirkDescription:
      "Virgin Money UK PDF statements often contain grouped daily debits, Direct Debits, and running balance verification. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to £0.00.",
    supportedAccountTypes: [
      "Virgin Money M Plus & Business Current",
      "Virgin Money UK Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Virgin Money UK PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Virgin Money UK PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (£0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "scotiabank-statement-to-excel",
    institutionName: "Scotiabank Canada",
    shortName: "Scotiabank to Excel",
    region: "Canada",
    defaultCurrency: "CAD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Scotiabank Canada PDFs, verified to zero.",
    heroSubheadline:
      "Convert Scotiabank Canada PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Scotiabank Canada Statement Formatting",
    statementQuirkDescription:
      "Scotiabank Canada PDF statements often contain bilingual/Canadian date formats (MMM DD) and split Withdrawals/Deposits. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to CA$0.00.",
    supportedAccountTypes: [
      "Scotiabank Business & Momentum Checking",
      "Scotiabank Canada Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Scotiabank Canada PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Scotiabank Canada PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (CA$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "bmo-canada-statement-to-csv",
    institutionName: "BMO Bank of Montreal",
    shortName: "BMO Canada to CSV",
    region: "Canada",
    defaultCurrency: "CAD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "BMO Bank of Montreal PDFs, verified to zero.",
    heroSubheadline:
      "Convert BMO Bank of Montreal PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling BMO Bank of Montreal Statement Formatting",
    statementQuirkDescription:
      "BMO Bank of Montreal PDF statements often contain multi-line Interac e-Transfer memos and CAD running balance checks. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to CA$0.00.",
    supportedAccountTypes: [
      "BMO Business Builder & Everyday Banking",
      "BMO Bank of Montreal Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my BMO Bank of Montreal PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my BMO Bank of Montreal PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (CA$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "cibc-bank-statement-to-excel",
    institutionName: "CIBC Canada",
    shortName: "CIBC PDF to Excel",
    region: "Canada",
    defaultCurrency: "CAD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "CIBC Canada PDFs, verified to zero.",
    heroSubheadline:
      "Convert CIBC Canada PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling CIBC Canada Statement Formatting",
    statementQuirkDescription:
      "CIBC Canada PDF statements often contain grouped Interac e-Transfers, service charges, and debit/credit columns. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to CA$0.00.",
    supportedAccountTypes: [
      "CIBC Business Operating & Smart Account",
      "CIBC Canada Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my CIBC Canada PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my CIBC Canada PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (CA$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "td-canada-trust-statement-to-quickbooks",
    institutionName: "TD Canada Trust",
    shortName: "TD Canada to QuickBooks",
    region: "Canada",
    defaultCurrency: "CAD",
    targetFormat: "QuickBooks CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "TD Canada Trust PDFs, verified to zero.",
    heroSubheadline:
      "Convert TD Canada Trust PDF statements into clean QuickBooks CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling TD Canada Trust Statement Formatting",
    statementQuirkDescription:
      "TD Canada Trust PDF statements often contain abbreviated POS/E-TFR codes and missing year markers on monthly rows. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to CA$0.00.",
    supportedAccountTypes: [
      "TD Every Day & Unlimited Business Plan",
      "TD Canada Trust Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my TD Canada Trust PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my TD Canada Trust PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (CA$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "national-bank-canada-to-csv",
    institutionName: "National Bank of Canada",
    shortName: "National Bank to CSV",
    region: "Canada",
    defaultCurrency: "CAD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "National Bank of Canada PDFs, verified to zero.",
    heroSubheadline:
      "Convert National Bank of Canada PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling National Bank of Canada Statement Formatting",
    statementQuirkDescription:
      "National Bank of Canada PDF statements often contain French/English bilingual headers and CAD decimal formatting. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to CA$0.00.",
    supportedAccountTypes: [
      "National Bank Business & Personal Chequing",
      "National Bank of Canada Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my National Bank of Canada PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my National Bank of Canada PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (CA$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "tangerine-bank-statement-to-excel",
    institutionName: "Tangerine Bank Canada",
    shortName: "Tangerine to Excel",
    region: "Canada",
    defaultCurrency: "CAD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Tangerine Bank Canada PDFs, verified to zero.",
    heroSubheadline:
      "Convert Tangerine Bank Canada PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Tangerine Bank Canada Statement Formatting",
    statementQuirkDescription:
      "Tangerine Bank Canada PDF statements often contain interleaved e-Transfer memos and monthly interest payout lines. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to CA$0.00.",
    supportedAccountTypes: [
      "Tangerine Chequing & Money-Back Card",
      "Tangerine Bank Canada Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Tangerine Bank Canada PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Tangerine Bank Canada PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (CA$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "eq-bank-statement-to-csv",
    institutionName: "EQ Bank Canada",
    shortName: "EQ Bank PDF to CSV",
    region: "Canada",
    defaultCurrency: "CAD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "EQ Bank Canada PDFs, verified to zero.",
    heroSubheadline:
      "Convert EQ Bank Canada PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling EQ Bank Canada Statement Formatting",
    statementQuirkDescription:
      "EQ Bank Canada PDF statements often contain high-interest payout lines and EFT transfer reference codes. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to CA$0.00.",
    supportedAccountTypes: [
      "EQ Bank Personal & Notice Savings",
      "EQ Bank Canada Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my EQ Bank Canada PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my EQ Bank Canada PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (CA$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "simplii-financial-statement-to-excel",
    institutionName: "Simplii Financial",
    shortName: "Simplii PDF to Excel",
    region: "Canada",
    defaultCurrency: "CAD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Simplii Financial PDFs, verified to zero.",
    heroSubheadline:
      "Convert Simplii Financial PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Simplii Financial Statement Formatting",
    statementQuirkDescription:
      "Simplii Financial PDF statements often contain CIBC-style debit/credit columns and Interac e-Transfer descriptions. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to CA$0.00.",
    supportedAccountTypes: [
      "Simplii No Fee Chequing Account",
      "Simplii Financial Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Simplii Financial PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Simplii Financial PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (CA$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "commbank-statement-to-xero",
    institutionName: "Commonwealth Bank (CommBank)",
    shortName: "CommBank to Xero",
    region: "Australia & NZ",
    defaultCurrency: "AUD",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Commonwealth Bank (CommBank) PDFs, verified to zero.",
    heroSubheadline:
      "Convert Commonwealth Bank (CommBank) PDF statements into clean Xero CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Commonwealth Bank (CommBank) Statement Formatting",
    statementQuirkDescription:
      "Commonwealth Bank (CommBank) PDF statements often contain AUD CR/DR suffixes, BPAY/OSKO references, and multi-line merchant text. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to A$0.00.",
    supportedAccountTypes: [
      "CommBank Business Transaction & Smart Access",
      "Commonwealth Bank (CommBank) Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Commonwealth Bank (CommBank) PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Commonwealth Bank (CommBank) PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (A$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "anz-australia-statement-to-csv",
    institutionName: "ANZ Bank Australia",
    shortName: "ANZ PDF to CSV",
    region: "Australia & NZ",
    defaultCurrency: "AUD",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "ANZ Bank Australia PDFs, verified to zero.",
    heroSubheadline:
      "Convert ANZ Bank Australia PDF statements into clean Xero CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling ANZ Bank Australia Statement Formatting",
    statementQuirkDescription:
      "ANZ Bank Australia PDF statements often contain DD MMM date stamps, EFTPOS codes, and separate Withdrawals/Deposits. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to A$0.00.",
    supportedAccountTypes: [
      "ANZ Business Essentials & Everyday",
      "ANZ Bank Australia Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my ANZ Bank Australia PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my ANZ Bank Australia PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (A$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "westpac-statement-to-excel",
    institutionName: "Westpac Australia",
    shortName: "Westpac PDF to Excel",
    region: "Australia & NZ",
    defaultCurrency: "AUD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Westpac Australia PDFs, verified to zero.",
    heroSubheadline:
      "Convert Westpac Australia PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Westpac Australia Statement Formatting",
    statementQuirkDescription:
      "Westpac Australia PDF statements often contain multi-line PayID/OSKO memos and running AUD balance reconciliation. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to A$0.00.",
    supportedAccountTypes: [
      "Westpac Business One & Choice",
      "Westpac Australia Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Westpac Australia PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Westpac Australia PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (A$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "nab-bank-statement-to-xero",
    institutionName: "NAB (National Australia Bank)",
    shortName: "NAB PDF to Xero",
    region: "Australia & NZ",
    defaultCurrency: "AUD",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "NAB (National Australia Bank) PDFs, verified to zero.",
    heroSubheadline:
      "Convert NAB (National Australia Bank) PDF statements into clean Xero CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling NAB (National Australia Bank) Statement Formatting",
    statementQuirkDescription:
      "NAB (National Australia Bank) PDF statements often contain grouped debit/credit columns and BPAY biller codes. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to A$0.00.",
    supportedAccountTypes: [
      "NAB Business Everyday & Classic",
      "NAB (National Australia Bank) Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my NAB (National Australia Bank) PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my NAB (National Australia Bank) PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (A$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "macquarie-bank-statement-to-csv",
    institutionName: "Macquarie Bank Australia",
    shortName: "Macquarie to CSV",
    region: "Australia & NZ",
    defaultCurrency: "AUD",
    targetFormat: "CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Macquarie Bank Australia PDFs, verified to zero.",
    heroSubheadline:
      "Convert Macquarie Bank Australia PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Macquarie Bank Australia Statement Formatting",
    statementQuirkDescription:
      "Macquarie Bank Australia PDF statements often contain clean modern tables with wrapped merchant locations and OSKO IDs. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to A$0.00.",
    supportedAccountTypes: [
      "Macquarie Transaction & Business CMA",
      "Macquarie Bank Australia Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Macquarie Bank Australia PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Macquarie Bank Australia PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (A$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "ing-australia-statement-to-excel",
    institutionName: "ING Australia",
    shortName: "ING AU PDF to Excel",
    region: "Australia & NZ",
    defaultCurrency: "AUD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "ING Australia PDFs, verified to zero.",
    heroSubheadline:
      "Convert ING Australia PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling ING Australia Statement Formatting",
    statementQuirkDescription:
      "ING Australia PDF statements often contain combined EFTPOS/Visa debit descriptors and international fee rebates. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to A$0.00.",
    supportedAccountTypes: [
      "ING Orange Everyday & Business Optima",
      "ING Australia Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my ING Australia PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my ING Australia PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (A$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "asb-bank-nz-statement-to-xero",
    institutionName: "ASB Bank New Zealand",
    shortName: "ASB NZ to Xero",
    region: "Australia & NZ",
    defaultCurrency: "AUD",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "ASB Bank New Zealand PDFs, verified to zero.",
    heroSubheadline:
      "Convert ASB Bank New Zealand PDF statements into clean Xero CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling ASB Bank New Zealand Statement Formatting",
    statementQuirkDescription:
      "ASB Bank New Zealand PDF statements often contain NZ particular/code/reference 3-field memos and daily running balances. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to A$0.00.",
    supportedAccountTypes: [
      "ASB Business Focus & Streamline",
      "ASB Bank New Zealand Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my ASB Bank New Zealand PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my ASB Bank New Zealand PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (A$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "bnz-bank-nz-statement-to-csv",
    institutionName: "BNZ (Bank of New Zealand)",
    shortName: "BNZ NZ PDF to CSV",
    region: "Australia & NZ",
    defaultCurrency: "AUD",
    targetFormat: "Xero CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "BNZ (Bank of New Zealand) PDFs, verified to zero.",
    heroSubheadline:
      "Convert BNZ (Bank of New Zealand) PDF statements into clean Xero CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling BNZ (Bank of New Zealand) Statement Formatting",
    statementQuirkDescription:
      "BNZ (Bank of New Zealand) PDF statements often contain multi-column payee/particulars/code/reference layouts. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to A$0.00.",
    supportedAccountTypes: [
      "BNZ MyMoney for Business & YouMoney",
      "BNZ (Bank of New Zealand) Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my BNZ (Bank of New Zealand) PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my BNZ (Bank of New Zealand) PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (A$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "ing-europe-statement-to-csv",
    institutionName: "ING Bank (Netherlands / Germany)",
    shortName: "ING Europe to CSV",
    region: "Europe & Global",
    defaultCurrency: "EUR",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "ING Bank (Netherlands / Germany) PDFs, verified to zero.",
    heroSubheadline:
      "Convert ING Bank (Netherlands / Germany) PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling ING Bank (Netherlands / Germany) Statement Formatting",
    statementQuirkDescription:
      "ING Bank (Netherlands / Germany) PDF statements often contain European comma-decimal amounts (1.234,56 EUR) and SEPA IBAN references. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to €0.00.",
    supportedAccountTypes: [
      "ING Zakelijk & DiBa Girokonto",
      "ING Bank (Netherlands / Germany) Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my ING Bank (Netherlands / Germany) PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my ING Bank (Netherlands / Germany) PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (€0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "deutsche-bank-statement-to-excel",
    institutionName: "Deutsche Bank",
    shortName: "Deutsche Bank to Excel",
    region: "Europe & Global",
    defaultCurrency: "EUR",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Deutsche Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert Deutsche Bank PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Deutsche Bank Statement Formatting",
    statementQuirkDescription:
      "Deutsche Bank PDF statements often contain SEPA Überweisung / Lastschrift multi-line blocks and EUR comma decimals. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to €0.00.",
    supportedAccountTypes: [
      "Deutsche Bank Geschäftskonto & AktivKonto",
      "Deutsche Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Deutsche Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Deutsche Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (€0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "bnp-paribas-statement-to-csv",
    institutionName: "BNP Paribas",
    shortName: "BNP Paribas to CSV",
    region: "Europe & Global",
    defaultCurrency: "EUR",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "BNP Paribas PDFs, verified to zero.",
    heroSubheadline:
      "Convert BNP Paribas PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling BNP Paribas Statement Formatting",
    statementQuirkDescription:
      "BNP Paribas PDF statements often contain French DD.MM date format, Débit/Crédit split columns, and EUR decimals. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to €0.00.",
    supportedAccountTypes: [
      "BNP Paribas Compte Pro & Esprit Libre",
      "BNP Paribas Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my BNP Paribas PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my BNP Paribas PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (€0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "qonto-business-statement-to-excel",
    institutionName: "Qonto Business Banking",
    shortName: "Qonto PDF to Excel",
    region: "Europe & Global",
    defaultCurrency: "EUR",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Qonto Business Banking PDFs, verified to zero.",
    heroSubheadline:
      "Convert Qonto Business Banking PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Qonto Business Banking Statement Formatting",
    statementQuirkDescription:
      "Qonto Business Banking PDF statements often contain multi-member corporate card rows, SEPA transfers, and VAT metadata. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to €0.00.",
    supportedAccountTypes: [
      "Qonto European SME & Freelancer Accounts",
      "Qonto Business Banking Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Qonto Business Banking PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Qonto Business Banking PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (€0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "bbva-bank-statement-to-csv",
    institutionName: "BBVA Bank",
    shortName: "BBVA PDF to CSV",
    region: "Europe & Global",
    defaultCurrency: "EUR",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "BBVA Bank PDFs, verified to zero.",
    heroSubheadline:
      "Convert BBVA Bank PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling BBVA Bank Statement Formatting",
    statementQuirkDescription:
      "BBVA Bank PDF statements often contain Spanish/European date formats and comma-decimal EUR amount parsing. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to €0.00.",
    supportedAccountTypes: [
      "BBVA Empresas & Cuenta Online",
      "BBVA Bank Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my BBVA Bank PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my BBVA Bank PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (€0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "ubs-switzerland-statement-to-excel",
    institutionName: "UBS Switzerland",
    shortName: "UBS PDF to Excel",
    region: "Europe & Global",
    defaultCurrency: "EUR",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "UBS Switzerland PDFs, verified to zero.",
    heroSubheadline:
      "Convert UBS Switzerland PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling UBS Switzerland Statement Formatting",
    statementQuirkDescription:
      "UBS Switzerland PDF statements often contain Swiss apostrophe thousand separators (1'250.00) and multi-currency lines. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to €0.00.",
    supportedAccountTypes: [
      "UBS Corporate & Private Account Statements",
      "UBS Switzerland Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my UBS Switzerland PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my UBS Switzerland PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (€0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "uob-singapore-statement-to-excel",
    institutionName: "UOB Singapore",
    shortName: "UOB PDF to Excel",
    region: "Asia-Pacific",
    defaultCurrency: "SGD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "UOB Singapore PDFs, verified to zero.",
    heroSubheadline:
      "Convert UOB Singapore PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling UOB Singapore Statement Formatting",
    statementQuirkDescription:
      "UOB Singapore PDF statements often contain FAST/PayNow multi-line transfer references and SGD balance verification. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to S$0.00.",
    supportedAccountTypes: [
      "UOB eBusiness & One Account",
      "UOB Singapore Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my UOB Singapore PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my UOB Singapore PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (S$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "hsbc-hong-kong-statement-to-csv",
    institutionName: "HSBC Hong Kong",
    shortName: "HSBC HK to CSV",
    region: "Asia-Pacific",
    defaultCurrency: "HKD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "HSBC Hong Kong PDFs, verified to zero.",
    heroSubheadline:
      "Convert HSBC Hong Kong PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling HSBC Hong Kong Statement Formatting",
    statementQuirkDescription:
      "HSBC Hong Kong PDF statements often contain multi-currency HKD/USD/CNY sub-ledgers inside one composite PDF statement. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to HK$0.00.",
    supportedAccountTypes: [
      "HSBC Business Integrated & Premier HK",
      "HSBC Hong Kong Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my HSBC Hong Kong PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my HSBC Hong Kong PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (HK$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "hang-seng-bank-statement-to-excel",
    institutionName: "Hang Seng Bank Hong Kong",
    shortName: "Hang Seng to Excel",
    region: "Asia-Pacific",
    defaultCurrency: "HKD",
    targetFormat: "Excel (.xlsx)",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Hang Seng Bank Hong Kong PDFs, verified to zero.",
    heroSubheadline:
      "Convert Hang Seng Bank Hong Kong PDF statements into clean Excel (.xlsx) and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Hang Seng Bank Hong Kong Statement Formatting",
    statementQuirkDescription:
      "Hang Seng Bank Hong Kong PDF statements often contain FPS transfer memos, multi-currency sections, and HKD balance checks. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to HK$0.00.",
    supportedAccountTypes: [
      "Hang Seng Business & Prestige Banking",
      "Hang Seng Bank Hong Kong Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Hang Seng Bank Hong Kong PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Hang Seng Bank Hong Kong PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (HK$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "standard-chartered-statement-to-csv",
    institutionName: "Standard Chartered",
    shortName: "Standard Chartered to CSV",
    region: "Asia-Pacific",
    defaultCurrency: "SGD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Standard Chartered PDFs, verified to zero.",
    heroSubheadline:
      "Convert Standard Chartered PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Standard Chartered Statement Formatting",
    statementQuirkDescription:
      "Standard Chartered PDF statements often contain multi-region SG/HK/UK statement templates and FX conversion rows. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to S$0.00.",
    supportedAccountTypes: [
      "Standard Chartered Business & Priority",
      "Standard Chartered Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Standard Chartered PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Standard Chartered PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (S$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "pdf-to-wave-accounting-csv",
    institutionName: "Wave Accounting",
    shortName: "PDF to Wave CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Wave Accounting PDFs, verified to zero.",
    heroSubheadline:
      "Convert Wave Accounting PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Wave Accounting Statement Formatting",
    statementQuirkDescription:
      "Wave Accounting PDF statements often contain clean Date, Description, Amount columns formatted for zero-error Wave upload. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Wave Accounting Bank Statement Import",
      "Wave Accounting Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Wave Accounting PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Wave Accounting PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "pdf-to-freshbooks-csv",
    institutionName: "FreshBooks",
    shortName: "PDF to FreshBooks CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "FreshBooks PDFs, verified to zero.",
    heroSubheadline:
      "Convert FreshBooks PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling FreshBooks Statement Formatting",
    statementQuirkDescription:
      "FreshBooks PDF statements often contain normalized dates and signed numeric amounts accepted by FreshBooks. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "FreshBooks Expense & Bank Import",
      "FreshBooks Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my FreshBooks PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my FreshBooks PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "pdf-to-sage-accounting-csv",
    institutionName: "Sage 50 & Sage Accounting",
    shortName: "PDF to Sage CSV",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "Sage 50 & Sage Accounting PDFs, verified to zero.",
    heroSubheadline:
      "Convert Sage 50 & Sage Accounting PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Sage 50 & Sage Accounting Statement Formatting",
    statementQuirkDescription:
      "Sage 50 & Sage Accounting PDF statements often contain strict Sage Date/Reference/Details/Net columns with cent-level balance check. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to £0.00.",
    supportedAccountTypes: [
      "Sage 50cloud & Sage Business Cloud",
      "Sage 50 & Sage Accounting Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Sage 50 & Sage Accounting PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Sage 50 & Sage Accounting PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (£0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "pdf-to-zoho-books-csv",
    institutionName: "Zoho Books",
    shortName: "PDF to Zoho Books CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Zoho Books PDFs, verified to zero.",
    heroSubheadline:
      "Convert Zoho Books PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Zoho Books Statement Formatting",
    statementQuirkDescription:
      "Zoho Books PDF statements often contain separate Deposits/Withdrawals columns matching Zoho Books import mapper. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Zoho Books Manual Bank Feed Import",
      "Zoho Books Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Zoho Books PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Zoho Books PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "pdf-to-netsuite-csv",
    institutionName: "Oracle NetSuite",
    shortName: "PDF to NetSuite CSV",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Oracle NetSuite PDFs, verified to zero.",
    heroSubheadline:
      "Convert Oracle NetSuite PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Oracle NetSuite Statement Formatting",
    statementQuirkDescription:
      "Oracle NetSuite PDF statements often contain clean ISO dates, reference IDs, and deterministic debit/credit parity. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "NetSuite Bank Data & Reconciliation CSV",
      "Oracle NetSuite Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Oracle NetSuite PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Oracle NetSuite PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "pdf-to-myob-csv",
    institutionName: "MYOB Business",
    shortName: "PDF to MYOB CSV",
    region: "Australia & NZ",
    defaultCurrency: "AUD",
    targetFormat: "CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "MYOB Business PDFs, verified to zero.",
    heroSubheadline:
      "Convert MYOB Business PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling MYOB Business Statement Formatting",
    statementQuirkDescription:
      "MYOB Business PDF statements often contain AUD DD/MM/YYYY date formatting and verified running balance alignment. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to A$0.00.",
    supportedAccountTypes: [
      "MYOB AccountRight & Business Bank Feeds",
      "MYOB Business Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my MYOB Business PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my MYOB Business PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (A$0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "pdf-to-freeagent-csv",
    institutionName: "FreeAgent UK",
    shortName: "PDF to FreeAgent CSV",
    region: "United Kingdom",
    defaultCurrency: "GBP",
    targetFormat: "CSV",
    recommendedSampleId: "amazon-uk-receipt",
    heroHeadline: "FreeAgent UK PDFs, verified to zero.",
    heroSubheadline:
      "Convert FreeAgent UK PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling FreeAgent UK Statement Formatting",
    statementQuirkDescription:
      "FreeAgent UK PDF statements often contain strict 3-column DD/MM/YYYY, Amount, Description schema required by FreeAgent. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to £0.00.",
    supportedAccountTypes: [
      "FreeAgent UK Contractor Bank Upload",
      "FreeAgent UK Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my FreeAgent UK PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my FreeAgent UK PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (£0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "pdf-to-actual-budget-csv",
    institutionName: "Actual Budget (Open Source)",
    shortName: "PDF to Actual Budget CSV",
    region: "Europe & Global",
    defaultCurrency: "USD",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Actual Budget (Open Source) PDFs, verified to zero.",
    heroSubheadline:
      "Convert Actual Budget (Open Source) PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Actual Budget (Open Source) Statement Formatting",
    statementQuirkDescription:
      "Actual Budget (Open Source) PDF statements often contain 100% browser-local PDF extraction matching Actual Budget's privacy-first ethos. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to $0.00.",
    supportedAccountTypes: [
      "Actual Budget Local-First Personal Finance",
      "Actual Budget (Open Source) Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Actual Budget (Open Source) PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Actual Budget (Open Source) PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent ($0.00 discrepancy).",
      },
    ],
  },
  {
    slug: "pdf-to-firefly-iii-csv",
    institutionName: "Firefly III (Self-Hosted)",
    shortName: "PDF to Firefly III CSV",
    region: "Europe & Global",
    defaultCurrency: "EUR",
    targetFormat: "CSV",
    recommendedSampleId: "chase-checking-oct",
    heroHeadline: "Firefly III (Self-Hosted) PDFs, verified to zero.",
    heroSubheadline:
      "Convert Firefly III (Self-Hosted) PDF statements into clean CSV and Excel workbooks 100% locally in your browser—zero server uploads, with deterministic cent-level balance verification.",
    statementQuirkTitle: "Handling Firefly III (Self-Hosted) Statement Formatting",
    statementQuirkDescription:
      "Firefly III (Self-Hosted) PDF statements often contain zero-upload client-side parsing with clean payee, amount, and date columns. StatementFlow parses text locally in your browser via pdf.js, normalizes every row, and proves Opening + Credits - Debits = Ending to €0.00.",
    supportedAccountTypes: [
      "Firefly III Data Importer CSV",
      "Firefly III (Self-Hosted) Monthly & Historical Archive PDFs",
    ],
    extractedColumns: [
      "Post Date (YYYY-MM-DD)",
      "Normalized Merchant / Payee",
      "Full Reference & Memo",
      "Expense Category",
      "Signed Amount & Split Debit/Credit",
    ],
    specificFaqs: [
      {
        q: "Are my Firefly III (Self-Hosted) PDF statements uploaded to a cloud server?",
        a: "No. StatementFlow runs PDF extraction 100% client-side inside your browser tab using pdf.js—your financial PDF never leaves your device.",
      },
      {
        q: "How do I know no transactions were missed from my Firefly III (Self-Hosted) PDF?",
        a: "Our deterministic ledger engine verifies Opening Balance + Total Credits - Total Debits against your Closing Balance to the exact cent (€0.00 discrepancy).",
      },
    ],
  },
];

export function findPseoBankBySlug(slug: string): PseoBankEntry | undefined {
  return PSEO_BANK_ENTRIES.find((entry) => entry.slug === slug);
}
