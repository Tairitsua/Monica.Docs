type PromptSet = {
  codex: string;
  claude: string;
  generic: string;
};

type MonicaGuidePrompts = {
  schemaVersion: 1;
  repository: "Tairitsua/Monica";
  skill: "monica-guide";
  ref: string;
  isLocalDevelopment: boolean;
  skillsCli: {
    package: string;
    version: string;
  };
  immutableSkillUrlTemplate: string;
  locales: {
    en: PromptSet;
    "zh-CN": PromptSet;
  };
};

const serializedPrompts = process.env.NEXT_PUBLIC_MONICA_GUIDE_PROMPTS;
if (!serializedPrompts) {
  throw new Error("The Monica Guide bootstrap prompts were not loaded at build time.");
}

export const monicaGuidePrompts = JSON.parse(serializedPrompts) as MonicaGuidePrompts;
