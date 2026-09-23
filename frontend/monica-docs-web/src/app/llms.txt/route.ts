import { siteUrl } from "@/app/site-metadata";
import { knowledge, rawSkillFileRoute, searchSkills, skillFileRoute } from "@/lib/knowledge";

export function GET(): Response {
  const lines = [
    "# Monica Agent Skills",
    "",
    "Canonical Monica knowledge for coding agents and developers. Each raw link serves the exact Markdown in the published skill catalog.",
    `Framework: ${knowledge.frameworkVersion}`,
    `Source: ${knowledge.source.repository}@${knowledge.source.ref} (${knowledge.source.mode}${knowledge.source.dirty ? ", dirty preview" : ""})`,
    `Catalog digest: ${knowledge.catalogDigest}`,
    `Content digest: ${knowledge.contentDigest}`,
    "",
    `Skill library: ${siteUrl}/skills`,
    "",
    "## Skills",
    "",
  ];

  for (const skill of searchSkills("")) {
    lines.push(`- ${skill.title} ($${skill.name}) — ${skill.description}`);
    lines.push(`  Human: ${siteUrl}${skillFileRoute("en", skill.name)}`);
    for (const file of skill.files) {
      lines.push(`  ${file.path}: ${siteUrl}${rawSkillFileRoute(skill.name, file.path)}`);
    }
  }

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
