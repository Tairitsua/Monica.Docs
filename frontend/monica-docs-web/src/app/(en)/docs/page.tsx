import type { Metadata } from "next";

import { createLocalizedMetadata } from "@/app/site-metadata";
import { DocsLandingPage } from "@/components/docs/docs-pages";

export const revalidate = 300;

export const metadata: Metadata = createLocalizedMetadata(
  "en",
  "/docs",
  "Documentation",
  "Executable guidance for Monica application architecture, modules, and runtime evidence.",
);

export default function EnglishDocsPage() {
  return <DocsLandingPage locale="en" />;
}
