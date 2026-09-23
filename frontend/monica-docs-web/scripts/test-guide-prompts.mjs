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
  assert.equal(payload.schemaVersion, 3);
  assert.match(payload.catalogDigest, /^sha256:[0-9a-f]{64}$/u);
  assert.deepEqual(payload.verifiedAgentTargets, ["codex", "claude-code"]);
  assert.deepEqual(payload.installer, {
    assetNameTemplate: "monica-guide-v{version}-{rid}.zip",
    sha256SumsAsset: "SHA256SUMS",
  });
  assert.equal(
    buildMonicaGuideSourceUrl(payload),
    `https://github.com/Tairitsua/Monica/tree/${releaseTag}/skills/monica-guide`,
  );

  for (const [locale, prompt] of Object.entries(payload.locales)) {
    assert.ok(prompt.includes(releaseTag), `${locale} rendered immutable ref`);
    assert.ok(prompt.includes("$monica-guide init --workspace"), `${locale} project bootstrap`);
    assert.ok(prompt.includes("$monica-guide configure --workspace"), `${locale} workspace configuration`);
    assert.ok(prompt.includes("{rid}"), `${locale} platform placeholder`);
    assert.ok(prompt.includes("SHA256SUMS"), `${locale} release digest guidance`);
    assert.ok(!prompt.includes("Monica.Docs"), `${locale} has no Docs source binding`);
    assert.ok(!prompt.includes("docs-contributor"), `${locale} has no Docs profile`);
    assert.ok(!prompt.includes("npx"), `${locale} keeps ad-hoc CLI installers out`);
    assert.ok(!prompt.includes("Monica.Guide.exe"), `${locale} names no single-platform executable`);
    assert.ok(!prompt.includes("win-x64"), `${locale} names no single platform`);
    assert.ok(!prompt.includes("--apply"), `${locale} must not self-apply plans`);
    assert.ok(!prompt.includes("--agent"), `${locale} must not select a host`);
    assert.ok(!prompt.includes(payload.catalogDigest), `${locale} keeps release machinery out of user copy`);
    assert.ok(!prompt.includes("{{MONICA_IMMUTABLE_REF}}"), `${locale} unresolved ref token`);
    assert.ok(!prompt.includes("{{MONICA_CATALOG_DIGEST}}"), `${locale} unresolved digest token`);
  }

  assert.equal(Object.keys(payload.locales).length, 2);
  assert.equal(payload.fallback.installCommand, "$monica-guide configure --workspace <workspace>");
  assert.equal(payload.fallback.verifyCommand, "$monica-guide status --workspace <workspace>");

  temporaryDirectory = mkdtempSync(join(tmpdir(), "monica-guide-prompts-"));
  const canonicalPromptPath = resolve(
    projectDirectory,
    "../../../MoLibrary/skills/monica-guide/assets/bootstrap-prompts.json",
  );
  const invalidPromptPath = join(temporaryDirectory, "bootstrap-prompts.json");
  // An uppercase unknown token is rejected by the prompt contract itself; a
  // lowercase one reaches the renderer and must fail the substitution pass.
  const invalidPrompts = JSON.parse(readFileSync(canonicalPromptPath, "utf8"));
  invalidPrompts.locales["en-US"].prompt += " {{unknown_token}}";
  writeFileSync(invalidPromptPath, `${JSON.stringify(invalidPrompts, null, 2)}\n`, "utf8");
  process.env.MONICA_GUIDE_PROMPTS_PATH = invalidPromptPath;
  assert.throws(
    () => loadMonicaGuidePrompts({ projectDirectory, publicReleaseBuild: true }),
    /unresolved template token \{\{unknown_token\}\}/u,
  );

  const unknownUppercaseToken = JSON.parse(readFileSync(canonicalPromptPath, "utf8"));
  unknownUppercaseToken.locales["en-US"].prompt += " {{UNKNOWN_TOKEN}}";
  writeFileSync(invalidPromptPath, `${JSON.stringify(unknownUppercaseToken, null, 2)}\n`, "utf8");
  assert.throws(
    () => loadMonicaGuidePrompts({ projectDirectory, publicReleaseBuild: true }),
    /Invalid universal en-US prompt/u,
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

  const singlePlatformPrompts = JSON.parse(readFileSync(canonicalPromptPath, "utf8"));
  singlePlatformPrompts.locales["en-US"].prompt = singlePlatformPrompts.locales["en-US"].prompt.replaceAll(
    "{rid}",
    "win-x64",
  );
  writeFileSync(invalidPromptPath, `${JSON.stringify(singlePlatformPrompts, null, 2)}\n`, "utf8");
  assert.throws(
    () => loadMonicaGuidePrompts({ projectDirectory, publicReleaseBuild: true }),
    /Invalid universal en-US prompt/u,
  );

  console.log("Validated two rendered universal Monica Guide prompts and the terminal fallback.");
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
