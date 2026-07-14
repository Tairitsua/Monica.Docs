import { permanentRedirect } from "next/navigation";

import { docsPath, normalizeDocSlug } from "@/lib/routes";

type LegacySearchParams = Record<string, string | string[] | undefined>;

export default async function LegacyMarkdownDocsRedirect({ searchParams }: { searchParams: Promise<LegacySearchParams> }) {
  const parameters = await searchParams;
  const culture = firstValue(parameters.culture)?.toLowerCase();
  const locale = culture === "zh-cn" ? "zh-CN" : "en";
  const document = normalizeDocSlug(firstValue(parameters.document) ?? "");
  const slug = document === "index" ? "" : document;

  permanentRedirect(docsPath(locale, slug));
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
