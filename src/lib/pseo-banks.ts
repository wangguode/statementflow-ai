// Programmatic SEO (pSEO) 银行与财务平台长尾词落地页数据源
// 覆盖美、英、欧及跨境电商最高转化率的 12 个 PDF/账单转 Excel/CSV/QuickBooks 搜索意图

export interface PseoBankEntry {
  slug: string;
  institutionName: string;
  shortName: string;
  region: "United States" | "United Kingdom" | "Europe & Global";
  defaultCurrency: "USD" | "GBP" | "EUR";
  targetFormat: "Excel (.xls)" | "CSV" | "QuickBooks CSV" | "Xero CSV";
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
    targetFormat: "Excel (.xls)",
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
    targetFormat: "Excel (.xls)",
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
        a: "The Accounting Firm plan ($49/mo) includes 5 seats and unlimited monthly statement conversions.",
      },
    ],
  },
  {
    slug: "stripe-invoice-to-excel",
    institutionName: "Stripe Billing & Payouts",
    shortName: "Stripe Invoice Excel",
    region: "Europe & Global",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xls)",
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
        a: "Every row includes a dedicated Tax column alongside the net/gross amount in both Excel (.xls) and CSV exports.",
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
    targetFormat: "Excel (.xls)",
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
        q: "Does Lemon Squeezy handle EU and UK VAT for Revolut Business subscribers?",
        a: "Yes. When upgrading to StatementFlow Pro ($19/mo), Lemon Squeezy acts as Merchant of Record and issues compliant EU/UK VAT invoices.",
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
    targetFormat: "Excel (.xls)",
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
    targetFormat: "Excel (.xls)",
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
    targetFormat: "Excel (.xls)",
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
    targetFormat: "Excel (.xls)",
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
    targetFormat: "Excel (.xls)",
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
      { q: "Can I export both Excel and CSV?", a: "Yes, every parsed statement supports .xls, .csv, and QuickBooks JSON." },
    ],
  },
  {
    slug: "td-bank-statement-to-excel",
    institutionName: "TD Bank Business",
    shortName: "TD Bank PDF to Excel",
    region: "United States",
    defaultCurrency: "USD",
    targetFormat: "Excel (.xls)",
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
    targetFormat: "Excel (.xls)",
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
    targetFormat: "Excel (.xls)",
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
    targetFormat: "Excel (.xls)",
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
    targetFormat: "Excel (.xls)",
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
];

export function findPseoBankBySlug(slug: string): PseoBankEntry | undefined {
  return PSEO_BANK_ENTRIES.find((entry) => entry.slug === slug);
}
