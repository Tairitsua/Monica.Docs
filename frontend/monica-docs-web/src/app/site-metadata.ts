import type { Metadata, Viewport } from "next";

import type { Locale } from "@/content/home";
import { localizedPath, routeAlternates } from "@/lib/routes";

export const siteUrl = "https://monica.dpdns.org";

export const sharedMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Monica",
  title: {
    default: "Monica — Observable .NET application architecture",
    template: "%s · Monica",
  },
  description:
    "Monica gives .NET teams architecture agents can follow and systems humans can inspect.",
  keywords: [".NET", "ASP.NET Core", "application architecture", "modular framework", "OpenTelemetry", "DDD"],
  authors: [{ name: "Monica contributors", url: "https://github.com/Tairitsua/Monica" }],
  creator: "Monica contributors",
  openGraph: {
    type: "website",
    siteName: "Monica",
    title: "Monica — Observable .NET application architecture",
    description: "Architecture agents can follow. Systems humans can inspect.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Monica — Observable .NET application architecture",
    description: "Architecture agents can follow. Systems humans can inspect.",
  },
  category: "technology",
};

export const sharedViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f2eee5",
  colorScheme: "light",
};

export function createLocalizedMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const canonical = localizedPath(locale, path);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: routeAlternates(path),
    },
    openGraph: {
      locale: locale === "en" ? "en_US" : "zh_CN",
      title,
      description,
      url: canonical,
    },
    twitter: {
      title,
      description,
    },
  };
}
