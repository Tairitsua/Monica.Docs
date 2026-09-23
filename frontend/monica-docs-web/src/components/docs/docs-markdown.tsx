import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { ComponentProps, ComponentPropsWithoutRef } from "react";
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

function MarkdownImage({ src, alt, hrefResolver }: ComponentPropsWithoutRef<"img"> & { hrefResolver?: (href: string, rawAsset?: boolean) => string }) {
  if (!src) {
    return null;
  }

  const rewrittenSource = rewriteAssetSource(src);
  if (typeof rewrittenSource !== "string") {
    return null;
  }

  return <Image className="docs-media" src={hrefResolver?.(rewrittenSource, true) ?? rewrittenSource} alt={alt ?? ""} width={1280} height={720} unoptimized />;
}

type MarkdownLinkProps = ComponentPropsWithoutRef<"a"> & {
  locale: Locale;
  currentSlug: string;
  hrefResolver?: (href: string, rawAsset?: boolean) => string;
};

function MarkdownLink({ href = "", children, locale, currentSlug, hrefResolver, ...props }: MarkdownLinkProps) {
  const resolvedHref = hrefResolver?.(href) ?? resolveDocumentationHref(href, locale, currentSlug);
  const external = /^https?:\/\//iu.test(resolvedHref);
  return (
    <a href={resolvedHref} {...props} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      {children}
      {external && <ArrowUpRight className="docs-external-icon" aria-hidden="true" size={13} />}
    </a>
  );
}

export function DocsMarkdown({ markdown, locale, currentSlug, hrefResolver, remarkPlugins }: { markdown: string; locale: Locale; currentSlug: string; hrefResolver?: (href: string, rawAsset?: boolean) => string; remarkPlugins?: ComponentProps<typeof ReactMarkdown>["remarkPlugins"] }) {
  return (
    <div className="docs-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, ...(remarkPlugins ?? [])]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: (props) => <MarkdownLink {...props} locale={locale} currentSlug={currentSlug} hrefResolver={hrefResolver} />,
          img: (props) => <MarkdownImage {...props} hrefResolver={hrefResolver} />,
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
