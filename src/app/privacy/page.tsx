import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy & Zero-Retention Architecture | StatementFlow AI",
  description:
    "How StatementFlow AI handles bank statement PDFs locally in your browser with zero persistent storage of financial documents.",
  alternates: {
    canonical: "/privacy",
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#161615] py-14 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8 leading-relaxed">
        <div className="space-y-2 border-b border-[#dedad0] pb-6">
          <Link href="/" className="text-xs font-mono text-[#14532d] hover:underline">
            ← Back to StatementFlow AI
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            Privacy Policy &amp; Zero-Retention Architecture
          </h1>
          <p className="text-xs font-mono text-[#6b6860]">
            Effective Date: November 27, 2026 · Operator: Wang Guo (@wangguode) ·
            https://statementflow.win
          </p>
        </div>

        <section className="space-y-2.5 text-sm text-[#3d3b36]">
          <h2 className="text-base font-semibold text-[#161615]">
            1. Browser-Local Processing First
          </h2>
          <p>
            StatementFlow AI extracts text from digital PDF bank statements, repairs
            QuickBooks/Xero CSVs, and parses OFX/QFX/QBO files directly inside your
            local browser tab using client-side WebAssembly and JavaScript. Your raw
            files are not persisted in any database or cloud bucket.
          </p>
        </section>

        <section className="space-y-2.5 text-sm text-[#3d3b36]">
          <h2 className="text-base font-semibold text-[#161615]">
            2. Ephemeral Edge AI &amp; Vision OCR Processing
          </h2>
          <p>
            When you explicitly run AI structured extraction or scanned-PDF Vision OCR,
            the extracted text or page image is transmitted over HTTPS to our stateless
            Cloudflare Worker solely to return structured JSON transactions. We do not
            store, log, sell, or use your financial documents to train AI models.
          </p>
          <p>
            Accounting firms requiring strict air-gapped compliance may deploy our
            self-hosted Docker package so that zero bytes ever leave your internal VPC.
            If you voluntarily attach a redacted sample statement on our Pre-Pilot 4h Proof
            form, that text snippet is delivered solely to our engineering inbox to return
            your custom QBO/Xero proof.
          </p>
        </section>

        <section className="space-y-2.5 text-sm text-[#3d3b36]">
          <h2 className="text-base font-semibold text-[#161615]">
            3. Billing &amp; Merchant of Record (Creem.io)
          </h2>
          <p>
            All payments ($29 Pro lifetime unlock and $199 Firm Pilot) are securely
            processed by our Merchant of Record, <strong>Creem.io</strong>. Credit card
            details, billing addresses, and VAT/sales tax invoices are handled directly
            by Creem.io. StatementFlow receives only order confirmation status and
            license metadata.
          </p>
        </section>

        <section className="space-y-2.5 text-sm text-[#3d3b36]">
          <h2 className="text-base font-semibold text-[#161615]">
            4. Contact &amp; Data Requests
          </h2>
          <p>
            For privacy questions, enterprise security questionnaires, or order data
            deletion requests, contact{" "}
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
