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
const CATALOG_PINNED_CLI = /skills@[0-9]+\.[0-9]+\.[0-9]+ add/u;
const TEMPLATE_PACKAGE = /Monica\.Templates@[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?/u;
const IMMUTABLE_RELEASE_TAG = /^v[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/u;
const CLOUDFLARE_EMAIL_MARKERS = [
  "/cdn-cgi/l/email-protection",
  "data-cfemail",
  "email-decode.min.js",
  "[email protected]",
];

export async function verifyDeployedSite(
  publicUrl = process.env.MONICA_DOCS_PUBLIC_URL?.trim() || DEFAULT_PUBLIC_URL,
  expectedRef = process.env.MONICA_AGENT_SKILL_REF?.trim(),
) {
  if (!expectedRef) {
    throw new Error("MONICA_AGENT_SKILL_REF is required to verify the deployed immutable Monica release tag.");
  }
  if (!IMMUTABLE_RELEASE_TAG.test(expectedRef)) {
    throw new Error(`MONICA_AGENT_SKILL_REF must be an immutable Monica release tag, received ${expectedRef}.`);
  }
  const root = new URL("/", ensureTrailingSlash(publicUrl));
  const [htmlResponses, robotsResponse] = await Promise.all([
    Promise.all(HTML_ROUTES.map(async (route) => {
      const response = await fetch(new URL(route, root), { headers: { "cache-control": "no-cache" } });
      if (!response.ok) throw new Error(`${route} returned ${response.status}.`);
      return [route, await response.text()];
    })),
    fetch(new URL("/robots.txt", root), { headers: { "cache-control": "no-cache" } }),
  ]);
  if (!robotsResponse.ok) throw new Error(`robots.txt returned ${robotsResponse.status}.`);

  const pages = Object.fromEntries(htmlResponses);
  const html = pages["/"];
  const robots = await robotsResponse.text();
  for (const [route, routeHtml] of htmlResponses) {
    for (const marker of CLOUDFLARE_EMAIL_MARKERS) {
      if (routeHtml.includes(marker)) {
        throw new Error(`Cloudflare transformed executable content on ${route} (${marker}).`);
      }
    }
  }
  if (!CATALOG_PINNED_CLI.test(html)) throw new Error("The deployed homepage does not preserve the catalog-pinned skills CLI package specifier.");
  if (!TEMPLATE_PACKAGE.test(html)) throw new Error("The deployed homepage does not preserve the Monica.Templates package specifier.");
  for (const route of ["/docs/getting-started", "/zh-CN/docs/getting-started"]) {
    if (!TEMPLATE_PACKAGE.test(pages[route])) {
      throw new Error(`${route} does not preserve the Monica.Templates package specifier.`);
    }
  }

  if (!html.includes(`/tree/${expectedRef}/skills/monica-guide`)) {
    throw new Error(`The deployed homepage does not advertise ${expectedRef}.`);
  }
  for (const directive of ["search=yes", "ai-input=yes", "ai-train=no", "use=reference"]) {
    if (!robots.toLowerCase().includes(directive)) throw new Error(`robots.txt is missing Content-Signal ${directive}.`);
  }
  const ruleBlocks = robots.split(/(?=user-agent\s*:)/iu);
  for (const crawler of ["gptbot", "claudebot", "chatgpt-user", "claude-user"]) {
    const blocked = ruleBlocks.some((block) => (
      new RegExp(`^user-agent\\s*:\\s*(?:\\*|${crawler})\\s*$`, "imu").test(block)
      && /^disallow\s*:\s*\/\s*$/imu.test(block)
    ));
    if (blocked) throw new Error(`robots.txt still blocks ${crawler} from documentation retrieval.`);
  }

  console.log(`Verified ${HTML_ROUTES.length} edge-served HTML routes, package strings, and crawler policy at ${root.origin}.`);
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
