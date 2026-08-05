import assert from "node:assert/strict";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { loadMonicaGuidePrompts } from "./monica-guide-prompts.mjs";
import { buildMonicaGuideSourceUrl } from "./verify-published-guide-release.mjs";

const projectDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const releaseTag = "v9.8.7-test.1";
const previousRef = process.env.MONICA_AGENT_SKILL_REF;

try {
  process.env.MONICA_AGENT_SKILL_REF = releaseTag;
  const payload = loadMonicaGuidePrompts({ projectDirectory, publicReleaseBuild: true });
  const cliReference = `npx --yes ${payload.skillsCli.package}@${payload.skillsCli.version}`;
  assert.equal(
    buildMonicaGuideSourceUrl(payload),
    `https://github.com/Tairitsua/Monica/tree/${releaseTag}/skills/monica-guide`,
  );

  for (const [locale, prompts] of Object.entries(payload.locales)) {
    for (const [target, prompt] of Object.entries(prompts)) {
      assert.match(prompt, new RegExp(`tree/${releaseTag}/skills/monica-guide`, "u"), `${locale}.${target} source ref`);
      assert.ok(prompt.includes(cliReference), `${locale}.${target} catalog-pinned installer`);
      assert.ok(prompt.includes(`--release-tag ${releaseTag}`), `${locale}.${target} Guide release handshake`);
      const expectedAgents = target === "codex"
        ? ["--agent codex"]
        : target === "claude"
          ? ["--agent claude-code"]
          : ["--agent codex", "--agent claude-code"];
      for (const agent of expectedAgents) assert.ok(prompt.includes(agent), `${locale}.${target} Guide target ${agent}`);
      assert.ok(!prompt.includes("{{MONICA_IMMUTABLE_REF}}"), `${locale}.${target} unresolved token`);
    }
  }

  console.log("Validated six rendered Monica Guide prompt release handshakes.");
} finally {
  if (previousRef === undefined) {
    delete process.env.MONICA_AGENT_SKILL_REF;
  } else {
    process.env.MONICA_AGENT_SKILL_REF = previousRef;
  }
}
