import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const projectDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const contractPath = resolve(projectDirectory, "src/content/manual-dotnet.json");
const defaultVersionPath = resolve(projectDirectory, "../../../MoLibrary/Directory.Build.props");
const versionPath = resolve(process.env.MONICA_VERSION_PROPS_PATH?.trim() || defaultVersionPath);
const contract = JSON.parse(readFileSync(contractPath, "utf8"));
const versionSource = readFileSync(versionPath, "utf8");
const versions = [...versionSource.matchAll(/<Version>([^<]+)<\/Version>/gu)].map((match) => match[1]?.trim());
if (versions.length !== 1 || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u.test(versions[0] ?? "")) {
  throw new Error(`Expected one semantic Monica version in ${versionPath}.`);
}

const dotnet = process.env.DOTNET_HOST_PATH?.trim() || "dotnet";
const temporaryRoot = mkdtempSync(join(tmpdir(), "monica-docs-manual-dotnet-"));

function commandPath(localPath) {
  if (!process.env.WSL_DISTRO_NAME || process.platform === "win32") return localPath;
  const converted = spawnSync("wslpath", ["-w", localPath], { encoding: "utf8" });
  if (converted.status !== 0 || !converted.stdout.trim()) {
    throw new Error(`Could not convert ${localPath} for the Windows dotnet host.`);
  }
  return converted.stdout.trim();
}

function runDotnet(args, label) {
  const result = spawnSync(dotnet, args, {
    cwd: projectDirectory,
    env: {
      ...process.env,
      DOTNET_CLI_TELEMETRY_OPTOUT: "1",
      DOTNET_NOLOGO: "1",
    },
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${label} failed${details ? `:\n${details}` : "."}`, { cause: result.error });
  }
}

function normalizeSource(value) {
  return `${value.replaceAll("\r\n", "\n").trimEnd()}\n`;
}

try {
  const hive = join(temporaryRoot, "hive");
  const output = join(temporaryRoot, contract.projectName);
  mkdirSync(hive, { recursive: true });
  runDotnet(
    [
      "new",
      "install",
      `${contract.templatePackage}@${versions[0]}`,
      "--debug:custom-hive",
      commandPath(hive),
      "--verbosity",
      "minimal",
    ],
    "Advertised template installation",
  );
  runDotnet(
    [
      "new",
      contract.templateShortName,
      "-n",
      contract.projectName,
      "-o",
      commandPath(output),
      "--no-restore",
      "--no-update-check",
      "--debug:custom-hive",
      commandPath(hive),
    ],
    "Advertised project creation",
  );

  const generatedProgram = readFileSync(join(output, "Program.cs"), "utf8");
  const displayedProgram = contract.programLines.join("\n");
  if (normalizeSource(generatedProgram) !== normalizeSource(displayedProgram)) {
    throw new Error("The Manual .NET Program.cs tab differs from the advertised generated project.");
  }

  const projectPath = join(output, `${contract.projectName}.csproj`);
  if (!existsSync(projectPath)) throw new Error(`Generated project is missing ${projectPath}.`);
  runDotnet(
    [
      "build",
      commandPath(projectPath),
      "-c",
      "Release",
      "--nologo",
      "-warnaserror",
      "-p:TreatWarningsAsErrors=true",
    ],
    "Advertised generated project build",
  );
  console.log(`Verified ${contract.templatePackage}@${versions[0]} installation, generated Program.cs parity, and a zero-warning build.`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
