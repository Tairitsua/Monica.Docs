import type { Metadata } from "next";

import { createLocalizedMetadata } from "@/app/site-metadata";
import { SkillsLandingPage } from "@/components/skills/skills-pages";

export const metadata: Metadata = createLocalizedMetadata(
  "en",
  "/skills",
  "Monica Agent Skills",
  "Canonical Monica Agent Skills for application hosting, infrastructure, architecture, and development.",
);

export default async function EnglishSkillsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  return <SkillsLandingPage locale="en" query={typeof q === "string" ? q : ""} />;
}
