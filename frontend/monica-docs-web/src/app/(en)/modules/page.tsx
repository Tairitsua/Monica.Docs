import type { Metadata } from "next";

import { createLocalizedMetadata } from "@/app/site-metadata";
import { ModulesPage } from "@/components/launch/launch-pages";

export const metadata: Metadata = createLocalizedMetadata(
  "en",
  "/modules",
  "Module catalog",
  "Browse the complete Monica package catalog by Stable, Integrations, and Labs maturity tiers.",
);

export default function EnglishModulesPage() {
  return <ModulesPage locale="en" />;
}
