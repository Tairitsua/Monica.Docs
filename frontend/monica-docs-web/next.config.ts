import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

import { loadMonicaGuidePrompts } from "./scripts/monica-guide-prompts.mjs";

const VERSION_ELEMENT = /<Version>([^<]+)<\/Version>/gu;
const SEMANTIC_VERSION = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;
const PROJECT_DIRECTORY = dirname(fileURLToPath(import.meta.url));

function readMonicaVersion(): string {
  const configuredPropsPath = process.env.MONICA_VERSION_PROPS_PATH?.trim();
  const propsPath = configuredPropsPath
    ? resolve(configuredPropsPath)
    : resolve(PROJECT_DIRECTORY, "../../../MoLibrary/Directory.Build.props");
  const props = readFileSync(propsPath, "utf8");
  const versions = [...props.matchAll(VERSION_ELEMENT)].map((match) => match[1]?.trim() ?? "");

  if (versions.length !== 1 || !SEMANTIC_VERSION.test(versions[0] ?? "")) {
    throw new Error(`Expected exactly one semantic <Version> in ${propsPath}.`);
  }

  return versions[0];
}

const guidePrompts = loadMonicaGuidePrompts({
  projectDirectory: PROJECT_DIRECTORY,
  publicReleaseBuild: process.env.MONICA_PUBLIC_RELEASE_BUILD === "1",
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MONICA_VERSION: readMonicaVersion(),
    NEXT_PUBLIC_MONICA_GUIDE_PROMPTS: JSON.stringify(guidePrompts),
  },
};

export default nextConfig;
