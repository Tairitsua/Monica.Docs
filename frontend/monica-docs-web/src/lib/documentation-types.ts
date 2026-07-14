import type { Locale } from "@/content/home";

export type DocumentationLocale = "en-US" | "zh-CN";
export type DocumentationSource = "api" | "fallback" | "unavailable";

export type DocTreeItem = {
  title: string;
  path: string;
  slug: string | null;
  isDocument: boolean;
  children: DocTreeItem[];
};

export type DocHeading = {
  id: string;
  title: string;
  level: number;
};

export type DocBreadcrumb = {
  title: string;
  slug: string | null;
  isCurrent: boolean;
};

export type DocAlternate = {
  locale: string;
  slug: string;
  title: string;
  path: string;
};

export type DocNavigationLink = {
  slug: string;
  title: string;
  path: string;
};

export type DocContent = {
  locale: string;
  slug: string;
  title: string;
  relativePath: string;
  canonicalPath: string;
  markdown: string;
  lastModifiedUtc: string;
  date: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  headings: DocHeading[];
  breadcrumbs: DocBreadcrumb[];
  alternates: DocAlternate[];
  previous: DocNavigationLink | null;
  next: DocNavigationLink | null;
};

export type DocSearchMatch = {
  start: number;
  length: number;
};

export type DocSearchResult = {
  locale: string;
  slug: string;
  title: string;
  path: string;
  pathTrail: string | null;
  sectionTitle: string | null;
  previewText: string;
  previewHighlights: DocSearchMatch[];
  anchorId: string | null;
  score: number;
};

export type DocumentationResult<T> = {
  data: T;
  source: DocumentationSource;
};

export function toDocumentationLocale(locale: Locale): DocumentationLocale {
  return locale === "zh-CN" ? "zh-CN" : "en-US";
}
