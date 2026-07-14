import type { Metadata } from "next";

import { DocsArticlePage } from "@/components/docs/docs-pages";
import { getFallbackDocumentationSlugs } from "@/lib/documentation-api";
import { createDocumentationArticleMetadata, type DocumentationArticlePageProps } from "@/lib/documentation-metadata";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return getFallbackDocumentationSlugs("zh-CN").map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({ params }: DocumentationArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  return createDocumentationArticleMetadata("zh-CN", slug.join("/"));
}

export default async function ChineseDocsArticle({ params }: DocumentationArticlePageProps) {
  const { slug } = await params;
  return <DocsArticlePage locale="zh-CN" slug={slug.join("/")} />;
}
