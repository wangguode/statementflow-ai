import type { Metadata } from "next";
import CsvFixerClient from "./client";

const title =
  "QuickBooks & Xero CSV Import Fixer — Clean Bank CSV Errors Locally | StatementFlow";
const description =
  "Fix QuickBooks Online & Xero bank CSV import errors 100% locally in your browser. Auto-normalize dates (MM/DD/YYYY or DD/MM/YYYY), merge split Debit/Credit columns, strip currency symbols, invert credit card signs, and export clean 3-col QuickBooks or 5-col Xero CSV.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/tools/quickbooks-csv-fixer",
  },
  openGraph: {
    title,
    description,
    url: "/tools/quickbooks-csv-fixer",
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

export default function QuickBooksCsvFixerPage() {
  return <CsvFixerClient />;
}
