import type { Locale } from "@/content/home";

export function localizedPath(locale: Locale, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (locale === "en") {
    return normalizedPath;
  }

  return normalizedPath === "/" ? "/zh-CN" : `/zh-CN${normalizedPath}`;
}

export function docsPath(locale: Locale, slug?: string | null): string {
  const normalizedSlug = normalizeDocSlug(slug ?? "");
  const publicSlug = normalizedSlug.endsWith("/index")
    ? normalizedSlug.slice(0, -"/index".length)
    : normalizedSlug;
  const suffix = publicSlug && publicSlug !== "index" ? `/${publicSlug}` : "";
  return localizedPath(locale, `/docs${suffix}`);
}

export function oppositeLocale(locale: Locale): Locale {
  return locale === "en" ? "zh-CN" : "en";
}

export function normalizeDocSlug(value: string): string {
  const withoutQuery = value.split(/[?#]/u, 1)[0] ?? "";

  return withoutQuery
    .replaceAll("\\", "/")
    .replace(/\.(?:md|markdown)$/iu, "")
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment && segment !== "." && segment !== "..")
    .join("/")
    .toLowerCase();
}

export function routeAlternates(path: string) {
  return {
    en: localizedPath("en", path),
    "zh-CN": localizedPath("zh-CN", path),
  };
}
