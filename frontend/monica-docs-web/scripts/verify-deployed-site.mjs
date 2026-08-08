import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const DEFAULT_PUBLIC_URL = "https://monica.dpdns.org";
const HTML_ROUTES = [
  "/",
  "/docs/getting-started",
  "/docs/getting-started/agent-setup",
  "/zh-CN/docs/getting-started",
  "/zh-CN/docs/getting-started/agent-setup",
  "/reference",
];
const SEMANTIC_VERSION_SOURCE = String.raw`(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?`;
const SEMANTIC_VERSION = new RegExp(`^${SEMANTIC_VERSION_SOURCE}$`, "u");
const IMMUTABLE_RELEASE_TAG = new RegExp(`^v${SEMANTIC_VERSION_SOURCE}$`, "u");
const RELEASE_MANIFEST_SCHEMA_VERSION = 2;
const CATALOG_DIGEST = /^sha256:[0-9a-f]{64}$/u;
const EXPECTED_CONTENT_SIGNALS = new Map([
  ["search", "yes"],
  ["ai-input", "yes"],
  ["ai-train", "no"],
  ["use", "reference"],
]);
const CLOUDFLARE_EMAIL_MARKERS = [
  "/cdn-cgi/l/email-protection",
  "data-cfemail",
  "email-decode.min.js",
  "[email protected]",
];

export async function verifyDeployedSite(
  publicUrl = process.env.MONICA_DOCS_PUBLIC_URL?.trim() || DEFAULT_PUBLIC_URL,
  expectedRef = process.env.MONICA_AGENT_SKILL_REF?.trim(),
  options = {},
) {
  if (!expectedRef) {
    throw new Error("MONICA_AGENT_SKILL_REF is required to verify the deployed immutable Monica release tag.");
  }
  if (!IMMUTABLE_RELEASE_TAG.test(expectedRef)) {
    throw new Error(`MONICA_AGENT_SKILL_REF must be an immutable Monica release tag, received ${expectedRef}.`);
  }
  const fetchImpl = options.fetchImpl ?? fetch;
  const expectedSkillsCli = await loadPublishedSkillsCli(expectedRef, {
    fetchImpl,
    releaseAssetBaseUrl: options.releaseAssetBaseUrl,
  });
  const root = new URL("/", ensureTrailingSlash(publicUrl));
  const [htmlResponses, robotsResponse] = await Promise.all([
    Promise.all(HTML_ROUTES.map(async (route) => {
      const response = await fetchImpl(new URL(route, root), { headers: { "cache-control": "no-cache" } });
      if (!response.ok) throw new Error(`${route} returned ${response.status}.`);
      return [route, await response.text()];
    })),
    fetchImpl(new URL("/robots.txt", root), { headers: { "cache-control": "no-cache" } }),
  ]);
  if (!robotsResponse.ok) throw new Error(`robots.txt returned ${robotsResponse.status}.`);

  const pages = Object.fromEntries(htmlResponses);
  const html = pages["/"];
  const robots = await robotsResponse.text();
  const expectedVersion = expectedRef.slice(1);
  const expectedTemplatePackage = `Monica.Templates@${expectedVersion}`;
  const expectedSkillsCliPackage = `${expectedSkillsCli.package}@${expectedSkillsCli.version}`;
  for (const [route, routeHtml] of htmlResponses) {
    for (const marker of CLOUDFLARE_EMAIL_MARKERS) {
      if (routeHtml.includes(marker)) {
        throw new Error(`Cloudflare transformed executable content on ${route} (${marker}).`);
      }
    }
  }
  assertExactPackageSpec(html, expectedSkillsCli.package, expectedSkillsCliPackage, "catalog-pinned skills CLI", "/");
  assertExactPackageSpec(html, "Monica.Templates", expectedTemplatePackage, "Monica.Templates", "/");
  for (const route of ["/docs/getting-started", "/zh-CN/docs/getting-started"]) {
    assertExactPackageSpec(pages[route], "Monica.Templates", expectedTemplatePackage, "Monica.Templates", route);
  }

  if (!html.includes(`/tree/${expectedRef}/skills/monica-guide`)) {
    throw new Error(`The deployed homepage does not advertise ${expectedRef}.`);
  }
  const robotsGroups = parseRobotsGroups(robots);
  verifyContentSignals(robotsGroups);
  for (const crawler of ["gptbot", "claudebot", "chatgpt-user", "claude-user"]) {
    if (isCrawlerBlocked(robotsGroups, crawler)) {
      throw new Error(`robots.txt still blocks ${crawler} from documentation retrieval.`);
    }
  }

  console.log(`Verified ${HTML_ROUTES.length} edge-served HTML routes, package strings, and crawler policy at ${root.origin}.`);
}

