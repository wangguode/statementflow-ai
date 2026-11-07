import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StatementFlow — Bank Statements & Invoices to Verified Excel",
  description:
    "Convert PDF bank statements, Stripe SaaS invoices, and VAT receipts into reconciled multi-sheet Excel, UTF-8 CSV, and accounting JSON in seconds.",
  robots: {
    index: false,
    follow: false,
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
