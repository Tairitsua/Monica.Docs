import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "../globals.css";

import type { Metadata, Viewport } from "next";

import { SiteLayout } from "@/app/site-layout";
import { sharedMetadata, sharedViewport } from "@/app/site-metadata";

export const metadata: Metadata = sharedMetadata;
export const viewport: Viewport = sharedViewport;

export default function ChineseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteLayout locale="zh-CN">{children}</SiteLayout>;
}