export async function loadPublishedSkillsCli(expectedRef, options = {}) {
  if (!IMMUTABLE_RELEASE_TAG.test(expectedRef)) {
    throw new Error(`Cannot resolve a published skills CLI for invalid release tag ${expectedRef}.`);
  }
  const fetchImpl = options.fetchImpl ?? fetch;
  const releaseAssetBaseUrl = (
    options.releaseAssetBaseUrl
    ?? `https://github.com/Tairitsua/Monica/releases/download/${expectedRef}`
  ).replace(/\/$/u, "");
  const [catalogResponse, manifestResponse] = await Promise.all([
    fetchImpl(`${releaseAssetBaseUrl}/agent-skill-catalog.json`, { headers: { "cache-control": "no-cache" } }),
    fetchImpl(`${releaseAssetBaseUrl}/agent-skill-manifest.json`, { headers: { "cache-control": "no-cache" } }),
  ]);
  if (!catalogResponse.ok) {
    throw new Error(`Published catalog for ${expectedRef} returned ${catalogResponse.status}.`);
  }
  if (!manifestResponse.ok) {
    throw new Error(`Published manifest for ${expectedRef} returned ${manifestResponse.status}.`);
  }

  const catalogBytes = new Uint8Array(await catalogResponse.arrayBuffer());
  const manifestBytes = new Uint8Array(await manifestResponse.arrayBuffer());
  const catalog = parseJsonObject(catalogBytes, `Published catalog for ${expectedRef}`);
  const manifest = parseJsonObject(manifestBytes, `Published manifest for ${expectedRef}`);
  const catalogDigest = `sha256:${createHash("sha256").update(catalogBytes).digest("hex")}`;
  if (
    manifest.schemaVersion !== RELEASE_MANIFEST_SCHEMA_VERSION
    || manifest.tag !== expectedRef
    || manifest.monicaVersion !== expectedRef.slice(1)
    || manifest.catalogUrl !== `${releaseAssetBaseUrl}/agent-skill-catalog.json`
    || !CATALOG_DIGEST.test(manifest.catalogDigest)
    || manifest.catalogDigest !== catalogDigest
    || manifest.files?.[".monica/agent-skill-catalog.json"] !== catalogDigest
  ) {
    throw new Error(`Published manifest does not bind the catalog bytes for ${expectedRef}.`);
  }

  const skillsCli = catalog?.distribution?.skillsCli;
  if (
    catalog?.distribution?.repository !== "Tairitsua/Monica"
    || skillsCli?.package !== "skills"
    || typeof skillsCli.version !== "string"
    || !SEMANTIC_VERSION.test(skillsCli.version)
  ) {
    throw new Error(`Unexpected skills CLI distribution contract for ${expectedRef}.`);
  }
  return { package: skillsCli.package, version: skillsCli.version };
}

function assertExactPackageSpec(content, packageName, expected, label, route) {
  const escapedPackageName = packageName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}_.-])${escapedPackageName}@[^\\s<>"'&()\\[\\]{},;:]+`,
    "gu",
  );
  const matches = [...content.matchAll(pattern)].map((match) => match[0]);
  if (!matches.includes(expected)) {
    throw new Error(`${route} does not preserve the exact ${label} package specifier ${expected}.`);
  }
  const unexpected = matches.find((value) => value !== expected);
  if (unexpected) {
    throw new Error(`${route} contains unexpected ${label} package specifier ${unexpected}; expected only ${expected}.`);
  }
}

function parseRobotsGroups(content) {
  const groups = [];
  let agents = [];
  let directives = [];
  const flush = () => {
    if (agents.length > 0 && directives.length > 0) {
      groups.push({ agents, directives });
    }
    agents = [];
    directives = [];
  };

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.split("#", 1)[0].trim();
    if (!line) {
      if (directives.length > 0) flush();
      continue;
    }
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const name = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (name === "user-agent") {
      if (directives.length > 0) flush();
      if (value) agents.push(value.toLowerCase());
    } else if (agents.length > 0) {
      directives.push({ name, value });
    }
  }
  flush();
  return groups;
}

function isCrawlerBlocked(groups, crawler) {
  const specificGroups = groups.filter((group) => group.agents.includes(crawler));
  const applicableGroups = specificGroups.length > 0
    ? specificGroups
    : groups.filter((group) => group.agents.includes("*"));
  return applicableGroups.some((group) => group.directives.some((directive) => (
    directive.name === "disallow"
    && (directive.value === "/" || /^\/\*+\$?$/u.test(directive.value))
  )));
}

function verifyContentSignals(groups) {
  const wildcardGroups = groups.filter((group) => group.agents.includes("*"));
  if (wildcardGroups.length === 0) {
    throw new Error("robots.txt is missing the wildcard crawler policy.");
  }
  const allSignals = parseContentSignals(groups);
  const wildcardSignals = parseContentSignals(wildcardGroups);
  for (const [name, expected] of EXPECTED_CONTENT_SIGNALS) {
    const observed = allSignals.get(name) ?? new Set();
    const contradictory = [...observed].find((value) => value !== expected);
    if (contradictory) {
      throw new Error(`robots.txt contains contradictory Content-Signal ${name}=${contradictory}.`);
    }
    if (!wildcardSignals.get(name)?.has(expected)) {
      throw new Error(`robots.txt wildcard policy is missing Content-Signal ${name}=${expected}.`);
    }
  }
}

function parseContentSignals(groups) {
  const signals = new Map();
  for (const group of groups) {
    for (const directive of group.directives.filter(({ name }) => name === "content-signal")) {
      for (const item of directive.value.split(",")) {
        const candidate = item.trim().toLowerCase();
        const parsed = candidate.match(/^([a-z][a-z0-9-]*)\s*=\s*([a-z][a-z0-9-]*)$/u);
        const recognizedName = candidate.split("=", 1)[0]?.trim();
        if (!parsed) {
          if (EXPECTED_CONTENT_SIGNALS.has(recognizedName)) {
            throw new Error(`robots.txt contains malformed Content-Signal ${candidate}.`);
          }
          continue;
        }
        const [, name, value] = parsed;
        const values = signals.get(name) ?? new Set();
        values.add(value);
        signals.set(name, values);
      }
    }
  }
  return signals;
}

function parseJsonObject(bytes, label) {
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(bytes));
  } catch (error) {
    throw new Error(`${label} is not valid UTF-8 JSON.`, { cause: error });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error(`${label} must contain a JSON object.`);
  }
  return payload;
}

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await verifyDeployedSite(process.argv[2], process.argv[3] ?? process.env.MONICA_AGENT_SKILL_REF?.trim());
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
