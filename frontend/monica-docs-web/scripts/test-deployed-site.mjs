import assert from "node:assert/strict";
import { createServer } from "node:http";

import { verifyDeployedSite } from "./verify-deployed-site.mjs";

const goodRobots = `User-agent: *
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference
`;
const releaseTag = "v1.2.3-rc.4";
const home = `<html><body>skills@1.5.21 add Monica.Templates@1.0.0-rc.8 /tree/${releaseTag}/skills/monica-guide</body></html>`;
const docs = "<html><body>Monica.Templates@1.0.0-rc.8</body></html>";
const pages = new Map([
  ["/", home],
  ["/docs/getting-started", docs],
  ["/docs/getting-started/agent-setup", "<html><body>Agent setup</body></html>"],
  ["/zh-CN/docs/getting-started", docs],
  ["/zh-CN/docs/getting-started/agent-setup", "<html><body>Agent 设置</body></html>"],
  ["/reference", "<html><body>Reference</body></html>"],
]);

let robots = goodRobots;
const server = createServer((request, response) => {
  const path = new URL(request.url ?? "/", "http://localhost").pathname;
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

  await verifyDeployedSite(baseUrl, releaseTag);

  await assert.rejects(
    verifyDeployedSite(baseUrl, undefined),
    /MONICA_AGENT_SKILL_REF is required/u,
  );
  await assert.rejects(
    verifyDeployedSite(baseUrl, "dev"),
    /must be an immutable Monica release tag/u,
  );
  await assert.rejects(
    verifyDeployedSite(baseUrl, "v1.2.4"),
    /does not advertise v1\.2\.4/u,
  );

  const originalAgentSetup = pages.get("/docs/getting-started/agent-setup");
  pages.set(
    "/docs/getting-started/agent-setup",
    '<html><a href="/cdn-cgi/l/email-protection">rewritten</a></html>',
  );
  await assert.rejects(
    verifyDeployedSite(baseUrl, releaseTag),
    /transformed executable content on \/docs\/getting-started\/agent-setup/u,
  );
  pages.set("/docs/getting-started/agent-setup", originalAgentSetup);

  robots = `User-agent: *
Disallow: /
Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference
`;
  await assert.rejects(verifyDeployedSite(baseUrl, releaseTag), /still blocks gptbot/u);

  console.log("Validated multi-route edge transformation and wildcard crawler-policy failures.");
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
