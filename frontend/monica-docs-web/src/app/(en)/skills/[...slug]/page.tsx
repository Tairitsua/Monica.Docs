import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createLocalizedMetadata } from "@/app/site-metadata";
import { SkillArticlePage } from "@/components/skills/skills-pages";
import { getSkill, getSkillFile, skillStaticParams } from "@/lib/knowledge";

type Props = { params: Promise<{ slug: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return skillStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkill(slug[0] ?? "");
  const filePath = slug.slice(1).join("/") || "SKILL.md";
  const file = skill && getSkillFile(skill.name, filePath);
  if (!skill || !file) notFound();
  return createLocalizedMetadata("en", `/skills/${slug.join("/")}`, filePath === "SKILL.md" ? skill.title : `${file.title} — ${skill.title}`, skill.description);
}

export default async function EnglishSkillArticle({ params }: Props) {
  const { slug } = await params;
  return <SkillArticlePage locale="en" skillName={slug[0] ?? ""} filePath={slug.slice(1).join("/") || "SKILL.md"} />;
}
