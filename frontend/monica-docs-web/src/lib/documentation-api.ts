import "server-only";

import type { Locale } from "@/content/home";
import snapshotData from "@/generated/documents.json";
import type { DocContent, DocSearchResult, DocTreeItem, DocumentationResult } from "@/lib/documentation-types";
import { knowledge, skillFileRoute } from "@/lib/knowledge";
import { normalizeDocSlug } from "@/lib/routes";

const snapshot = snapshotData as Record<Locale, { documents: DocContent[]; tree: DocTreeItem[] }>;

// Only media proxying needs the authoring API. Articles and search share the
// same generated snapshot, so an API outage cannot change published guidance.
export function getDocumentationApiBaseUrl(): string | null {
  try {
    const url = new URL(process.env.MONICA_DOCS_API_URL?.trim() ?? "");
    return ["http:", "https:"].includes(url.protocol) ? url.toString().replace(/\/$/u, "") : null;
  } catch {
    return null;
  }
}

export async function getDocumentationTree(locale: Locale): Promise<DocumentationResult<DocTreeItem[]>> {
  return { data: snapshot[locale].tree, source: "snapshot" };
}

export async function getDocumentationArticle(locale: Locale, slug: string): Promise<DocumentationResult<DocContent | null>> {
  const normalized = normalizeDocSlug(slug).replace(/\/index$/u, "");
  const document = snapshot[locale].documents.find((item) => item.slug === normalized) ?? null;
  return { data: document, source: document ? "snapshot" : "unavailable" };
}

export function retiredModuleDestination(locale: Locale, slug: string): string | null {
  const moduleSlug = /^modules\/([^/]+)/u.exec(normalizeDocSlug(slug))?.[1];
  const owner = knowledge.skills.find((skill) => skill.modules.includes(moduleSlug ?? ""));
  return owner ? skillFileRoute(locale, owner.name) : null;
}

export async function searchDocumentation(locale: Locale, query: string): Promise<DocumentationResult<DocSearchResult[]>> {
  const term = query.trim().toLocaleLowerCase();
  if (!term) return { data: [], source: "snapshot" };
  const candidates = [
    ...snapshot[locale].documents.map((document) => ({
      slug: document.slug, title: document.title, path: document.canonicalPath,
      text: document.markdown, pathTrail: locale === "en" ? "Guides" : "指南",
    })),
    ...knowledge.skills.flatMap((skill) => skill.files.map((file) => ({
      slug: `${skill.name}/${file.path}`, title: file.path === "SKILL.md" ? skill.title : `${skill.title} / ${file.title}`,
      path: skillFileRoute(locale, skill.name, file.path), text: file.content,
      pathTrail: "Skills",
    }))),
  ];
  const results = candidates.flatMap((item): DocSearchResult[] => {
    const titleMatch = item.title.toLocaleLowerCase().includes(term);
    const index = item.text.toLocaleLowerCase().indexOf(term);
    if (!titleMatch && index < 0) return [];
    const start = Math.max(0, index - 70);
    return [{
      locale: locale === "en" ? "en-US" : locale, slug: item.slug, title: item.title,
      path: item.path, pathTrail: item.pathTrail, sectionTitle: null,
      previewText: item.text.slice(start, start + 220).replace(/[#*`]/gu, "").replace(/\s+/gu, " ").trim(),
      previewHighlights: [], anchorId: null, score: titleMatch ? 2 : 1,
    }];
  }).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 30);
  return { data: results, source: "snapshot" };
}

export function getDocumentationSlugs(locale: Locale): string[] {
  return snapshot[locale].documents.map((document) => document.slug).filter((slug) => slug !== "index");
}

export function flattenDocumentationTree(items: DocTreeItem[]): DocTreeItem[] {
  return items.flatMap((item) => [item, ...flattenDocumentationTree(item.children ?? [])]);
}
