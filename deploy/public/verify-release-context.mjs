import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const IMMUTABLE_RELEASE_TAG = /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;
const COMPOSITE_RELEASE_ID = /^[0-9a-f]{40}-[0-9a-f]{40}$/u;
const VERSION_ELEMENT = /<Version>([^<]+)<\/Version>/gu;

const contextRoot = resolve(process.argv[2] ?? process.cwd());
const docsRoot = resolve(contextRoot, "Monica.Docs");
const monicaRoot = resolve(contextRoot, "MoLibrary");
const expectedReleaseId = process.env.MONICA_RELEASE_ID?.trim() ?? "";
const expectedMonicaRef = process.env.MONICA_AGENT_SKILL_REF?.trim() ?? "";

if (!COMPOSITE_RELEASE_ID.test(expectedReleaseId)) {
  fail("MONICA_RELEASE_ID must be <full-Monica.Docs-commit>-<full-Monica-commit>.");
}
if (!IMMUTABLE_RELEASE_TAG.test(expectedMonicaRef)) {
  fail("MONICA_AGENT_SKILL_REF must be an immutable Monica release tag.");
}

assertPristineCheckout(docsRoot, "Monica.Docs");
assertPristineCheckout(monicaRoot, "Monica");

const docsCommit = git(docsRoot, "rev-parse", "HEAD");
const monicaCommit = git(monicaRoot, "rev-parse", "HEAD");
const actualReleaseId = `${docsCommit}-${monicaCommit}`;
if (actualReleaseId !== expectedReleaseId) {
  fail(`Release source identity is ${actualReleaseId}, expected ${expectedReleaseId}.`);
}

const tagCommit = git(monicaRoot, "rev-parse", `refs/tags/${expectedMonicaRef}^{commit}`);
if (monicaCommit !== tagCommit) {
  fail(`Monica HEAD is ${monicaCommit}, but ${expectedMonicaRef} resolves to ${tagCommit}.`);
}

const props = readFileSync(resolve(monicaRoot, "Directory.Build.props"), "utf8");
const versions = [...props.matchAll(VERSION_ELEMENT)].map((match) => match[1]?.trim());
const expectedVersion = expectedMonicaRef.slice(1);
if (versions.length !== 1 || versions[0] !== expectedVersion) {
  fail(`Directory.Build.props must contain exactly version ${expectedVersion}.`);
}

console.log(`Verified release ${actualReleaseId} with Monica tag ${expectedMonicaRef}.`);

function assertPristineCheckout(repository, label) {
  const changes = git(repository, "status", "--porcelain", "--untracked-files=all");
  if (changes) fail(`${label} checkout is not clean:\n${changes}`);

  const ignored = git(
    repository,
    "ls-files",
    "--others",
    "--ignored",
    "--exclude-standard",
    "--directory",
  );
  if (ignored) fail(`${label} checkout contains ignored files that could alter release bytes:\n${ignored}`);
}

function git(repository, ...args) {
  try {
    return execFileSync("git", ["-C", repository, ...args], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    }).trim();
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    fail(`Git inspection failed for ${repository}: ${details}`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
