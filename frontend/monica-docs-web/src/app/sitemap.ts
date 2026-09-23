import type { MetadataRoute } from "next";

import { siteUrl } from "@/app/site-metadata";
import type { Locale } from "@/content/home";
import { flattenDocumentationTree, getDocumentationSlugs, getDocumentationTree } from "@/lib/documentation-api";
import { knowledge, skillFileRoute } from "@/lib/knowledge";
import { docsPath, localizedPath, routeAlternates } from "@/lib/routes";

const LAST_MODIFIED = new Date("2026-07-13");
const staticPaths = ["/", "/docs", "/skills", "/modules", "/reference", "/roadmap"] as const;
const locales: readonly Locale[] = ["en", "zh-CN"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticPaths.flatMap((path) => locales.map((locale) => createEntry(
    localizedPath(locale, path),
    path === "/" ? (locale === "en" ? 1 : 0.9) : 0.8,
    path,
  )));

  const trees = await Promise.all(locales.map(async (locale) => ({ locale, tree: await getDocumentationTree(locale) })));
  const seen = new Set<string>();
  const docsEntries: MetadataRoute.Sitemap = [];

  for (const { locale, tree } of trees) {
    for (const item of flattenDocumentationTree(tree.data)) {
      if (!item.isDocument || !item.slug || item.slug === "index") {
        continue;
      }

      const path = docsPath(locale, item.slug);
      if (seen.has(path)) {
        continue;
      }

      seen.add(path);
      docsEntries.push({
        url: absoluteUrl(path),
        lastModified: LAST_MODIFIED,
        changeFrequency: "monthly",
        priority: 0.65,
        alternates: {
          languages: {
            ...(getDocumentationSlugs("en").includes(item.slug) ? { en: absoluteUrl(docsPath("en", item.slug)) } : {}),
            ...(getDocumentationSlugs("zh-CN").includes(item.slug) ? { "zh-CN": absoluteUrl(docsPath("zh-CN", item.slug)) } : {}),
          },
        },
      });
    }
  }

  const skillEntries: MetadataRoute.Sitemap = knowledge.skills.flatMap((skill) =>
    skill.files.flatMap((file) => locales.map((locale) => ({
      url: absoluteUrl(skillFileRoute(locale, skill.name, file.path)),
      lastModified: new Date(knowledge.source.updatedAt),
      changeFrequency: "monthly" as const,
      priority: file.path === "SKILL.md" ? 0.8 : 0.6,
      alternates: { languages: {
        en: absoluteUrl(skillFileRoute("en", skill.name, file.path)),
        "zh-CN": absoluteUrl(skillFileRoute("zh-CN", skill.name, file.path)),
      } },
    }))),
  );
  return [...staticEntries, ...docsEntries, ...skillEntries];
}

function createEntry(path: string, priority: number, sharedPath: string): MetadataRoute.Sitemap[number] {
  const alternates = routeAlternates(sharedPath);
  return {
    url: absoluteUrl(path),
    lastModified: LAST_MODIFIED,
    changeFrequency: "weekly",
    priority,
    alternates: {
      languages: {
        en: absoluteUrl(alternates.en),
        "zh-CN": absoluteUrl(alternates["zh-CN"]),
      },
    },
  };
}

function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
