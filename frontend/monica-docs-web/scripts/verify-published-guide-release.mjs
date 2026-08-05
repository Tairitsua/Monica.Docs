import { dirname, resolve } from "node:path";
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
    ["--yes", cli, "add", sourceUrl, "-g", "-a", "codex", "-s", contract.skill, "-y"],
    process.env,
    "Fresh global installation smoke test",
  );
  const installedDiscovery = run(
    npx,
    ["--yes", cli, "ls", "-g", "-a", "codex", "--json"],
    process.env,
    "Installed discovery smoke test",
  );
  let installedSkills;
  try {
    installedSkills = JSON.parse(installedDiscovery.stdout);
  } catch (error) {
    throw new Error("Codex discovery did not return valid JSON.", { cause: error });
  }
  if (
    !Array.isArray(installedSkills)
    || !installedSkills.some((skill) => skill?.name === contract.skill && skill?.scope === "global")
  ) {
    throw new Error("Codex discovery did not report the freshly installed monica-guide skill.");
  }

  console.log(`Verified published ${contract.skill} release ${contract.ref} and fresh Codex discovery.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    verifyPublishedGuideRelease();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
