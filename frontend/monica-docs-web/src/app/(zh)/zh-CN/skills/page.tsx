import type { Metadata } from "next";

import { createLocalizedMetadata } from "@/app/site-metadata";
import { SkillsLandingPage } from "@/components/skills/skills-pages";

export const metadata: Metadata = createLocalizedMetadata(
  "zh-CN",
  "/skills",
  "Monica Agent Skills",
  "直接来自 Monica 源码的 Agent Skills，涵盖主机、基础设施、架构与开发。",
);

export default async function ChineseSkillsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  return <SkillsLandingPage locale="zh-CN" query={typeof q === "string" ? q : ""} />;
}
