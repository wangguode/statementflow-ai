import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://statementflow.win"),
  title: "StatementFlow AI — Bank Statements & Invoices to Verified Excel (.xlsx)",
  description:
    "Convert PDF bank statements, scanned statements, and VAT invoices into $0.00-reconciled native .xlsx Excel, QuickBooks 3-col CSV, and Xero 5-col CSV. 100% browser-local PDF extraction.",
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
          href="https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@300;600&family=Stack+Sans+Text:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
