import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://statementflow.win"),
  title: "StatementFlow AI — Bank Statements & Invoices to Verified Excel (.xlsx)",
  description:
    "Convert PDF bank statements, scanned statements, and VAT invoices into $0.00-reconciled native .xlsx Excel, QuickBooks 3-col CSV, and Xero 5-col CSV. 100% browser-local PDF extraction.",
  alternates: {
    canonical: "https://statementflow.win",
  },
  openGraph: {
    title: "StatementFlow AI — Bank Statements to $0.00-Verified Excel & QuickBooks CSV",
    description:
      "Browser-local batch PDF bank statement parser + Vision OCR + deterministic double-entry reconciliation ($9 one-time lifetime unlock).",
    url: "https://statementflow.win",
    siteName: "StatementFlow AI",
    images: [
      {
        url: "/assets/blythe-house-ledger-room-1924.jpg",
        width: 1200,
        height: 630,
        alt: "StatementFlow AI — Deterministic Financial Statement Reconciliation",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StatementFlow AI — Bank Statements to $0.00-Verified Excel (.xlsx)",
    description:
      "Browser-local batch PDF parsing, Vision OCR & QuickBooks/Xero CSV export. $9 one-time lifetime unlock.",
    images: ["/assets/blythe-house-ledger-room-1924.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const ROOT_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "StatementFlow AI",
    url: "https://statementflow.win",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Deterministic client-side PDF bank statement and VAT invoice converter with $0.00 balance verification and native QuickBooks, Xero, and multi-sheet Excel (.xlsx) export.",
    offers: [
      {
        "@type": "Offer",
        name: "Free Preview",
        price: "0.00",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "StatementFlow Pro Lifetime Unlock",
        price: "9.00",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Boutique Bookkeeping Firm Pilot",
        price: "199.00",
        priceCurrency: "USD",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does StatementFlow prevent AI arithmetic hallucinations?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Language models only structure line-item text. Every subtotal and closing discrepancy is verified deterministically in TypeScript using cent-rounded math: Opening + Credits - Debits = Calculated Closing.",
        },
      },
      {
        "@type": "Question",
        name: "Are uploaded bank statements stored on a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Digital PDFs are parsed locally in your browser via pdf.js, and ephemeral Vision OCR buffers are discarded immediately without database storage.",
        },
      },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="js" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Stack+Sans+Headline:wght@500;600&family=Stack+Sans+Text:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ROOT_JSON_LD) }}
        />
        <script src="https://pulse.statementflow.win/api/pixel.js" defer />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
