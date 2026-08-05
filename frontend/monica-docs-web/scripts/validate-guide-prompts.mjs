import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { loadMonicaGuidePrompts } from "./monica-guide-prompts.mjs";

const projectDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const publicReleaseBuild = process.argv.includes("--production");

try {
  const prompts = loadMonicaGuidePrompts({ projectDirectory, publicReleaseBuild });
  const mode = prompts.isLocalDevelopment ? "local-development fallback" : prompts.ref;
  console.log(`Validated canonical Monica Guide prompts for ${mode}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
