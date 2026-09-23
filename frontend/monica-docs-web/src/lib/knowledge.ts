import knowledgeData from "@/generated/knowledge.json";
import type { Locale } from "@/content/home";

export type KnowledgeFile = {
  path: string;
  title: string;
  content: string;
  digest: string;
};

export type KnowledgeSkill = {
  name: string;
  title: string;
  description: string;
  role: "router" | "capability";
  modules: string[];
  files: KnowledgeFile[];
};

export type KnowledgeCatalog = {
  schemaVersion: 1;
  frameworkVersion: string;
  source: {
    repository: string;
    ref: string;
    commit: string;
    mode: "source" | "release";
    dirty: boolean;
    updatedAt: string;
  };
  catalogDigest: string;
  contentDigest: string;
  skills: KnowledgeSkill[];
};

export const knowledge = knowledgeData as KnowledgeCatalog;

if (knowledge.schemaVersion !== 1) {
  throw new Error(`Unsupported knowledge schema: ${knowledge.schemaVersion}`);
}

const skillByName = new Map(knowledge.skills.map((skill) => [skill.name, skill]));

export function getSkill(name: string): KnowledgeSkill | undefined {
  return skillByName.get(name);
}

export function getSkillFile(skillName: string, filePath: string): KnowledgeFile | undefined {
  return getSkill(skillName)?.files.find((file) => file.path === filePath);
}

export function skillFileRoute(locale: Locale, skillName: string, filePath = "SKILL.md"): string {
  const prefix = locale === "en" ? "" : "/zh-CN";
  const fileSuffix = filePath === "SKILL.md" ? "" : `/${filePath.split("/").map(encodeURIComponent).join("/")}`;
  return `${prefix}/skills/${encodeURIComponent(skillName)}${fileSuffix}`;
}

export function rawSkillFileRoute(skillName: string, filePath = "SKILL.md"): string {
  return `/api/skills/${encodeURIComponent(skillName)}/${filePath.split("/").map(encodeURIComponent).join("/")}`;
}

export function skillSourceUrl(skillName: string, filePath = "SKILL.md"): string {
  return sourceUrl(`skills/${skillName}/${filePath}`);
}

export function sourceUrl(repositoryPath: string, raw = false): string {
  const safePath = repositoryPath.split("/").filter(Boolean).map(encodeURIComponent).join("/");
  const ref = encodeURIComponent(knowledge.source.ref);
  if (raw) {
    return `https://raw.githubusercontent.com/${knowledge.source.repository}/${ref}/${safePath}`;
  }
  return `https://github.com/${knowledge.source.repository}/blob/${ref}/${safePath}`;
}

export function searchSkills(query: string): KnowledgeSkill[] {
  const term = query.trim().toLocaleLowerCase();
  const matches = term
    ? knowledge.skills.filter((skill) =>
        [skill.name, skill.title, skill.description, ...skill.modules].some((value) =>
          value.toLocaleLowerCase().includes(term),
        ),
      )
    : knowledge.skills;
  return [...matches].sort((a, b) => {
    const aPriority = a.name.startsWith("monica-infra-") ? 0 : 1;
    const bPriority = b.name.startsWith("monica-infra-") ? 0 : 1;
    return aPriority - bPriority || a.title.localeCompare(b.title);
  });
}

export function skillStaticParams(): { slug: string[] }[] {
  return knowledge.skills.flatMap((skill) =>
    skill.files.map((file) => ({
      slug: [skill.name, ...(file.path === "SKILL.md" ? [] : file.path.split("/"))],
    })),
  );
}

export function resolveSkillMarkdownHref(
  href: string,
  locale: Locale,
  currentSkillName: string,
  currentFilePath: string,
  rawAsset = false,
): string {
  if (!href || href.startsWith("#") || href.startsWith("//") || /^[a-z][a-z\d+.-]*:/iu.test(href)) {
    return href;
  }

  const link = new URL(href.replaceAll("\\", "/"), `https://monica.local/skills/${currentSkillName}/${currentFilePath}`);
  const segments = link.pathname.split("/").filter(Boolean).map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });
  const suffix = `${link.search}${link.hash}`;
  if (segments[0] === "skills" && segments[1]) {
    const targetSkill = getSkill(segments[1]);
    const targetFile = segments.slice(2).join("/") || "SKILL.md";
    if (/\.(?:md|markdown)$/iu.test(targetFile) && targetSkill && getSkillFile(targetSkill.name, targetFile)) {
      return `${skillFileRoute(locale, targetSkill.name, targetFile)}${suffix}`;
    }
  }

  if (href.startsWith("/") && segments[0] !== "skills" && !/\.[a-z\d]+$/iu.test(link.pathname)) {
    return href;
  }

  return `${sourceUrl(segments.join("/"), rawAsset)}${suffix}`;
}

export function renderedSkillMarkdown(content: string): string {
  return content.replace(/^\uFEFF/u, "").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/u, "").replace(/^\s*# [^\n]+\r?\n/u, "");
}
