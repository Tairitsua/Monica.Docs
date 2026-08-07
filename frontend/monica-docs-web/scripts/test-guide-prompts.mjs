import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadMonicaGuidePrompts } from "./monica-guide-prompts.mjs";
import { buildMonicaGuideSourceUrl } from "./verify-published-guide-release.mjs";

const projectDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const releaseTag = "v9.8.7-test.1";
const previousRef = process.env.MONICA_AGENT_SKILL_REF;
const previousPromptPath = process.env.MONICA_GUIDE_PROMPTS_PATH;
const expectedProfiles = { application: "application", extension: "extension-author" };
let temporaryDirectory;

try {
  process.env.MONICA_AGENT_SKILL_REF = releaseTag;
  const payload = loadMonicaGuidePrompts({ projectDirectory, publicReleaseBuild: true });
  const cliReference = `npx --yes ${payload.skillsCli.package}@${payload.skillsCli.version}`;
  assert.equal(payload.schemaVersion, 2);
  assert.match(payload.catalogDigest, /^sha256:[0-9a-f]{64}$/u);
  assert.equal(
    buildMonicaGuideSourceUrl(payload),
    `https://github.com/Tairitsua/Monica/tree/${releaseTag}/skills/monica-guide`,
  );

  let promptCount = 0;
  for (const [locale, hosts] of Object.entries(payload.locales)) {
    for (const [host, goals] of Object.entries(hosts)) {
      for (const [goal, prompt] of Object.entries(goals)) {
        promptCount += 1;
        assert.match(prompt, new RegExp(`tree/${releaseTag}/skills/monica-guide`, "u"), `${locale}.${host}.${goal} source ref`);
        assert.ok(prompt.includes(cliReference), `${locale}.${host}.${goal} catalog-pinned installer`);
        assert.ok(prompt.includes(`--release-tag ${releaseTag}`), `${locale}.${host}.${goal} release handshake`);
        assert.ok(prompt.includes(`--profile ${expectedProfiles[goal]}`), `${locale}.${host}.${goal} explicit profile`);
        assert.ok(prompt.includes(payload.catalogDigest), `${locale}.${host}.${goal} catalog digest handshake`);
        assert.ok(prompt.includes("--json"), `${locale}.${host}.${goal} machine-readable preview`);
        assert.ok(!prompt.includes("--apply"), `${locale}.${host}.${goal} preview only`);
        assert.ok(!prompt.includes("{{MONICA_IMMUTABLE_REF}}"), `${locale}.${host}.${goal} unresolved ref token`);
        assert.ok(!prompt.includes("{{MONICA_CATALOG_DIGEST}}"), `${locale}.${host}.${goal} unresolved digest token`);
        for (const agent of payload.hosts[host].agentTargets) {
          assert.ok(prompt.includes(`--agent ${agent}`), `${locale}.${host}.${goal} target ${agent}`);
        }
      }
    }
  }

  assert.equal(promptCount, 12);

  temporaryDirectory = mkdtempSync(join(tmpdir(), "monica-guide-prompts-"));
  const canonicalPromptPath = resolve(
    projectDirectory,
    "../../../MoLibrary/skills/monica-guide/assets/bootstrap-prompts.json",
  );
  const invalidPromptPath = join(temporaryDirectory, "bootstrap-prompts.json");
  const invalidPrompts = JSON.parse(readFileSync(canonicalPromptPath, "utf8"));
  invalidPrompts.locales["en-US"].hosts.codex.goals.application.prompt += " {{UNKNOWN_TOKEN}}";
  writeFileSync(invalidPromptPath, `${JSON.stringify(invalidPrompts, null, 2)}\n`, "utf8");
  process.env.MONICA_GUIDE_PROMPTS_PATH = invalidPromptPath;
  assert.throws(
    () => loadMonicaGuidePrompts({ projectDirectory, publicReleaseBuild: true }),
    /unresolved template token \{\{UNKNOWN_TOKEN\}\}/u,
  );

  console.log("Validated twelve rendered Monica Guide locale × host × goal release handshakes.");
} finally {
  if (previousRef === undefined) {
    delete process.env.MONICA_AGENT_SKILL_REF;
  } else {
    process.env.MONICA_AGENT_SKILL_REF = previousRef;
  }
  if (previousPromptPath === undefined) {
    delete process.env.MONICA_GUIDE_PROMPTS_PATH;
  } else {
    process.env.MONICA_GUIDE_PROMPTS_PATH = previousPromptPath;
  }
  if (temporaryDirectory) rmSync(temporaryDirectory, { recursive: true, force: true });
}
