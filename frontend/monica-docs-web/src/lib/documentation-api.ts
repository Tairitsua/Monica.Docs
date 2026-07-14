import "server-only";

import {
  getFallbackDocument,
  getFallbackDocuments,
  getFallbackTree,
  searchFallbackDocuments,
} from "@/content/docs-fallback";
import type { Locale } from "@/content/home";
import type {
  DocContent,
  DocSearchResult,
  DocTreeItem,
  DocumentationResult,
} from "@/lib/documentation-types";
import { toDocumentationLocale } from "@/lib/documentation-types";
import { normalizeDocSlug } from "@/lib/routes";

const DOCUMENTATION_API_PATH = "/api/v1/Documentation";
const REQUEST_TIMEOUT_MS = 3500;

export function getDocumentationApiBaseUrl(): string | null {
  const configuredUrl = process.env.MONICA_DOCS_API_URL?.trim();
  if (!configuredUrl) {
    return null;
  }

  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString().replace(/\/$/u, "");
  } catch {
    return null;
  }
}

export function isDocumentationApiConfigured(): boolean {
  return getDocumentationApiBaseUrl() !== null;
}

async function requestApi<T>(endpoint: string, parameters: Record<string, string>): Promise<T | null> {
  const baseUrl = getDocumentationApiBaseUrl();
  if (!baseUrl) {
    return null;
  }

  const url = new URL(`${baseUrl}${DOCUMENTATION_API_PATH}/${endpoint}`);
  for (const [name, value] of Object.entries(parameters)) {
    url.searchParams.set(name, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    return unwrapEnvelope<T>(payload);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function unwrapEnvelope<T>(payload: unknown): T | null {
  if (payload === null || payload === undefined) {
    return null;
  }

  if (typeof payload === "object" && !Array.isArray(payload) && "data" in payload) {
    return (payload as { data: T | null }).data ?? null;
  }

  return payload as T;
}

export async function getDocumentationTree(locale: Locale): Promise<DocumentationResult<DocTreeItem[]>> {
  const documents = await requestApi<DocTreeItem[]>("tree", { locale: toDocumentationLocale(locale) });
  if (Array.isArray(documents)) {
    return { data: documents, source: "api" };
  }

  const fallback = getFallbackTree(locale);
  return { data: fallback, source: fallback.length > 0 ? "fallback" : "unavailable" };
}

export async function getDocumentationArticle(locale: Locale, slug: string): Promise<DocumentationResult<DocContent | null>> {
  const normalizedSlug = normalizeDocSlug(slug);
  const document = await requestApi<DocContent>("doc", {
    slug: normalizedSlug,
    locale: toDocumentationLocale(locale),
  });

  if (document && typeof document === "object") {
    return { data: document, source: "api" };
  }

  const fallback = getFallbackDocument(locale, normalizedSlug);
  if (fallback) {
    return { data: fallback, source: "fallback" };
  }

  return { data: null, source: "unavailable" };
}

export async function searchDocumentation(locale: Locale, query: string): Promise<DocumentationResult<DocSearchResult[]>> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return { data: [], source: isDocumentationApiConfigured() ? "api" : "fallback" };
  }

  const results = await requestApi<DocSearchResult[]>("search", {
    query: normalizedQuery,
    locale: toDocumentationLocale(locale),
  });
  if (Array.isArray(results)) {
    return { data: results, source: "api" };
  }

  return { data: searchFallbackDocuments(locale, normalizedQuery), source: "fallback" };
}

export function getFallbackDocumentationSlugs(locale: Locale): string[] {
  return getFallbackDocuments(locale).map((document) => document.slug);
}

export function flattenDocumentationTree(items: DocTreeItem[]): DocTreeItem[] {
  return items.flatMap((item) => [item, ...flattenDocumentationTree(item.children ?? [])]);
}
