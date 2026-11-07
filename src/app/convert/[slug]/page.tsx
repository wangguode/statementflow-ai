import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { PSEO_BANK_ENTRIES, findPseoBankBySlug } from "@/lib/pseo-banks";
import { findSampleById } from "@/lib/samples";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PSEO_BANK_ENTRIES.map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bank = findPseoBankBySlug(slug);
  if (!bank) {
    return {
      title: "Converter Not Found | StatementFlow",
    };
  }

  const title = `Convert ${bank.institutionName} PDF to ${bank.targetFormat} | StatementFlow`;
  const description = bank.heroSubheadline;

  return {
    title,
    description,
    alternates: {
      canonical: `/convert/${bank.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/convert/${bank.slug}`,
    },
  };
}

export default async function BankConverterLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const bank = findPseoBankBySlug(slug);
  if (!bank) {
    notFound();
  }

  const preset = findSampleById(bank.recommendedSampleId);

  // Google Rich Results 结构化数据（SoftwareApplication + FAQPage）
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: `StatementFlow ${bank.institutionName} to ${bank.targetFormat} Converter`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0.00",
        priceCurrency: bank.defaultCurrency,
      },
      description: bank.heroSubheadline,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: bank.specificFaqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ];

  return (
    <div className="min-h-svh overflow-x-clip bg-[#f5f5f7] text-[#111215]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 顶栏 */}
      <header className="sticky top-0 z-40 bg-[#f5f5f7]/95 text-[#111215]">
        <div className="sf-wrap flex min-h-16 items-center justify-between gap-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-[#0066cc] text-sm font-semibold text-white">
              S
            </span>
            <span>StatementFlow</span>
          </Link>

          <nav
            aria-label="Converter Navigation"
            className="hidden items-center gap-8 text-base font-medium lg:flex"
          >
            <Link href="/#workbench" className="opacity-80 hover:opacity-100">
              Live Studio
            </Link>
            <Link
              href="/#how-it-works"
              className="opacity-80 hover:opacity-100"
            >
              Verification Method
            </Link>
            <Link href="/#pricing" className="opacity-80 hover:opacity-100">
              Plans
            </Link>
            <a href="#other-banks" className="opacity-80 hover:opacity-100">
              All Converters
            </a>
          </nav>

          <Link
            href={`/?bank=${bank.slug}#workbench`}
            className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white"
          >
            <span>Open {bank.shortName}</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </header>

      <main className="overflow-x-clip">
        {/* Chapter 1: Hero */}
        <section className="bg-[#f5f5f7] pt-12 pb-16 text-[#111215] lg:pt-20 lg:pb-24">
          <div className="sf-wrap">
            <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <h1 className="sf-display text-[#111215]">
                  {bank.heroHeadline}
                </h1>
                <p className="sf-lead mt-6 text-[#494b52]">
                  {bank.heroSubheadline}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/?bank=${bank.slug}#workbench`}
                    className="sf-btn inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0066cc] px-6 py-3 text-base font-semibold text-white"
                  >
                    <span>
                      Launch Studio with {bank.institutionName} Preset
                    </span>
                    <ArrowUpRight className="size-4" />
                  </Link>
                  <Link
                    href="/#pricing"
                    className="sf-btn inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#e8e8ed] px-5 py-3 text-base font-medium text-[#111215]"
                  >
                    <span>View Pro & Firm Plans</span>
                  </Link>
                </div>
              </div>

              <div className="rounded-xl bg-[#e8e8ed] p-6 lg:col-span-4">
                <div className="flex items-center justify-between gap-2 text-sm font-medium text-[#494b52]">
                  <span>{bank.region}</span>
                  <span className="tabular-nums text-[#111215]">
                    {bank.defaultCurrency} · {bank.targetFormat}
                  </span>
                </div>
                <div className="sf-lead mt-2 font-semibold tabular-nums text-[#111215]">
                  Opening + Credits - Debits = Closing
                </div>
                <p className="mt-3 text-sm text-[#494b52]">
                  Every extracted {bank.institutionName} statement row is
                  verified deterministically before export.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Chapter 2: Obsidian Studio - Statement Quirk & Sample Preview */}
        <section className="bg-[#0a0b0e] py-16 text-[#f5f5f7] lg:py-24">
          <div className="sf-wrap">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <h2 className="sf-head text-white">Engineered for accuracy.</h2>
                <div className="mt-4 text-base font-semibold text-white">
                  {bank.statementQuirkTitle}
                </div>
                <p className="mt-3 text-base text-[#a0a6b5]">
                  {bank.statementQuirkDescription}
                </p>

                <div className="mt-8 rounded-xl bg-[#141720] p-6">
                  <div className="text-base font-semibold text-white">
                    Supported {bank.institutionName} Documents
                  </div>
                  <ul className="mt-4 space-y-2.5 text-sm text-[#d5d9e2]">
                    {bank.supportedAccountTypes.map((acct) => (
                      <li key={acct} className="flex items-center gap-2.5">
                        <ShieldCheck className="size-4 shrink-0 text-[#0066cc]" />
                        <span>{acct}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div data-ui="bank-preview" className="ui-surface p-6 lg:col-span-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-white">
                      Sample Output Preview ({bank.defaultCurrency})
                    </div>
                    <div className="text-sm text-[#9ca3b5]">
                      Pre-configured for {bank.institutionName}
                    </div>
                  </div>
                  <Link
                    href={`/?bank=${bank.slug}#workbench`}
                    className="sf-btn inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white"
                  >
                    <span>Edit in Live Studio</span>
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>

                <pre className="ui-input mt-4 max-h-[260px] overflow-x-auto overflow-y-auto p-4 text-sm leading-relaxed tabular-nums text-[#d5d9e2]">
                  {preset?.rawPreviewText}
                </pre>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {bank.extractedColumns.slice(0, 3).map((col) => (
                    <div key={col} className="ui-tile p-3 text-sm text-white">
                      {col}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chapter 3: Architectural Stone - Archival Proof & Extracted Schema */}
        <section className="bg-[#e4e3df] py-16 text-[#141413] lg:py-24">
          <div className="sf-wrap">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <figure className="lg:col-span-6">
                <div className="overflow-hidden rounded-xl bg-[#141413]">
                  <Image
                    src="/assets/blythe-house-ledger-room-1924.jpg"
                    alt="Historical ledger verification hall at Blythe House, 1924"
                    width={1920}
                    height={1440}
                    unoptimized
                    className="sf-archival-img aspect-[4/3] w-full"
                  />
                </div>
                <figcaption className="mt-3 text-sm text-[#4a4944]">
                  Archival ledger verification standards applied to modern{" "}
                  {bank.institutionName} digital statements.
                </figcaption>
              </figure>

              <div className="lg:col-span-6">
                <h2 className="sf-head text-[#141413]">
                  Five verified columns.
                </h2>
                <p className="mt-4 text-base text-[#4a4944]">
                  Every {bank.institutionName} upload is normalized into a
                  consistent 5-column accounting structure ready for{" "}
                  {bank.targetFormat}.
                </p>
                <ul className="mt-6 space-y-3 text-base font-medium text-[#141413]">
                  {bank.extractedColumns.map((col) => (
                    <li
                      key={col}
                      className="rounded-xl bg-[#d7d6d2] px-5 py-3.5"
                    >
                      {col}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Chapter 4: Deep Slate - Specific Bank FAQ */}
        <section className="bg-[#151921] py-16 text-[#f5f5f7] lg:py-24">
          <div className="sf-wrap">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 className="sf-head text-white">Bank questions.</h2>
                <p className="mt-4 text-base text-[#a0a6b5]">
                  Specific details on converting {bank.institutionName}{" "}
                  statements into {bank.targetFormat}.
                </p>
              </div>

              <div className="space-y-3 lg:col-span-8">
                {bank.specificFaqs.map((faq, idx) => (
                  <details
                    key={faq.q}
                    open={idx === 0}
                    className="rounded-xl bg-[#1e2430] p-6 text-[#f5f5f7] open:bg-[#0066cc] open:text-white"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
                      <span>{faq.q}</span>
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0a0b0e]/25 text-base tabular-nums">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-xl text-base leading-relaxed opacity-90">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Full Programmatic SEO Internal Link Matrix */}
      <footer
        id="other-banks"
        className="overflow-x-clip bg-[#0a0b0e] py-16 text-[#f5f5f7] lg:py-24"
      >
        <div className="sf-wrap">
          <div className="text-base font-semibold text-white">
            Supported Bank & Invoice Converters
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {PSEO_BANK_ENTRIES.map((item) => (
              <Link
                key={item.slug}
                href={`/convert/${item.slug}`}
                className={`inline-flex min-h-11 items-center justify-between rounded-lg px-4 py-2 text-sm font-medium ${
                  item.slug === bank.slug
                    ? "bg-[#0066cc] text-white"
                    : "bg-[#151921] text-[#c5cad6] hover:text-white"
                }`}
              >
                <span>{item.shortName}</span>
                <span className="tabular-nums opacity-75">
                  {item.defaultCurrency}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm text-[#8b92a5]">
            <span>
              StatementFlow Financial Engineering · Deterministic Ledger Studio
            </span>
            <Link
              href="/"
              className="inline-flex min-h-8 items-center text-white underline"
            >
              Return to Main Studio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
