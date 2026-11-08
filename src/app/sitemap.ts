import type { MetadataRoute } from "next";
import { PSEO_BANK_ENTRIES } from "@/lib/pseo-banks";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://statementflow.ai";

  const now = new Date();

  const bankRoutes: MetadataRoute.Sitemap = PSEO_BANK_ENTRIES.map((entry) => ({
    url: `${baseUrl}/convert/${entry.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...bankRoutes,
  ];
}
