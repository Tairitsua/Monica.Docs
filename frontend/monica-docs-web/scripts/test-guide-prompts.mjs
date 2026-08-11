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
let temporaryDirectory;

try {
  process.env.MONICA_AGENT_SKILL_REF = releaseTag;
  const payload = loadMonicaGuidePrompts({ projectDirectory, publicReleaseBuild: true });
  const cliReference = `npx --yes ${payload.skillsCli.package}@${payload.skillsCli.version}`;
  assert.equal(payload.schemaVersion, 3);
  assert.match(payload.catalogDigest, /^sha256:[0-9a-f]{64}$/u);
  assert.deepEqual(payload.verifiedAgentTargets, ["codex", "claude-code"]);
  assert.equal(
    buildMonicaGuideSourceUrl(payload),
    `https://github.com/Tairitsua/Monica/tree/${releaseTag}/skills/monica-guide`,
  );

  for (const [locale, prompt] of Object.entries(payload.locales)) {
    assert.match(prompt, new RegExp(`tree/${releaseTag}/skills/monica-guide`, "u"), `${locale} source ref`);
    assert.match(prompt, /monica-guide/u, `${locale} named Guide skill`);
    assert.doesNotMatch(prompt, /(?:^|\s)(?:init|--workspace|--profile|--agent|--apply)(?:\s|$)/u, `${locale} must remain toolbox-first`);
    assert.ok(!prompt.includes(payload.catalogDigest), `${locale} keeps release machinery out of user copy`);
    assert.ok(!prompt.includes("{{MONICA_IMMUTABLE_REF}}"), `${locale} unresolved ref token`);
    assert.ok(!prompt.includes("{{MONICA_CATALOG_DIGEST}}"), `${locale} unresolved digest token`);
  }

  assert.equal(Object.keys(payload.locales).length, 2);
  assert.equal(
    payload.fallback.installCommand,
    `${cliReference} add https://github.com/Tairitsua/Monica/tree/${releaseTag}/skills/monica-guide -g -s monica-guide`,
  );
  assert.match(payload.fallback.installCommand, new RegExp(`tree/${releaseTag}/skills/monica-guide`, "u"));
  assert.ok(!payload.fallback.installCommand.includes(" -a "));
  assert.ok(!payload.fallback.installCommand.endsWith(" -y"));
  assert.equal(payload.fallback.verifyCommand, `npx --yes ${payload.skillsCli.package}@${payload.skillsCli.version} ls -g --json`);

  temporaryDirectory = mkdtempSync(join(tmpdir(), "monica-guide-prompts-"));
  const canonicalPromptPath = resolve(
    projectDirectory,
    "../../../MoLibrary/skills/monica-guide/assets/bootstrap-prompts.json",
  );
  const invalidPromptPath = join(temporaryDirectory, "bootstrap-prompts.json");
  const invalidPrompts = JSON.parse(readFileSync(canonicalPromptPath, "utf8"));
  invalidPrompts.locales["en-US"].prompt += " {{UNKNOWN_TOKEN}}";
  writeFileSync(invalidPromptPath, `${JSON.stringify(invalidPrompts, null, 2)}\n`, "utf8");
  process.env.MONICA_GUIDE_PROMPTS_PATH = invalidPromptPath;
  assert.throws(
    () => loadMonicaGuidePrompts({ projectDirectory, publicReleaseBuild: true }),
    /unresolved template token \{\{UNKNOWN_TOKEN\}\}/u,
  );

  const unscopedPrompts = JSON.parse(readFileSync(canonicalPromptPath, "utf8"));
  unscopedPrompts.locales["en-US"].prompt = unscopedPrompts.locales["en-US"].prompt.replace(
    "After that installation, these restrictions apply until I choose an operation and approve its preview: ",
    "",
  );
  writeFileSync(invalidPromptPath, `${JSON.stringify(unscopedPrompts, null, 2)}\n`, "utf8");
  assert.throws(
    () => loadMonicaGuidePrompts({ projectDirectory, publicReleaseBuild: true }),
    /Invalid universal en-US prompt/u,
  );

  console.log("Validated two rendered universal Monica Guide prompts and the interactive fallback.");
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
