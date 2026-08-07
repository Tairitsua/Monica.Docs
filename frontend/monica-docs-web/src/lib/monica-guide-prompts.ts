export type MonicaGuideHost = "codex" | "claude-code" | "generic";
export type MonicaGuideGoal = "application" | "extension";

type PromptMatrix = Record<MonicaGuideHost, Record<MonicaGuideGoal, string>>;

type MonicaGuidePrompts = {
  schemaVersion: 2;
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
  hosts: Record<MonicaGuideHost, { agentTargets: string[] }>;
  goals: Record<MonicaGuideGoal, { profile: "application" | "extension-author" }>;
  locales: {
    en: PromptMatrix;
    "zh-CN": PromptMatrix;
  };
};

const serializedPrompts = process.env.NEXT_PUBLIC_MONICA_GUIDE_PROMPTS;
if (!serializedPrompts) {
  throw new Error("The Monica Guide bootstrap prompts were not loaded at build time.");
}

export const monicaGuidePrompts = JSON.parse(serializedPrompts) as MonicaGuidePrompts;
