import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../../..");
const docsRoot = path.join(repositoryRoot, "docs");
const localeRoots = ["en-US", "zh-CN"];
const errors = [];

const launchPages = [
  "getting-started/agent-setup.md",
  "getting-started/guide-operations.md",
];

const expectedLaunchTitles = {
  "en-US": {
    "getting-started/_category_.md": "Getting started",
    "getting-started/agent-setup.md": "Agent setup",
    "getting-started/guide-operations.md": "Guide operations and safety",
  },
  "zh-CN": {
    "getting-started/_category_.md": "快速开始",
    "getting-started/agent-setup.md": "Agent 设置",
    "getting-started/guide-operations.md": "Guide 运维与安全",
  },
};

const launchStructures = new Map();

for (const locale of localeRoots) {
  const localeRoot = path.join(docsRoot, locale);
  for (const filePath of walkMarkdownFiles(localeRoot)) {
    validateDocument(filePath, locale, localeRoot);
  }

  for (const [relativePath, expectedTitle] of Object.entries(expectedLaunchTitles[locale])) {
    const filePath = path.join(localeRoot, relativePath);
    if (!fs.existsSync(filePath)) {
      errors.push(`${locale}/${relativePath}: launch-critical navigation entry is missing.`);
      continue;
    }

    const { metadata } = parseDocument(filePath);
    if (metadata.title !== expectedTitle) {
      errors.push(`${locale}/${relativePath}: expected localized title "${expectedTitle}", found "${metadata.title ?? ""}".`);
    }
  }
}

for (const relativePath of launchPages) {
  const english = launchStructures.get(`en-US/${relativePath}`);
  const chinese = launchStructures.get(`zh-CN/${relativePath}`);
  if (!english || !chinese) {
    continue;
  }

  if (english.length !== chinese.length || english.some((level, index) => level !== chinese[index])) {
    errors.push(`${relativePath}: en-US and zh-CN heading structures must stay aligned.`);
  }
}

if (errors.length > 0) {
  console.error("Documentation content validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("Documentation frontmatter, title/body contracts, and launch localization are valid.");
}

function validateDocument(filePath, locale, localeRoot) {
  const relativePath = path.relative(localeRoot, filePath).replaceAll(path.sep, "/");
  const displayPath = `${locale}/${relativePath}`;
  const { metadata, body } = parseDocument(filePath);

  for (const key of ["title", "description", "sidebar_position"]) {
    if (!metadata[key]) {
      errors.push(`${displayPath}: frontmatter field "${key}" is required.`);
    }
  }

  const bodyLines = body.split(/\r?\n/u);
  const parsedHeadings = parseHeadings(bodyLines);
  const topLevelHeadings = parsedHeadings.filter((heading) => heading.level === 1);

  if (topLevelHeadings.length > 0) {
    errors.push(`${displayPath}: frontmatter title is canonical; the Markdown body must not contain a level-one heading.`);
  }

  if (metadata.display_title) {
    errors.push(`${displayPath}: display_title is not supported; use the canonical localized frontmatter title.`);
  }

  if (launchPages.includes(relativePath)) {
    launchStructures.set(
      displayPath,
      parsedHeadings.filter((heading) => heading.level >= 2).map((heading) => heading.level),
    );
  }
}

function parseHeadings(lines) {
  const headings = [];
  let fence = null;

  for (const line of lines) {
    const fenceMatch = /^\s*(`{3,}|~{3,})/u.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) {
        fence = marker;
      } else if (marker[0] === fence[0] && marker.length >= fence.length) {
        fence = null;
      }
      continue;
    }

    if (fence) {
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+?)(?:\s+#+\s*)?$/u.exec(line);
    if (headingMatch) {
      headings.push({ level: headingMatch[1].length });
    }
  }

  return headings;
}

function parseDocument(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(source);
  if (!match) {
    errors.push(`${path.relative(docsRoot, filePath)}: YAML frontmatter is required.`);
    return { metadata: {}, body: source };
  }

  const metadata = {};
  for (const line of match[1].split(/\r?\n/u)) {
    const entry = /^([a-z][a-z\d_-]*):\s*(.*?)\s*$/iu.exec(line);
    if (entry) {
      metadata[entry[1]] = unquote(entry[2]);
    }
  }

  return { metadata, body: source.slice(match[0].length) };
}

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function walkMarkdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return walkMarkdownFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
    })
    .sort((left, right) => left.localeCompare(right, "en"));
}
