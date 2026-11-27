import type { Metadata } from "next";
import CsvFixerClient from "./client";

export const metadata: Metadata = {
  title:
    "Free QuickBooks & Xero CSV Import Fixer — Clean Bank CSV Errors Locally | StatementFlow",
  description:
    "Fix QuickBooks Online & Xero bank CSV import errors 100% locally in your browser. Auto-normalize dates (MM/DD/YYYY or DD/MM/YYYY), merge split Debit/Credit columns, strip currency symbols, invert credit card signs, and export clean 3-col QuickBooks or 5-col Xero CSV.",
  alternates: {
    canonical: "/tools/quickbooks-csv-fixer",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function QuickBooksCsvFixerPage() {
  return <CsvFixerClient />;
}
