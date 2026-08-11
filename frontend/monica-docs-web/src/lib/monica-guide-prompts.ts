type MonicaGuidePrompts = {
  schemaVersion: 3;
  repository: "Tairitsua/Monica";
  skill: "monica-guide";
  ref: string;
  catalogDigest: `sha256:${string}`;
  isLocalDevelopment: boolean;
  skillsCli: {
    package: "skills";
    version: string;
  };
  immutableSkillUrlTemplate: string;
  verifiedAgentTargets: readonly ["codex", "claude-code"];
  fallback: {
    installCommand: string;
    verifyCommand: string;
  };
  locales: {
    en: string;
    "zh-CN": string;
  };
};

const serializedPrompts = process.env.NEXT_PUBLIC_MONICA_GUIDE_PROMPTS;
if (!serializedPrompts) {
  throw new Error("The Monica Guide bootstrap prompts were not loaded at build time.");
}

export const monicaGuidePrompts = JSON.parse(serializedPrompts) as MonicaGuidePrompts;
