import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

import { loadMonicaGuidePrompts } from "./monica-guide-prompts.mjs";

const projectDirectory = dirname(dirname(fileURLToPath(import.meta.url)));

export function buildMonicaGuideSourceUrl(contract) {
  const sourceUrl = contract.immutableSkillUrlTemplate
    .replaceAll("{tag}", contract.ref)
    .replaceAll("{skill}", contract.skill);
  if (sourceUrl.includes("{") || sourceUrl.includes("}")) {
    throw new Error("The canonical immutable skill URL template contains unresolved fields.");
  }
  return sourceUrl;
}

function run(command, args, environment, label) {
  const result = spawnSync(command, args, {
    cwd: projectDirectory,
    env: environment,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${label} failed${details ? `:\n${details}` : "."}`, { cause: result.error });
  }
  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function runGuidePreview(entryPoint, contract, agent, workspace, statePath) {
  const result = spawnSync(
    process.execPath,
    [
      entryPoint,
      "init",
      "--workspace", workspace,
      "--release-tag", contract.ref,
      "--profile", "application",
      "--agent", agent,
      "--json",
    ],
    {
      cwd: workspace,
      env: { ...process.env, MONICA_GUIDE_STATE: statePath },
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  if (result.error || result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${agent} initialization preview failed${details ? `:\n${details}` : "."}`, { cause: result.error });
  }
  let plan;
  try {
    plan = JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`${agent} initialization preview did not return valid JSON.`, { cause: error });
  }
  const expectedChannel = contract.ref.includes("-") ? "preview" : "stable";
  if (
    plan?.dryRun !== true
    || typeof plan.planDigest !== "string"
    || !plan.planDigest.startsWith("sha256:")
    || !Array.isArray(plan.blockers)
    || plan.blockers.length !== 0
    || !Array.isArray(plan.actions)
    || plan.actions.length === 0
    || !plan.actions.some((action) => typeof action?.diff === "string" && action.diff.length > 0)
    || plan.context?.channel !== expectedChannel
    || plan.context?.targetRelease?.id !== contract.ref
    || plan.context?.targetRelease?.catalogDigest !== contract.catalogDigest
    || plan.preconditions?.releaseCatalogDigest !== contract.catalogDigest
  ) {
    throw new Error(`${agent} initialization preview did not select the advertised release and catalog digest.`);
  }
  return plan;
}

function workspaceFiles(root) {
  const visit = (directory, prefix = "") => readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      if (entry.name === ".git") return [];
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      return entry.isDirectory() ? visit(join(directory, entry.name), relative) : [relative];
    })
    .sort();
  return visit(root);
}

export function verifyPublishedGuideRelease() {
  if (process.env.MONICA_RELEASE_SMOKE_CONTAINER !== "1") {
    throw new Error(
      "Published installation smoke testing is restricted to the disposable public web build stage.",
    );
  }
  const contract = loadMonicaGuidePrompts({ projectDirectory, publicReleaseBuild: true });
  const python = process.env.PYTHON?.trim() || "python3";
  run(
    python,
    [
      resolve(projectDirectory, "../../scripts/validate_release_version.py"),
      "--verify-published",
      "--agent-skill-ref",
      contract.ref,
    ],
    process.env,
    "Published release byte verification",
  );

  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const cli = `${contract.skillsCli.package}@${contract.skillsCli.version}`;
  const sourceUrl = buildMonicaGuideSourceUrl(contract);

  const sourceDiscovery = run(
    npx,
    ["--yes", cli, "add", sourceUrl, "--list"],
    process.env,
    "Immutable source discovery smoke test",
  );
  if (!sourceDiscovery.stdout.includes(contract.skill)) {
    throw new Error("Immutable source discovery did not report monica-guide.");
  }

  run(
    npx,
    ["--yes", cli, "add", sourceUrl, "-g", "-a", "codex", "-a", "claude-code", "-s", contract.skill, "-y"],
    process.env,
    "Fresh global installation smoke test",
  );

  for (const agent of ["codex", "claude-code"]) {
    const installedDiscovery = run(
      npx,
      ["--yes", cli, "ls", "-g", "-a", agent, "--json"],
      process.env,
      `${agent} installed discovery smoke test`,
    );
    let installedSkills;
    try {
      installedSkills = JSON.parse(installedDiscovery.stdout);
    } catch (error) {
      throw new Error(`${agent} discovery did not return valid JSON.`, { cause: error });
    }
    if (
      !Array.isArray(installedSkills)
      || !installedSkills.some((skill) => skill?.name === contract.skill && skill?.scope === "global")
    ) {
      throw new Error(`${agent} discovery did not report the freshly installed monica-guide skill.`);
    }
  }

  const guideCandidates = [
    join(homedir(), ".agents", "skills", contract.skill, "scripts", "monica-guide.mjs"),
    join(homedir(), ".claude", "skills", contract.skill, "scripts", "monica-guide.mjs"),
  ];
  const guideEntry = guideCandidates.find(existsSync);
  if (!guideEntry) {
    throw new Error("Fresh discovery succeeded but the installed monica-guide entry point was not found.");
  }

  const smokeRoot = mkdtempSync(join(tmpdir(), "monica-guide-release-smoke-"));
  try {
    const workspace = join(smokeRoot, "workspace");
    run("git", ["init", workspace], process.env, "Fresh repository initialization");
    const domainRoot = join(workspace, "src", "Domains", "Orders");
    mkdirSync(domainRoot, { recursive: true });
    writeFileSync(
      join(domainRoot, "Orders.Domain.csproj"),
      '<Project Sdk="Microsoft.NET.Sdk" />\n',
      "utf8",
    );
    const before = workspaceFiles(workspace);
    for (const agent of ["codex", "claude-code"]) {
      runGuidePreview(guideEntry, contract, agent, workspace, join(smokeRoot, `${agent}-state.json`));
      if (JSON.stringify(workspaceFiles(workspace)) !== JSON.stringify(before)) {
        throw new Error(`${agent} dry-run initialization changed repository files.`);
      }
    }
  } finally {
    rmSync(smokeRoot, { recursive: true, force: true });
  }

  console.log(`Verified published ${contract.skill} release ${contract.ref}, both host discoveries, and exact-tag dry-run initialization.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    verifyPublishedGuideRelease();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
