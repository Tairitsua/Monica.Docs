"use client";

import { ArrowUpRight, Search, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

import type { Locale } from "@/content/home";
import type { DocSearchResult, DocumentationSource } from "@/lib/documentation-types";

type DocsSearchProps = {
  locale: Locale;
  label: string;
  placeholder: string;
  action: string;
  hint: string;
  noResults: string;
};

export function DocsSearch({ locale, label, placeholder, action, hint, noResults }: DocsSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DocSearchResult[]>([]);
  const [source, setSource] = useState<DocumentationSource | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setState("idle");
        setResults([]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setState("idle");
      setResults([]);
      return;
    }

    setState("loading");
    try {
      const parameters = new URLSearchParams({ query: normalizedQuery, locale });
      const response = await fetch(`/api/docs/search?${parameters.toString()}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error("Search request failed.");
      }

      const payload = await response.json() as { results?: DocSearchResult[]; source?: DocumentationSource };
      setResults(payload.results ?? []);
      setSource(payload.source ?? null);
      setState("ready");
      requestAnimationFrame(() => regionRef.current?.focus());
    } catch {
      setResults([]);
      setSource(null);
      setState("error");
    }
  }

  const statusText = state === "loading"
    ? (locale === "en" ? "Searching documentation…" : "正在搜索文档…")
    : state === "error"
      ? (locale === "en" ? "Search is temporarily unavailable." : "搜索暂时不可用。")
      : state === "ready"
        ? (locale === "en" ? `${results.length} documentation results.` : `找到 ${results.length} 条文档结果。`)
        : "";

  return (
    <div className="docs-search">
      <form className="docs-search-form" role="search" onSubmit={submitSearch}>
        <label className="sr-only" htmlFor={`docs-search-${locale}`}>{label}</label>
        <Search aria-hidden="true" size={19} />
        <input
          id={`docs-search-${locale}`}
          type="search"
          value={query}
          maxLength={160}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <button
            className="docs-search-clear"
            type="button"
            aria-label={locale === "en" ? "Clear search" : "清除搜索"}
            onClick={() => {
              setQuery("");
              setResults([]);
              setState("idle");
            }}
          >
            <X aria-hidden="true" size={16} />
          </button>
        )}
        <button className="docs-search-submit" type="submit">{action}</button>
      </form>
      <p className="docs-search-hint">{hint}</p>
      <p className="sr-only" aria-live="polite">{statusText}</p>

      {(state === "loading" || state === "error") && <div className="docs-search-state">{statusText}</div>}
      {state === "ready" && (
        <div className="docs-search-results" ref={regionRef} tabIndex={-1}>
          <div className="docs-search-results-head">
            <span>{results.length.toString().padStart(2, "0")} {locale === "en" ? "RESULTS" : "条结果"}</span>
            {source && <span>{source === "api" ? "PUBLIC API" : locale === "en" ? "LOCAL PREVIEW" : "本地预览"}</span>}
          </div>
          {results.length === 0 ? <p className="docs-search-empty">{noResults}</p> : (
            <ol>
              {results.map((result) => (
                <li key={`${result.slug}-${result.anchorId ?? "root"}`}>
                  <Link href={`${result.path}${result.anchorId ? `#${result.anchorId}` : ""}`}>
                    <span>{result.pathTrail ?? (locale === "en" ? "Docs" : "文档")}</span>
                    <strong>{result.sectionTitle ?? result.title}</strong>
                    <p>{result.previewText}</p>
                    <ArrowUpRight aria-hidden="true" size={16} />
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
