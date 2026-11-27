import type { Metadata } from "next";
import OfxConverterClient from "./client";

export const metadata: Metadata = {
  title:
    "Free OFX, QFX & QBO to CSV Converter (Browser-Local, Zero Upload) | StatementFlow",
  description:
    "Convert Quicken .QFX, QuickBooks Web Connect .QBO, and .OFX bank files into clean CSV, QuickBooks 3-column CSV, or Xero 5-column CSV directly in your browser. Fixes Error -16802 with zero server uploads.",
  alternates: {
    canonical: "/tools/ofx-qbo-to-csv",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function OfxQboToCsvPage() {
  return <OfxConverterClient />;
}
