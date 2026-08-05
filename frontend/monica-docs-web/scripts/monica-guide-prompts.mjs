import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PROMPT_TOKEN = "{{MONICA_IMMUTABLE_REF}}";
const LOCAL_DEVELOPMENT_REF = "LOCAL_DEVELOPMENT_ONLY";
const IMMUTABLE_RELEASE_TAG = /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;
const FULL_COMMIT_SHA = /^[0-9a-f]{40}$/u;
const SEMANTIC_VERSION = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;
const LOCALES = ["en-US", "zh-CN"];
const TARGETS = ["codex", "claude", "generic"];
const TARGET_AGENTS = {
  codex: ["--agent codex"],
  claude: ["--agent claude-code"],
  generic: ["--agent codex", "--agent claude-code"],
};

/**
 * Read the canonical Monica Guide prompt asset and render it for one immutable release.
 *
 * @param {{projectDirectory: string, publicReleaseBuild?: boolean}} options
 */
export function loadMonicaGuidePrompts({ projectDirectory, publicReleaseBuild = false }) {
  const configuredPromptPath = process.env.MONICA_GUIDE_PROMPTS_PATH?.trim();
  const configuredCatalogPath = process.env.MONICA_AGENT_SKILL_CATALOG_PATH?.trim();
  const promptPath = configuredPromptPath
    ? resolve(configuredPromptPath)
    : resolve(projectDirectory, "../../../MoLibrary/skills/monica-guide/assets/bootstrap-prompts.json");
  const catalogPath = configuredCatalogPath
    ? resolve(configuredCatalogPath)
    : resolve(projectDirectory, "../../../MoLibrary/.monica/agent-skill-catalog.json");
  const payload = JSON.parse(readFileSync(promptPath, "utf8"));
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const guideDistribution = validateCatalog(catalog, catalogPath);
  validateAsset(
    payload,
    promptPath,
    guideDistribution.cliReference,
    guideDistribution.skillsCli.package,
  );

  const configuredRef = process.env.MONICA_AGENT_SKILL_REF?.trim() ?? "";
  if (configuredRef && !IMMUTABLE_RELEASE_TAG.test(configuredRef) && !FULL_COMMIT_SHA.test(configuredRef)) {
    throw new Error(`MONICA_AGENT_SKILL_REF must be a full commit SHA or immutable Monica release tag, received ${configuredRef}.`);
  }
  if (!configuredRef && publicReleaseBuild) {
    throw new Error("MONICA_AGENT_SKILL_REF is required for a public release build.");
  }
  if (publicReleaseBuild && !IMMUTABLE_RELEASE_TAG.test(configuredRef)) {
    throw new Error("Public release builds require a v<semver> Monica tag that passed install-and-discovery smoke testing.");
  }

  const immutableRef = configuredRef || LOCAL_DEVELOPMENT_REF;
  const render = (prompt) => {
    const rendered = prompt.replaceAll(PROMPT_TOKEN, immutableRef);
    if (rendered.includes(PROMPT_TOKEN)) {
      throw new Error("A Monica Guide bootstrap prompt contains an unresolved immutable-ref token.");
    }
    return rendered;
  };

  return {
    schemaVersion: payload.schemaVersion,
    repository: payload.repository,
    skill: payload.skill,
    ref: immutableRef,
    isLocalDevelopment: !configuredRef,
    skillsCli: guideDistribution.skillsCli,
    immutableSkillUrlTemplate: guideDistribution.immutableSkillUrlTemplate,
    locales: {
      en: mapLocale(payload.locales["en-US"], render),
      "zh-CN": mapLocale(payload.locales["zh-CN"], render),
    },
  };
}

function mapLocale(locale, render) {
  return Object.fromEntries(TARGETS.map((target) => [target, render(locale[target])]));
}

function validateCatalog(catalog, catalogPath) {
  const distribution = catalog?.distribution;
  const skillsCli = distribution?.skillsCli;
  const guidePath = catalog?.skills?.["monica-guide"]?.path;
  const bootstrapAsset = catalog?.prompts?.bootstrapAsset;
  if (
    !distribution
    || typeof distribution !== "object"
    || distribution.repository !== "Tairitsua/Monica"
    || !skillsCli
    || typeof skillsCli !== "object"
    || typeof skillsCli.package !== "string"
    || !skillsCli.package.trim()
    || typeof skillsCli.version !== "string"
    || !SEMANTIC_VERSION.test(skillsCli.version)
    || typeof distribution.immutableSkillUrlTemplate !== "string"
    || !distribution.immutableSkillUrlTemplate.includes("{tag}")
    || !distribution.immutableSkillUrlTemplate.includes("{skill}")
    || guidePath !== "skills/monica-guide"
    || bootstrapAsset !== "skills/monica-guide/assets/bootstrap-prompts.json"
  ) {
    throw new Error(`Unexpected Monica Agent Skill catalog contract in ${catalogPath}.`);
  }

  return {
    skillsCli: { package: skillsCli.package, version: skillsCli.version },
    cliReference: `npx --yes ${skillsCli.package}@${skillsCli.version}`,
    immutableSkillUrlTemplate: distribution.immutableSkillUrlTemplate,
  };
}

function validateAsset(payload, assetPath, cliReference, cliPackage) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error(`Expected an object in ${assetPath}.`);
  }
  if (payload.schemaVersion !== 1 || payload.repository !== "Tairitsua/Monica" || payload.skill !== "monica-guide") {
    throw new Error(`Unexpected Monica Guide bootstrap prompt contract in ${assetPath}.`);
  }
  if (payload.immutableRef !== PROMPT_TOKEN || !payload.locales || typeof payload.locales !== "object") {
    throw new Error(`Invalid immutable-ref or locale contract in ${assetPath}.`);
  }

  for (const locale of LOCALES) {
    const localized = payload.locales[locale];
    if (!localized || typeof localized !== "object") {
      throw new Error(`Missing ${locale} prompts in ${assetPath}.`);
    }
    for (const target of TARGETS) {
      const prompt = localized[target];
      if (
        typeof prompt !== "string"
        || !prompt.trim()
        || !prompt.includes(PROMPT_TOKEN)
        || !prompt.includes(`--release-tag ${PROMPT_TOKEN}`)
        || !prompt.includes(cliReference)
        || prompt.includes(`${cliPackage}@latest`)
        || TARGET_AGENTS[target].some((agent) => !prompt.includes(agent))
      ) {
        throw new Error(`Invalid ${locale}.${target} prompt in ${assetPath}.`);
      }
    }
  }
}
