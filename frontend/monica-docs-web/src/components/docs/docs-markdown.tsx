import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import type { Locale } from "@/content/home";
import { docsPath } from "@/lib/routes";

function rewriteAssetSource(source: string | Blob): string | Blob {
  if (typeof source !== "string") {
    return source;
  }

  try {
    const url = new URL(source, "https://monica.local");
    if (url.pathname.toLowerCase() === "/api/v1/documentation/assets") {
      return `/api/docs/assets?${url.searchParams.toString()}`;
    }
  } catch {
    return source;
  }

  return source;
}

function MarkdownImage({ src, alt }: ComponentPropsWithoutRef<"img">) {
  if (!src) {
    return null;
  }

  const rewrittenSource = rewriteAssetSource(src);
  if (typeof rewrittenSource !== "string") {
    return null;
  }

  return <Image className="docs-media" src={rewrittenSource} alt={alt ?? ""} width={1280} height={720} unoptimized />;
}

type MarkdownLinkProps = ComponentPropsWithoutRef<"a"> & {
  locale: Locale;
  currentSlug: string;
};

function MarkdownLink({ href = "", children, locale, currentSlug, ...props }: MarkdownLinkProps) {
  const external = /^https?:\/\//iu.test(href);
  const resolvedHref = resolveDocumentationHref(href, locale, currentSlug);
  return (
    <a href={resolvedHref} {...props} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      {children}
      {external && <ArrowUpRight className="docs-external-icon" aria-hidden="true" size={13} />}
    </a>
  );
}

export function DocsMarkdown({ markdown, locale, currentSlug }: { markdown: string; locale: Locale; currentSlug: string }) {
  return (
    <div className="docs-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: (props) => <MarkdownLink {...props} locale={locale} currentSlug={currentSlug} />,
          img: MarkdownImage,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

function resolveDocumentationHref(href: string, locale: Locale, currentSlug: string): string {
  if (!href || href.startsWith("#") || href.startsWith("//") || /^[a-z][a-z\d+.-]*:/iu.test(href)) {
    return href;
  }

  const match = /^([^?#]*)(\?[^#]*)?(#.*)?$/u.exec(href);
  const linkPath = match?.[1] ?? href;
  if (!/\.(?:md|markdown)$/iu.test(linkPath)) {
    return href;
  }

  const query = match?.[2] ?? "";
  const fragment = match?.[3] ?? "";
  const normalizedPath = linkPath.replaceAll("\\", "/");
  const explicitChinesePath = /^\/zh-cn\/docs(?:\/|$)/iu.test(normalizedPath);
  const targetLocale: Locale = explicitChinesePath ? "zh-CN" : locale;
  const strippedPath = normalizedPath
    .replace(/^\/zh-cn\/docs\/?/iu, "")
    .replace(/^\/docs\/?/iu, "")
    .replace(/^\/+/u, "");
  const baseSegments = normalizedPath.startsWith("/") ? [] : currentSlug.split("/").slice(0, -1);
  const resolvedSegments = [...baseSegments];

  for (const segment of strippedPath.split("/")) {
    if (!segment || segment === ".") {
      continue;
    }

    if (segment === "..") {
      resolvedSegments.pop();
      continue;
    }

    resolvedSegments.push(segment);
  }

  const lastSegment = resolvedSegments.at(-1);
  if (lastSegment) {
    resolvedSegments[resolvedSegments.length - 1] = lastSegment.replace(/\.(?:md|markdown)$/iu, "");
  }

  const slug = resolvedSegments.filter(Boolean).join("/");
  return `${docsPath(targetLocale, slug)}${query}${fragment}`;
}
