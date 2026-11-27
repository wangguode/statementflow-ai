import type { Metadata } from "next";
import { StatementWorkbench } from "@/components/statement-workbench";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const HOME_FAQ_JSON_LD = {
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
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_FAQ_JSON_LD) }}
      />
      <StatementWorkbench />
    </>
  );
}
