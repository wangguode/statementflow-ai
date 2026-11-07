# StatementFlow AI — B2B PDF Bank Statement & Invoice to Verified Excel Micro-SaaS

StatementFlow AI is a commercial-ready overseas Micro-SaaS web application that converts unstructured PDF/CSV/TXT bank statements, Stripe SaaS invoices, and multi-currency VAT receipts into reconciled multi-sheet Excel (`.xls`), UTF-8 BOM `.csv`, and structured accounting `.json`.

## 1. Open-Source Upstream Attribution & License Compliance

- **Upstream Base Template**: [`JCodesMore/ai-website-cloner-template`](https://github.com/JCodesMore/ai-website-cloner-template)
- **Evaluated Commit**: `ee3f5a2f31fd549b9593fa4f7cf6d2955ee593bb`
- **License**: **MIT License** (Permissive commercial SaaS distribution; AGPL-3.0 candidates such as `StatementSensei` and `Cashiro` were explicitly excluded during legal due diligence to protect proprietary commercial deployment).

## 2. Quick Start (Zero Configuration Required)

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The application boots immediately into **Keyless Demo & Deterministic Heuristic Mode** with 3 pre-verified international financial documents:
1. **JPMorgan Chase Commercial Checking Statement** (`USD`)
2. **Vercel / Stripe Enterprise Tax Invoice** (`USD`)
3. **Amazon Business UK VAT Procurement Receipt** (`GBP`)

## 3. Core Architecture & AI Call Safety Baseline

- **Dual-Mode Extraction Engine** (`src/lib/ai-extractor.ts` & `src/lib/heuristic-parser.ts`):
  - Works out of the box without any API key using deterministic regex + double-entry balance inference.
  - Supports live OpenAI, DeepSeek, DashScope (Qwen), or local Ollama endpoints via `.env.local` or the in-app **AI Engine** configuration modal.
  - Enforces strict timeout (`AbortSignal.timeout`), exponential backoff retry on transient `429`/`5xx`, SSRF URL validation, secret redaction in logs, schema validation (`src/lib/schema.ts`), and automatic fallback on upstream failure.
- **Deterministic Accounting Reconciliation** (`computeReconciliation` in `src/lib/schema.ts`):
  - Never relies on LLM arithmetic for totals. Computes `Opening Balance + Total Credits - Total Debits = Closing Balance` in TypeScript and flags discrepancies down to `$0.01`.
- **Formula-Safe Export** (`src/lib/export-utils.ts`):
  - Neutralizes spreadsheet formula injection (`=`, `+`, `-`, `@` prefixes) before generating multi-worksheet SpreadsheetML `.xls` or UTF-8 BOM `.csv`.
- **Overseas Self-Serve Monetization** (`src/app/api/checkout/route.ts` & `src/app/api/webhook/route.ts`):
  - Supports **Lemon Squeezy** (Merchant of Record, handling global VAT/sales tax without requiring a foreign entity) and **Stripe Checkout**, plus timing-safe HMAC-SHA256 webhook verification (`crypto.timingSafeEqual`).

## 4. Verification & Evaluation Commands

```bash
# Typecheck, lint, and production build verification
npm run check

# Run the 12-case AI safety, reconciliation, and security regression suite
node scripts/eval-extractor.mjs
```
