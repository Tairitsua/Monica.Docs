import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { projectDocuments, verifyKnowledge } from "./build-content.mjs";

const digest = (text) => `sha256:${createHash("sha256").update(text).digest("hex")}`;
function fixture() {
  const content = "# Persistence\n\nUse an operation boundary.\n";
  const skills = [{ name: "monica-infra-persistence", modules: ["repository"], files: [{ path: "SKILL.md", content, digest: digest(content) }] }];
  return { schemaVersion: 1, frameworkVersion: "1.0.0", source: { mode: "release", dirty: false, ref: "v1.0.0" }, skills, contentDigest: digest(`${JSON.stringify(skills, null, 2)}\n`) };
}

test("rejects tampered content and a mismatched framework release", () => {
  const bundle = fixture();
  verifyKnowledge(bundle, { releaseRef: "v1.0.0" });
  assert.throws(() => verifyKnowledge(bundle, { frameworkVersion: "2.0.0" }), /framework versions differ/u);
  assert.throws(() => verifyKnowledge(bundle, { releaseRef: "v2.0.0" }), /matching immutable/u);
  bundle.skills[0].files[0].content += "tampered";
  assert.throws(() => verifyKnowledge(bundle), /digest mismatch/u);
});

test("projects both languages from real guides and redirects retired module links", () => {
  const root = mkdtempSync(join(tmpdir(), "monica-knowledge-"));
  try {
    for (const locale of ["en-US", "zh-CN"]) {
      mkdirSync(join(root, locale, "guides"), { recursive: true });
      writeFileSync(join(root, locale, "guides", "start.md"), "---\ntitle: Start\nsidebar_position: 1\n---\n## Write\nSee [persistence](../modules/repository/index.md).\n");
    }
    const result = projectDocuments(root, fixture());
    assert.match(result.en.documents[0].markdown, /\/skills\/monica-infra-persistence/u);
    assert.match(result["zh-CN"].documents[0].markdown, /\/zh-CN\/skills\/monica-infra-persistence/u);
    assert.equal(result.en.documents[0].headings[0].id, "write");
    assert.equal(result.en.documents[0].alternates[0].locale, "zh-CN");
    mkdirSync(join(root, "en-US", "modules"));
    writeFileSync(join(root, "en-US", "modules", "old.md"), "---\ntitle: Old\n---\nStale.");
    assert.throws(() => projectDocuments(root, fixture()), /Retired module documentation/u);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
