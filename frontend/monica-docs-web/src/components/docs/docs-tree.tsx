import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/content/home";
import type { DocTreeItem } from "@/lib/documentation-types";
import { docsPath } from "@/lib/routes";

export function DocsTree({ locale, items, activeSlug, compact = false }: { locale: Locale; items: DocTreeItem[]; activeSlug?: string; compact?: boolean }) {
  return (
    <nav className={`docs-tree${compact ? " is-compact" : ""}`} aria-label={locale === "en" ? "Documentation navigation" : "文档导航"}>
      <TreeItems locale={locale} items={items} activeSlug={activeSlug} />
    </nav>
  );
}
function TreeItems({ locale, items, activeSlug }: { locale: Locale; items: DocTreeItem[]; activeSlug?: string }) {
  return (
    <ul>
      {items.map((item) => {
        const itemKey = `${item.path}-${item.slug ?? "folder"}`;
        if (item.isDocument && item.slug) {
          const isActive = item.slug === activeSlug;
          return (
            <li key={itemKey}>
              <Link className={isActive ? "is-active" : undefined} href={docsPath(locale, item.slug)} aria-current={isActive ? "page" : undefined}>
                <FileText aria-hidden="true" size={15} />
                <span>{item.title}</span>
                <ChevronRight aria-hidden="true" size={14} />
              </Link>
            </li>
          );
        }

        return (
          <li className="docs-tree-group" key={itemKey}>
            <span>{item.title}</span>
            {item.children.length > 0 && <TreeItems locale={locale} items={item.children} activeSlug={activeSlug} />}
          </li>
        );
      })}
    </ul>
  );
}
