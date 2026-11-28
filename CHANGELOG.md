# Changelog

All notable changes to **StatementFlow AI** are documented in this file.

## [1.4.0] - 2026-11-28

### Added
- Cross-page UTM attribution persistence (`src/lib/telemetry.ts`) and pSEO bank landing dropzone funnel telemetry.
- Real-time hot-lead founder notifications and pre-checkout email persistence (`worker.ts`).
- Automatic shorthand `/convert/*` bank-slug 302 routing preserving campaign query parameters.

### Changed
- Enforced DOM-level row masking beyond the 5-row free verification preview for unpaid custom uploads while displaying full cent-rounded reconciliation math (`Opening + Credits - Debits = Closing`).
- Achieved zero-warning ESLint and TypeScript strict verification across all 118 static routes.

## [1.3.0] - 2026-11-27

### Security
- Hardened Creem HMAC-SHA256 webhook verification, eliminated 6-character partial license enumeration, and enforced strict `Origin` + `X-SF-Client` boundaries on `/api/extract`.
- Serialized batch chunk-0 free-quota registration to prevent parallel request bypasses.

### Fixed
- Standardized Xero 5-column (`YYYY-MM-DD`) and QuickBooks Online 3-column CSV date formatting.
- Scoped `FAQPage` JSON-LD metadata cleanly per route and added custom OpenGraph card assets.

## [1.0.0] - 2026-11-13

### Added
- Initial open-source release of StatementFlow AI: browser-local PDF text extraction (`pdfjs-dist`), optional multimodal Vision OCR fallback for scanned statements, deterministic cent-level double-entry balance verification, and native `.xlsx` / QuickBooks / Xero CSV export.
