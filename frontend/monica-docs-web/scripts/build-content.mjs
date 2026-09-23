import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import GithubSlugger from "github-slugger";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = resolve(projectRoot, "../../docs");
const monicaRoot = resolve(process.env.MONICA_SOURCE_ROOT || resolve(projectRoot, "../../../MoLibrary"));
const generated = resolve(projectRoot, "src/generated");
const sha256 = (bytes) => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;

export function parseMarkdown(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(text);
  const metadata = {};
  for (const line of (match?.[1] || "").split(/\r?\n/u)) {
    const pair = /^([\w-]+):\s*(.*?)\s*$/u.exec(line);
    if (pair) metadata[pair[1]] = pair[2].replace(/^(["'])(.*)\1$/u, "$2");
  }
  return { metadata, markdown: match ? text.slice(match[0].length).trim() : text.trim() };
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, "en")).flatMap((entry) => {
    if (entry.name.startsWith(".") || entry.isSymbolicLink()) return [];
    const file = join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

function headings(markdown) {
  const slugger = new GithubSlugger();
  let fence = null;
  return markdown.split(/\r?\n/u).flatMap((line) => {
    const marker = /^\s*(`{3,}|~{3,})/u.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null;
      return [];
    }
    const match = !fence && /^(#{1,6})\s+(.+?)(?:\s+#+\s*)?$/u.exec(line);
    if (!match) return [];
    const title = match[2].replace(/[*`]/gu, "");
    return [{ id: slugger.slug(title), title, level: match[1].length }];
  });
}

// Prefer the last commit date over mtime so rebuilds do not re-date unchanged
// pages; mtime remains the fallback for files without git history.
function lastCommitDate(file) {
  try {
    const stamp = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], { cwd: dirname(file), encoding: "utf8" }).trim();
    if (stamp) return stamp;
  } catch {
    // Not inside a git repository (for example a test fixture); use mtime.
  }
  return statSync(file).mtime.toISOString();
}

export function projectDocuments(root, bundle) {
  const owners = new Map(bundle.skills.flatMap((skill) => skill.modules.map((moduleSlug) => [moduleSlug, skill.name])));
  const result = {};
  for (const [locale, folder] of [["en", "en-US"], ["zh-CN", "zh-CN"]]) {
    const localeRoot = join(root, folder);
    const categories = {};
    const documents = [];
    for (const file of walk(localeRoot).filter((file) => file.endsWith(".md"))) {
      const relative = file.slice(localeRoot.length + 1).replaceAll("\\", "/");
      const bytes = readFileSync(file);
      const parsed = parseMarkdown(bytes.toString("utf8"));
      if (!parsed.metadata.title) throw new Error(`Missing document title: ${file}`);
      if (relative.endsWith("_category_.md")) {
        categories[posix.dirname(relative)] = parsed.metadata.title;
        continue;
      }
      if (relative.startsWith("modules/")) throw new Error(`Retired module documentation must be owned by a skill: ${relative}`);
      const slug = relative.replace(/\.md$/u, "").replace(/\/index$/u, "");
      const prefix = locale === "en" ? "" : "/zh-CN";
      // Rewrite links from the retired module tree to its one canonical capability.
      const markdown = parsed.markdown.replace(/(\]\()([^\s)]+)(\))/gu, (whole, start, href, end) => {
        if (/^(?:[a-z]+:|#|\/\/)/iu.test(href)) return whole;
        const linkPath = href.split(/[?#]/u)[0];
        const target = posix.normalize(linkPath.startsWith("/")
          ? linkPath.replace(/^\/(?:zh-CN\/)?docs\//u, "")
          : posix.join(posix.dirname(relative), linkPath));
        const moduleSlug = /^modules\/([^/]+)/u.exec(target)?.[1];
        const owner = owners.get(moduleSlug);
        return owner ? `${start}${prefix}/skills/${owner}${end}` : whole;
      }).replaceAll("{{monica.version}}", bundle.frameworkVersion);
      const title = parsed.metadata.title;
      documents.push({
        locale: folder, slug, title, relativePath: `${folder}/${relative}`,
        canonicalPath: `${prefix}/docs${slug === "index" ? "" : `/${slug}`}`,
        markdown, lastModifiedUtc: lastCommitDate(file), date: null,
        tags: [], metadata: { ...parsed.metadata, sourceDigest: sha256(bytes) },
        headings: headings(markdown),
        breadcrumbs: [{ title: locale === "en" ? "Guides" : "指南", slug: "index", isCurrent: false }, { title, slug, isCurrent: true }],
        alternates: [], previous: null, next: null,
      });
    }
    documents.sort((a, b) => {
      const group = a.slug.split("/")[0].localeCompare(b.slug.split("/")[0], "en");
      return group || Number(a.metadata.sidebar_position || 0) - Number(b.metadata.sidebar_position || 0) || a.slug.localeCompare(b.slug, "en");
    });
    const groups = new Map();
    for (const document of documents) {
      const group = document.slug.split("/")[0];
      if (!groups.has(group)) groups.set(group, { title: categories[group] || document.title, path: group, slug: null, isDocument: false, children: [] });
      groups.get(group).children.push({ title: document.title, path: document.relativePath, slug: document.slug, isDocument: true, children: [] });
    }
    result[locale] = { documents, tree: [...groups.values()] };
  }
  for (const locale of ["en", "zh-CN"]) {
    const other = result[locale === "en" ? "zh-CN" : "en"].documents;
    for (const document of result[locale].documents) {
      const alternate = other.find((candidate) => candidate.slug === document.slug);
      if (alternate) document.alternates.push({ locale: alternate.locale, slug: alternate.slug, title: alternate.title, path: alternate.canonicalPath });
    }
  }
  return result;
}

export function verifyKnowledge(bundle, { releaseRef, catalogBytes, frameworkVersion } = {}) {
  if (bundle.schemaVersion !== 1 || !Array.isArray(bundle.skills) || !bundle.skills.length) throw new Error("Invalid or empty Monica knowledge artifact.");
  if (frameworkVersion && bundle.frameworkVersion !== frameworkVersion) throw new Error("Knowledge and website framework versions differ.");
  if (sha256(`${JSON.stringify(bundle.skills, null, 2)}\n`) !== bundle.contentDigest) throw new Error("Knowledge content digest mismatch.");
  if (catalogBytes && sha256(catalogBytes) !== bundle.catalogDigest) throw new Error("Knowledge and installed catalog describe different releases.");
  for (const skill of bundle.skills) {
    if (!/^[a-z0-9-]+$/u.test(skill.name) || !skill.files.some((file) => file.path === "SKILL.md")) throw new Error("Invalid published skill entrypoint.");
    for (const file of skill.files) {
      if (file.path.startsWith("/") || file.path.includes("\\") || file.path.split("/").includes("..")) throw new Error("Invalid published skill resource path.");
      if (sha256(file.content) !== file.digest) throw new Error(`Knowledge resource digest mismatch: ${skill.name}/${file.path}`);
    }
  }
  if (releaseRef && (bundle.source.mode !== "release" || bundle.source.dirty || bundle.source.ref !== releaseRef || `v${bundle.frameworkVersion}` !== releaseRef)) {
    throw new Error("Public builds require the matching immutable knowledge release.");
  }
}

async function loadKnowledge() {
  const isRelease = process.env.MONICA_PUBLIC_RELEASE_BUILD === "1";
  const releaseRef = isRelease ? process.env.MONICA_AGENT_SKILL_REF?.trim() : undefined;
  const supplied = process.env.MONICA_KNOWLEDGE_BUNDLE_PATH?.trim();
  if (isRelease && !/^v\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/u.test(releaseRef || "")) throw new Error("A versioned release ref is required for published knowledge.");
  let bytes;
  if (isRelease) {
    const base = `https://github.com/Tairitsua/Monica/releases/download/${encodeURIComponent(releaseRef)}`;
    const [content, checksums] = await Promise.all([
      supplied ? Promise.resolve(null) : fetch(`${base}/monica-knowledge.json`),
      fetch(`${base}/SHA256SUMS`),
    ]);
    if ((!supplied && !content?.ok) || !checksums.ok) throw new Error("The selected release has no verified Monica knowledge artifact.");
    bytes = supplied ? readFileSync(resolve(supplied)) : Buffer.from(await content.arrayBuffer());
    const expected = (await checksums.text()).split(/\r?\n/u).find((line) => line.trim().endsWith("  monica-knowledge.json"))?.split(/\s+/u)[0];
    if (!expected || sha256(bytes) !== `sha256:${expected}`) throw new Error("Published knowledge checksum mismatch.");
  } else if (supplied) bytes = readFileSync(resolve(supplied));
  else {
    const script = join(monicaRoot, "scripts/export_agent_knowledge.py");
    if (!existsSync(script)) throw new Error("Set MONICA_SOURCE_ROOT or MONICA_KNOWLEDGE_BUNDLE_PATH to the canonical knowledge source.");
    const output = join(generated, "knowledge.json");
    execFileSync(process.env.PYTHON || (process.platform === "win32" ? "python" : "python3"), [script, "--root", monicaRoot, "--output", output], { stdio: "inherit" });
    bytes = readFileSync(output);
  }
  const bundle = JSON.parse(bytes.toString("utf8"));
  const catalogPath = process.env.MONICA_AGENT_SKILL_CATALOG_PATH || join(monicaRoot, ".monica/agent-skill-catalog.json");
  const props = readFileSync(process.env.MONICA_VERSION_PROPS_PATH || join(monicaRoot, "Directory.Build.props"), "utf8");
  const versions = [...props.matchAll(/<Version>([^<]+)<\/Version>/gu)];
  if (versions.length !== 1) throw new Error("Expected one framework version in Directory.Build.props.");
  verifyKnowledge(bundle, { releaseRef, catalogBytes: readFileSync(catalogPath), frameworkVersion: versions[0][1].trim() });
  writeFileSync(join(generated, "knowledge.json"), bytes);
  return bundle;
}

export async function buildContent() {
  mkdirSync(generated, { recursive: true });
  const bundle = await loadKnowledge();
  const documents = projectDocuments(docsRoot, bundle);
  writeFileSync(join(generated, "documents.json"), `${JSON.stringify(documents, null, 2)}\n`);
  console.log(`Built ${bundle.skills.length} skills and ${Object.values(documents).reduce((count, locale) => count + locale.documents.length, 0)} stable guides from canonical content.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await buildContent();
