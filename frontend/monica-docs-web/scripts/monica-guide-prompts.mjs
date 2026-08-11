import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const IMMUTABLE_REF_TOKEN = "{{MONICA_IMMUTABLE_REF}}";
const CATALOG_DIGEST_TOKEN = "{{MONICA_CATALOG_DIGEST}}";
const UNRESOLVED_TEMPLATE_TOKEN = /\{\{[^{}\r\n]+\}\}/u;
const LOCAL_DEVELOPMENT_REF = "LOCAL_DEVELOPMENT_ONLY";
const IMMUTABLE_RELEASE_TAG = /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;
const FULL_COMMIT_SHA = /^[0-9a-f]{40}$/u;
const SEMANTIC_VERSION = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u;
const LOCALES = ["en-US", "zh-CN"];
const VERIFIED_AGENT_TARGETS = ["codex", "claude-code"];

/**
 * Read Monica's canonical schema-v3 prompt manifest and render it for one immutable release.
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
  const promptBytes = readFileSync(promptPath);
  const catalogBytes = readFileSync(catalogPath);
  const payload = JSON.parse(promptBytes.toString("utf8"));
  const catalog = JSON.parse(catalogBytes.toString("utf8"));
  const catalogDigest = digest(catalogBytes);
  const guideDistribution = validateCatalog(catalog, catalogPath);
  validateAsset(payload, promptPath, guideDistribution);

  const configuredRef = process.env.MONICA_AGENT_SKILL_REF?.trim() ?? "";
  if (configuredRef && !IMMUTABLE_RELEASE_TAG.test(configuredRef) && !FULL_COMMIT_SHA.test(configuredRef)) {
    throw new Error(`MONICA_AGENT_SKILL_REF must be a full commit SHA or immutable Monica release tag, received ${configuredRef}.`);
  }
  if (!configuredRef && publicReleaseBuild) {
    throw new Error("MONICA_AGENT_SKILL_REF is required for a public release build.");
  }
  if (publicReleaseBuild && !IMMUTABLE_RELEASE_TAG.test(configuredRef)) {
    throw new Error("Public release builds require a v<semver> Monica tag that passed immutable-source, installation, and discovery smoke testing.");
  }

  const immutableRef = configuredRef || LOCAL_DEVELOPMENT_REF;
  const render = (prompt) => {
    const rendered = prompt.replaceAll(IMMUTABLE_REF_TOKEN, immutableRef);
    const unresolvedToken = rendered.match(UNRESOLVED_TEMPLATE_TOKEN)?.[0];
    if (unresolvedToken) {
      throw new Error(`A Monica Guide bootstrap prompt contains unresolved template token ${unresolvedToken}.`);
    }
    return rendered;
  };

  return {
    schemaVersion: payload.schemaVersion,
    repository: payload.repository,
    skill: payload.skill,
    ref: immutableRef,
    catalogDigest,
    isLocalDevelopment: !configuredRef,
    skillsCli: guideDistribution.skillsCli,
    immutableSkillUrlTemplate: guideDistribution.immutableSkillUrlTemplate,
    verifiedAgentTargets: payload.verifiedAgentTargets,
    fallback: {
      installCommand: render(payload.fallback.installCommand),
      verifyCommand: render(payload.fallback.verifyCommand),
    },
    locales: {
      en: render(payload.locales["en-US"].prompt),
      "zh-CN": render(payload.locales["zh-CN"].prompt),
    },
  };
}

function validateCatalog(catalog, catalogPath) {
  const distribution = catalog?.distribution;
  const skillsCli = distribution?.skillsCli;
  const guidePath = catalog?.skills?.["monica-guide"]?.path;
  const bootstrapAsset = catalog?.prompts?.bootstrapAsset;
  const bootstrapSchema = catalog?.prompts?.bootstrapSchema;
  if (
    !distribution
    || typeof distribution !== "object"
    || distribution.repository !== "Tairitsua/Monica"
    || !skillsCli
    || typeof skillsCli !== "object"
    || skillsCli.package !== "skills"
    || typeof skillsCli.version !== "string"
    || !SEMANTIC_VERSION.test(skillsCli.version)
    || typeof distribution.immutableSkillUrlTemplate !== "string"
    || !distribution.immutableSkillUrlTemplate.includes("{tag}")
    || !distribution.immutableSkillUrlTemplate.includes("{skill}")
    || guidePath !== "skills/monica-guide"
    || bootstrapAsset !== "skills/monica-guide/assets/bootstrap-prompts.json"
    || bootstrapSchema !== "skills/monica-guide/assets/bootstrap-prompts.schema.json"
  ) {
    throw new Error(`Unexpected Monica Agent Skill catalog contract in ${catalogPath}.`);
  }

  return {
    skillsCli: { package: skillsCli.package, version: skillsCli.version },
    immutableSkillUrlTemplate: distribution.immutableSkillUrlTemplate,
  };
}

function validateAsset(payload, assetPath, catalogDistribution) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error(`Expected an object in ${assetPath}.`);
  }
  if (
    payload.schemaVersion !== 3
    || payload.repository !== "Tairitsua/Monica"
    || payload.skill !== "monica-guide"
    || payload.immutableRef !== IMMUTABLE_REF_TOKEN
    || payload.catalogDigest !== CATALOG_DIGEST_TOKEN
    || payload.distribution?.skillsCli?.package !== catalogDistribution.skillsCli.package
    || payload.distribution?.skillsCli?.version !== catalogDistribution.skillsCli.version
    || payload.distribution?.immutableSkillUrlTemplate !== catalogDistribution.immutableSkillUrlTemplate
  ) {
    throw new Error(`Unexpected Monica Guide bootstrap prompt contract in ${assetPath}.`);
  }

  if (
    !Array.isArray(payload.verifiedAgentTargets)
    || payload.verifiedAgentTargets.length !== VERIFIED_AGENT_TARGETS.length
    || payload.verifiedAgentTargets.some((target, index) => target !== VERIFIED_AGENT_TARGETS[index])
  ) {
    throw new Error(`Invalid verified agent targets in ${assetPath}.`);
  }

  const cliReference = `npx --yes ${catalogDistribution.skillsCli.package}@${catalogDistribution.skillsCli.version}`;
  const immutableSkillUrl = "https://github.com/Tairitsua/Monica/tree/{{MONICA_IMMUTABLE_REF}}/skills/monica-guide";
  if (
    payload.fallback?.installCommand !== `${cliReference} add ${immutableSkillUrl} -g -s monica-guide`
    || payload.fallback?.verifyCommand !== `${cliReference} ls -g --json`
  ) {
    throw new Error(`Invalid interactive fallback commands in ${assetPath}.`);
  }

  if (
    !payload.locales
    || typeof payload.locales !== "object"
    || Array.isArray(payload.locales)
    || Object.keys(payload.locales).length !== LOCALES.length
    || LOCALES.some((locale) => !Object.hasOwn(payload.locales, locale))
  ) {
    throw new Error(`Invalid prompt locales in ${assetPath}.`);
  }

  for (const locale of LOCALES) {
    const localized = payload.locales[locale];
    const prompt = localized?.prompt;
    const installationScope = locale === "en-US"
      ? ["After that installation, these restrictions apply", "make any other file changes"]
      : ["完成这次安装后", "以下限制适用：不要初始化仓库", "修改其他文件"];
    if (
      !localized
      || typeof localized !== "object"
      || Array.isArray(localized)
      || Object.keys(localized).length !== 1
      || !Object.hasOwn(localized, "prompt")
      || typeof prompt !== "string"
      || !prompt.trim()
      || !prompt.includes(immutableSkillUrl)
      || prompt.includes(CATALOG_DIGEST_TOKEN)
      || /(?:^|\s)(?:init|--workspace|--profile|--agent|--apply)(?:\s|$)/u.test(prompt)
      || installationScope.some((fragment) => !prompt.includes(fragment))
    ) {
      throw new Error(`Invalid universal ${locale} prompt in ${assetPath}.`);
    }
  }
}

function digest(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}
