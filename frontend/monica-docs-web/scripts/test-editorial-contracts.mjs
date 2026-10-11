import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

// Execute the actual pure application modules without Next's server-only runtime
// or generated release files. Only content inputs and the server-only marker are
// substituted; routing, search, and markdown behavior remain production code.
const require = createRequire(import.meta.url);
const rawMarkdown = "---\ntitle: Persistence\n---\n# Persistence\n\n## Transactions\n\n```csharp\nawait unit.SaveAsync();\n```\n";
const bundle = {
  schemaVersion: 1,
  source: { repository: "Tairitsua/Monica", ref: "v1.2.3" },
  skills: [{
    name: "monica-infra-persistence", title: "Persistence", description: "Transactions and repositories", modules: ["repository"],
    files: [
      { path: "SKILL.md", title: "Persistence", content: rawMarkdown },
      { path: "references/unit of work.md", title: "Unit of work", content: "Transaction scope reference" },
    ],
  }],
};
const snapshot = Object.fromEntries(["en", "zh-CN"].map((locale) => [locale, {
  tree: [],
  documents: [{
    slug: "getting-started", title: locale === "en" ? "Getting started" : "快速开始",
    canonicalPath: `${locale === "en" ? "" : "/zh-CN"}/docs/getting-started`,
    markdown: "Use a transaction scope with Monica.",
  }],
}]));

function loadModule(relativePath, dependencies = {}) {
  const filename = new URL(`../src/${relativePath}`, import.meta.url);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename.pathname,
  });
  const evaluatedModule = { exports: {} };
  const loadDependency = (name) => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name);
  new Function("require", "module", "exports", outputText)(loadDependency, evaluatedModule, evaluatedModule.exports);
  return evaluatedModule.exports;
}

const routes = loadModule("lib/routes.ts");
const knowledge = loadModule("lib/knowledge.ts", { "@/generated/knowledge.json": bundle });
const docs = loadModule("lib/documentation-api.ts", {
  "server-only": {}, "@/generated/documents.json": snapshot,
  "@/lib/knowledge": knowledge, "@/lib/routes": routes,
});

for (const locale of ["en", "zh-CN"]) {
  const prefix = locale === "en" ? "" : "/zh-CN";

  test(`${locale}: editorial links and language switches preserve the document`, () => {
    assert.equal(routes.localizedPath(locale, "/"), prefix || "/");
    assert.equal(routes.localizedPath(locale, "skills"), `${prefix}/skills`);
    assert.equal(routes.docsPath(locale), `${prefix}/docs`);
    assert.equal(routes.docsPath(locale, "getting-started/index.md"), `${prefix}/docs/getting-started`);
    const other = routes.oppositeLocale(locale);
    assert.equal(routes.docsPath(other, "getting-started/agent-setup"), `${other === "en" ? "" : "/zh-CN"}/docs/getting-started/agent-setup`);
    assert.equal(routes.oppositeLocale(other), locale);
  });

  test(`${locale}: search returns local guide and skill-resource destinations`, async () => {
    const result = await docs.searchDocumentation(locale, " TRANSACTION ");
    assert.equal(result.source, "snapshot");
    assert.deepEqual(new Set(result.data.map((item) => item.path)), new Set([
      `${prefix}/docs/getting-started`,
      `${prefix}/skills/monica-infra-persistence`,
      `${prefix}/skills/monica-infra-persistence/references/unit%20of%20work.md`,
    ]));
    assert.ok(result.data.every((item) => item.locale === (locale === "en" ? "en-US" : "zh-CN")));
    assert.deepEqual((await docs.searchDocumentation(locale, "  ")).data, []);
    assert.deepEqual((await docs.searchDocumentation(locale, "no-matching-content")).data, []);
  });

  test(`${locale}: article lookup and retired module links retain their destinations`, async () => {
    assert.equal((await docs.getDocumentationArticle(locale, "Getting-Started/index.md")).data?.canonicalPath, `${prefix}/docs/getting-started`);
    assert.equal((await docs.getDocumentationArticle(locale, "missing")).source, "unavailable");
    assert.equal(docs.retiredModuleDestination(locale, "modules/repository/index.md"), `${prefix}/skills/monica-infra-persistence`);
    assert.equal(knowledge.resolveSkillMarkdownHref("references/unit%20of%20work.md#scope", locale, "monica-infra-persistence", "SKILL.md"), `${prefix}/skills/monica-infra-persistence/references/unit%20of%20work.md#scope`);
  });
}

test("raw skill resources retain canonical paths and unmodified copyable content", () => {
  assert.equal(knowledge.rawSkillFileRoute("monica-infra-persistence"), "/api/skills/monica-infra-persistence/SKILL.md");
  assert.equal(knowledge.rawSkillFileRoute("monica-infra-persistence", "references/unit of work.md"), "/api/skills/monica-infra-persistence/references/unit%20of%20work.md");
  assert.equal(knowledge.getSkillFile("monica-infra-persistence", "SKILL.md").content, rawMarkdown);
  assert.equal(knowledge.getSkillFile("monica-infra-persistence", "missing.md"), undefined);
  assert.equal(knowledge.renderedSkillMarkdown(rawMarkdown), "\n## Transactions\n\n```csharp\nawait unit.SaveAsync();\n```\n");
});
