import type { Metadata } from "next";
import OfxConverterClient from "./client";

const title =
  "OFX, QFX & QBO to CSV Converter (Browser-Local, Zero Upload) | StatementFlow";
const description =
  "Convert Quicken .QFX, QuickBooks Web Connect .QBO, and .OFX bank files into clean CSV, QuickBooks 3-column CSV, or Xero 5-column CSV directly in your browser. Fixes Error -16802 with zero server uploads.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/tools/ofx-qbo-to-csv",
  },
  openGraph: {
    title,
    description,
    url: "/tools/ofx-qbo-to-csv",
    type: "website",
    images: [{ url: "/og-statementflow.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-statementflow.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function OfxQboToCsvPage() {
  return <OfxConverterClient />;
}
