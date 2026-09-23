import type { Root } from "mdast";

import type { Locale } from "@/content/home";
import { getSkill, skillFileRoute } from "@/lib/knowledge";

type MarkdownNode = {
  type: string;
  value?: string;
  url?: string;
  children?: MarkdownNode[];
};

const SKILL_MENTION = /\$([a-z][a-z\d]*(?:-[a-z\d]+)+)\b/gu;

function linkMentions(node: MarkdownNode, locale: Locale): void {
  if (!node.children || node.type === "link" || node.type === "linkReference") {
    return;
  }

  const children: MarkdownNode[] = [];
  for (const child of node.children) {
    if (child.type !== "text" || !child.value) {
      linkMentions(child, locale);
      children.push(child);
      continue;
    }

    let start = 0;
    for (const match of child.value.matchAll(SKILL_MENTION)) {
      const skill = getSkill(match[1]);
      if (!skill) {
        continue;
      }

      const index = match.index;
      if (index > start) {
        children.push({ type: "text", value: child.value.slice(start, index) });
      }
      children.push({
        type: "link",
        url: skillFileRoute(locale, skill.name),
        children: [{ type: "text", value: match[0] }],
      });
      start = index + match[0].length;
    }

    if (start === 0) {
      children.push(child);
    } else if (start < child.value.length) {
      children.push({ type: "text", value: child.value.slice(start) });
    }
  }
  node.children = children;
}

export function remarkSkillMentions(locale: Locale) {
  return () => (tree: Root) => linkMentions(tree as unknown as MarkdownNode, locale);
}
