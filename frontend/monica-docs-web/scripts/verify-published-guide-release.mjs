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

/**
 * Verify the published release as an external consumer: the canonical prompt
 * contract, the published catalog/index/manifest/skills archive bytes, every
 * per-platform guide bundle, and the SHA256SUMS digest manifest. The live
 * executable smoke of the installed guide runs in MoLibrary's release matrix
 * and in this repository's public-release workflow, where the .NET runtime is
 * available; the disposable web build stage has no runtime by design.
 */
export function verifyPublishedGuideRelease() {
  if (process.env.MONICA_RELEASE_SMOKE_CONTAINER !== "1") {
    throw new Error(
      "Published release verification is restricted to the disposable public web build stage.",
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

  console.log(
    `Verified published ${contract.skill} release ${contract.ref}: catalog, index, manifest, skills archive, every ${contract.installer.assetNameTemplate} bundle, and ${contract.installer.sha256SumsAsset}.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    verifyPublishedGuideRelease();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
