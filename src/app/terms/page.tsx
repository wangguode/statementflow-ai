import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use & Refund Policy | StatementFlow AI",
  description:
    "Terms of service, $9 Pro one-time license, $199 Firm Pilot, and 14-day refund policy for StatementFlow AI.",
  alternates: {
    canonical: "/terms",
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#161615] py-14 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8 leading-relaxed">
        <div className="space-y-2 border-b border-[#dedad0] pb-6">
          <Link href="/" className="text-xs font-mono text-[#14532d] hover:underline">
            ← Back to StatementFlow AI
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            Terms of Use &amp; Refund Policy
          </h1>
          <p className="text-xs font-mono text-[#6b6860]">
            Effective Date: November 23, 2026 · Operator: Wang Guo (@wangguode) ·
            https://statementflow.win
          </p>
        </div>

        <section className="space-y-2.5 text-sm text-[#3d3b36]">
          <h2 className="text-base font-semibold text-[#161615]">
            1. Service Scope &amp; Accounting Verification
          </h2>
          <p>
            StatementFlow AI converts financial PDFs, CSVs, and OFX/QFX/QBO files into
            structured spreadsheets (.xlsx, QuickBooks CSV, Xero CSV) with deterministic
            double-entry arithmetic verification (Opening + Credits - Debits = Ending).
            While we enforce cent-level balance checks, users remain responsible for
            reviewing final figures prior to tax filings or statutory audits.
          </p>
        </section>

        <section className="space-y-2.5 text-sm text-[#3d3b36]">
          <h2 className="text-base font-semibold text-[#161615]">
            2. Pricing, Licensing &amp; 14-Day Refund Guarantee
          </h2>
          <p>
            Online checkout is operated by <strong>Creem.io</strong> as our authorized
            Merchant of Record. Available plans include:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Free Tier &amp; Free Browser Tools</strong>: Free preview runs plus
              unlimited local use of the QuickBooks CSV Fixer and OFX/QBO to CSV tools.
            </li>
            <li>
              <strong>Pro Lifetime Unlock ($9 one-time)</strong>: Unlimited batch PDF
              extraction, Vision OCR, native .xlsx, QuickBooks 3-col, and Xero 5-col
              exports with no recurring subscription.
            </li>
            <li>
              <strong>Firm Pilot ($199 one-time) &amp; Self-Hosted Docker ($999+)</strong>:
              Commercial multi-seat firm pilot and private VPC deployment packages.
            </li>
          </ul>
          <p>
            If StatementFlow AI cannot accurately parse your bank statement format, email{" "}
            <a href="mailto:hello@statementflow.win" className="text-[#14532d] underline">
              hello@statementflow.win
            </a>{" "}
            within 7 days of purchase with your order ID for a full refund or free
            custom bank template tuning.
          </p>
        </section>

        <section className="space-y-2.5 text-sm text-[#3d3b36]">
          <h2 className="text-base font-semibold text-[#161615]">
            3. Support Contact
          </h2>
          <p>
            Questions regarding licensing, enterprise Docker deployments, or refunds may
            be sent to{" "}
            <a href="mailto:hello@statementflow.win" className="text-[#14532d] underline">
              hello@statementflow.win
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
