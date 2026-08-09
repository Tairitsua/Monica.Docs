import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";

import { verifyDeployedSite } from "./verify-deployed-site.mjs";

const goodRobots = `User-agent: *
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference
`;
const releaseTag = "v1.2.3-rc.4";
const releaseVersion = releaseTag.slice(1);
const skillsCli = { package: "skills", version: "1.5.21" };
const publishedCatalog = `${JSON.stringify({
  schemaVersion: 1,
  distribution: {
    repository: "Tairitsua/Monica",
    skillsCli,
  },
}, null, 2)}\n`;
const publishedCatalogDigest = `sha256:${createHash("sha256").update(publishedCatalog).digest("hex")}`;
let catalogResponseBody = publishedCatalog;
const home = `<html><body>${skillsCli.package}@${skillsCli.version} add Monica.Templates@${releaseVersion} /tree/${releaseTag}/skills/monica-guide</body></html>`;
const zhHome = `<html lang="zh-CN"><body>${skillsCli.package}@${skillsCli.version} add Monica.Templates@${releaseVersion} /tree/${releaseTag}/skills/monica-guide</body></html>`;
const serializedTemplateCommand = String.raw`Monica.Templates@${releaseVersion}\\ndotnet new monica-api`;
const docs = String.raw`<html><body>
  <code>Monica.Templates@${releaseVersion}</code>
  <script>${serializedTemplateCommand}</script>
</body></html>`;
const pages = new Map([
  ["/", home],
  ["/zh-CN", zhHome],
  ["/docs/getting-started", docs],
  ["/docs/getting-started/agent-setup", "<html><body>Agent setup</body></html>"],
  ["/zh-CN/docs/getting-started", "<html><body>快速开始</body></html>"],
  ["/zh-CN/docs/getting-started/agent-setup", "<html><body>Agent 设置</body></html>"],
  ["/reference", "<html><body>Reference</body></html>"],
]);

let robots = goodRobots;
const server = createServer((request, response) => {
  const path = new URL(request.url ?? "/", "http://localhost").pathname;
  if (path === "/release/agent-skill-catalog.json") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(catalogResponseBody);
    return;
  }
  if (path === "/release/agent-skill-manifest.json") {
    const releaseAssetBaseUrl = `http://${request.headers.host}/release`;
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({
      schemaVersion: 2,
      tag: releaseTag,
      monicaVersion: releaseVersion,
      catalogUrl: `${releaseAssetBaseUrl}/agent-skill-catalog.json`,
      catalogDigest: publishedCatalogDigest,
      files: {
        ".monica/agent-skill-catalog.json": publishedCatalogDigest,
      },
    }));
    return;
  }
  if (path === "/robots.txt") {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end(robots);
    return;
  }
  const content = pages.get(path);
  response.writeHead(content ? 200 : 404, { "content-type": "text/html" });
  response.end(content ?? "Not found");
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

try {
  const address = server.address();
  assert(address && typeof address === "object");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const releaseAssetBaseUrl = `${baseUrl}/release`;
  const verify = (expectedRef = releaseTag) => verifyDeployedSite(
    baseUrl,
    expectedRef,
    { releaseAssetBaseUrl },
  );

  await verify();

  await assert.rejects(
    verifyDeployedSite(baseUrl, "", { releaseAssetBaseUrl }),
    /MONICA_AGENT_SKILL_REF is required/u,
  );
  await assert.rejects(
    verifyDeployedSite(baseUrl, "dev", { releaseAssetBaseUrl }),
    /must be an immutable Monica release tag/u,
  );
  await assert.rejects(
    verifyDeployedSite(baseUrl, "v01.2.3", { releaseAssetBaseUrl }),
    /must be an immutable Monica release tag/u,
  );
  await assert.rejects(
    verifyDeployedSite(baseUrl, "v1.2.3-..", { releaseAssetBaseUrl }),
    /must be an immutable Monica release tag/u,
  );
  await assert.rejects(
    verify("v1.2.4"),
    /does not bind the catalog bytes for v1\.2\.4/u,
  );

  catalogResponseBody = publishedCatalog.replace(skillsCli.version, "9.9.9");
  await assert.rejects(verify(), /does not bind the catalog bytes/u);
  catalogResponseBody = publishedCatalog;

  const originalHome = pages.get("/");
  pages.set("/", originalHome.replace(`Monica.Templates@${releaseVersion}`, "Monica.Templates@9.9.9"));
  await assert.rejects(
    verify(),
    /exact Monica\.Templates package specifier/u,
  );
  pages.set("/", originalHome.replace(`${skillsCli.package}@${skillsCli.version}`, "skills@9.9.9"));
  await assert.rejects(
    verify(),
    /exact catalog-pinned skills CLI package specifier/u,
  );
  pages.set("/", originalHome.replace(`${skillsCli.package}@${skillsCli.version}`, `evil${skillsCli.package}@${skillsCli.version}`));
  await assert.rejects(verify(), /exact catalog-pinned skills CLI package specifier/u);
  pages.set("/", `${originalHome} ${skillsCli.package}@latest`);
  await assert.rejects(verify(), /unexpected catalog-pinned skills CLI package specifier skills@latest/u);
  pages.set("/", `${originalHome} Monica.Templates@latest`);
  await assert.rejects(verify(), /unexpected Monica\.Templates package specifier Monica\.Templates@latest/u);
  pages.set("/", originalHome);

  const originalZhHome = pages.get("/zh-CN");
  pages.set(
    "/zh-CN",
    originalZhHome.replace(`Monica.Templates@${releaseVersion}`, "Monica.Templates@9.9.9"),
  );
  await assert.rejects(
    verify(),
    /\/zh-CN does not preserve the exact Monica\.Templates package specifier/u,
  );
  pages.set("/zh-CN", originalZhHome);

  const originalDocs = pages.get("/docs/getting-started");
  pages.set(
    "/docs/getting-started",
    originalDocs.replace(
      serializedTemplateCommand,
      String.raw`Monica.Templates@9.9.9\\ndotnet new monica-api`,
    ),
  );
  await assert.rejects(
    verify(),
    /unexpected Monica\.Templates package specifier Monica\.Templates@9\.9\.9/u,
  );
  pages.set("/docs/getting-started", originalDocs);

  const originalAgentSetup = pages.get("/docs/getting-started/agent-setup");
  pages.set(
    "/docs/getting-started/agent-setup",
    '<html><a href="/cdn-cgi/l/email-protection">rewritten</a></html>',
  );
  await assert.rejects(
    verify(),
    /transformed executable content on \/docs\/getting-started\/agent-setup/u,
  );
  pages.set("/docs/getting-started/agent-setup", originalAgentSetup);

  robots = `User-agent: *
Disallow: /
Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference
`;
  await assert.rejects(verify(), /still blocks gptbot/u);

  robots = `User-agent: GPTBot
User-agent: ExampleBot
Disallow: /*

${goodRobots}`;
  await assert.rejects(verify(), /still blocks gptbot/u);

  robots = `${goodRobots}Content-Signal: ai-input=no, ai-train=yes\n`;
  await assert.rejects(
    verify(),
    /contradictory Content-Signal ai-input=no/u,
  );
  robots = `${goodRobots}Content-Signal: ai-input = no\n`;
  await assert.rejects(verify(), /contradictory Content-Signal ai-input=no/u);
  robots = `${goodRobots}Content-Signal: ai-input == no\n`;
  await assert.rejects(verify(), /malformed Content-Signal ai-input == no/u);

  console.log("Validated release-bound packages, edge transformations, and crawler-policy failures.");
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
