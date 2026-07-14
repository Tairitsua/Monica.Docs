import "server-only";

import type { Metadata } from "next";

import type { Locale } from "@/content/home";
import { getDocumentationArticle } from "@/lib/documentation-api";
import { docsPath, oppositeLocale } from "@/lib/routes";

const fallbackMetadata: Record<Locale, { title: string; description: string }> = {
  en: { title: "Documentation", description: "Monica documentation article." },
  "zh-CN": { title: "使用文档", description: "Monica 中文文档。" },
};

export type DocumentationArticlePageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function createDocumentationArticleMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const article = await getDocumentationArticle(locale, slug);
  const fallback = fallbackMetadata[locale];
  const canonicalSlug = article.data?.slug ?? slug;
  const alternateLocale = oppositeLocale(locale);
  const alternateCulture = alternateLocale === "en" ? "en-us" : "zh-cn";
  const alternateSlug = article.data?.alternates.find((item) => item.locale.toLowerCase() === alternateCulture)?.slug ?? slug;

  return {
    title: article.data?.title ?? fallback.title,
    description: article.data ? summarizeMarkdown(article.data.markdown) : fallback.description,
    alternates: {
      canonical: docsPath(locale, canonicalSlug),
      languages: {
        en: docsPath("en", locale === "en" ? canonicalSlug : alternateSlug),
        "zh-CN": docsPath("zh-CN", locale === "zh-CN" ? canonicalSlug : alternateSlug),
      },
    },
  };
}

function summarizeMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/gu, " ")
    .replace(/[#*`_()]/gu, " ")
    .replaceAll("[", " ")
    .replaceAll("]", " ")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, 155);
}
