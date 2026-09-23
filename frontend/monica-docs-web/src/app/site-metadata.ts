import type { Metadata, Viewport } from "next";

import type { Locale } from "@/content/home";
import { MONICA_GITHUB_URL } from "@/lib/external-links";
import { localizedPath, routeAlternates } from "@/lib/routes";

export const siteUrl = "https://monica.dpdns.org";

export const sharedMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Monica",
  title: {
    default: "Monica — .NET application architecture for coding agents",
    template: "%s · Monica",
  },
  description:
    "Monica gives coding agents and .NET teams shared guidance for application architecture, infrastructure, and runtime inspection.",
  keywords: [".NET", "ASP.NET Core", "coding agents", "Agent Skills", "application architecture", "modular framework", "OpenTelemetry", "DDD"],
  authors: [{ name: "Monica contributors", url: MONICA_GITHUB_URL }],
  creator: "Monica contributors",
  openGraph: {
    type: "website",
    siteName: "Monica",
    title: "Monica — .NET application architecture for coding agents",
    description: "Canonical Agent Skills and inspectable .NET applications.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Monica — .NET application architecture for coding agents",
    description: "Canonical Agent Skills and inspectable .NET applications.",
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
