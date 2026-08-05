import type { Locale } from "@/content/home";
import { monicaRelease } from "@/lib/monica-release";
import type {
  DocContent,
  DocHeading,
  DocSearchResult,
  DocTreeItem,
} from "@/lib/documentation-types";
import { docsPath, normalizeDocSlug } from "@/lib/routes";

type FallbackDraft = {
  slug: string;
  title: string;
  markdown: string;
  tags: string[];
  headings: DocHeading[];
};

const fallbackDrafts: Record<Locale, FallbackDraft[]> = {
  en: [
    {
      slug: "getting-started",
      title: "Getting started",
      tags: ["template", "quick start", ".NET 10"],
      headings: [
        { id: "install-the-template", title: "Install the template", level: 2 },
        { id: "inspect-the-running-host", title: "Inspect the running host", level: 2 },
        { id: "what-the-template-proves", title: "What the template proves", level: 2 },
      ],
      markdown: `Monica starts with a small, executable host. The template uses Stable packages and OpenTelemetry so you can inspect the framework before adding more infrastructure.

## Install the template

\`\`\`bash
dotnet new install ${monicaRelease.templatePackage}
dotnet new monica-api --name Acme.Orders
cd Acme.Orders
dotnet run
\`\`\`

The generated project targets **.NET 10** and keeps Monica composition visible in the application bootstrap.

## Inspect the running host

Open the root endpoint, then verify \`/healthz\` and \`/metrics\`. These surfaces make application identity, health, and telemetry available from the first run.

## What the template proves

- Monica remains an ASP.NET Core application.
- Modules are selected explicitly by the host.
- Runtime evidence is part of the starter path.

Continue with [Architecture](architecture.md?from=starter#host-owned-composition) to understand the dependency model.`,
    },
    {
      slug: "getting-started/agent-setup",
      title: "Agent setup",
      tags: ["agent", "Codex", "Claude Code", "monica-guide"],
      headings: [
        { id: "choose-a-profile", title: "Choose a profile", level: 2 },
        { id: "preview-then-apply", title: "Preview, then apply", level: 2 },
        { id: "release-and-source-safety", title: "Release and source safety", level: 2 },
      ],
      markdown: `Install **monica-guide** from the immutable Monica ref shown on the website home page. The Codex and Claude Code prompts pass their matching explicit \`--agent\` target; the generic fallback selects both. Guide configures agent development skills for the repository while keeping every mutating action behind a preview and verified plan digest.

## Choose a profile

- **application** for Monica-consuming applications.
- **extension-author** for independent modules and providers.
- **framework-contributor** for the Monica framework checkout.
- **docs-contributor** for Monica.Docs and its source-backed examples.

Guide can suggest a profile, but ambiguous repositories remain a user decision.

## Preview, then apply

The mutating intents \`init\`, \`update\`, \`configure\`, \`source\`, \`contribute\`, and \`forget\` default to dry-run. Applying requires \`--apply\` plus the exact \`planDigest\`, and aborts after workspace drift. Global-skill plans protect selected skills and planned files in one compensating boundary; retained recovery evidence is reported by \`doctor\` and blocks later mutation until reconciled. Use \`doctor --json\` for automation.

## Release and source safety

One Monica skill release is active globally per user. Repository expectations live in \`.monica/guide.json\`; \`doctor\` reports conflicts instead of claiming global multi-version isolation. Stable, preview, and source bindings always resolve to immutable artifacts, and offline mode never substitutes another release.

Guide manages only its marked root \`AGENTS.md\` block and can keep a minimal \`CLAUDE.md\` import. Remote contribution actions always need current-session approval, while suspected vulnerabilities are routed privately.`,
    },
    {
      slug: "architecture",
      title: "Architecture",
      tags: ["architecture", "module graph", "ProjectUnit"],
      headings: [
        { id: "host-owned-composition", title: "Host-owned composition", level: 2 },
        { id: "explicit-application-behavior", title: "Explicit application behavior", level: 2 },
        { id: "runtime-evidence", title: "Runtime evidence", level: 2 },
      ],
      markdown: `Monica is a modular infrastructure framework for ASP.NET Core. It adds an explicit application model without replacing the runtime, dependency injection container, or domain architecture you already use.

## Host-owned composition

The application host chooses modules through a builder-scoped graph. Dependencies, providers, configuration, and lifecycle order remain visible at the composition root.

## Explicit application behavior

ProjectUnits give application behavior names and placement: \`ApplicationService\`, \`DomainEventHandler\`, \`Repository\`, jobs, triggers, and configuration all become navigable concepts for developers and coding agents.

## Runtime evidence

The same boundaries that organize source code shape health, metrics, traces, and Monica UI surfaces. The goal is not more abstraction; it is less architectural guesswork.

See [Module maturity](/docs/module-system) before choosing packages.`,
    },
    {
      slug: "module-system",
      title: "Module system and maturity",
      tags: ["modules", "stable", "integrations", "labs"],
      headings: [
        { id: "three-maturity-tiers", title: "Three maturity tiers", level: 2 },
        { id: "composition-contract", title: "Composition contract", level: 2 },
        { id: "choose-the-smallest-boundary", title: "Choose the smallest boundary", level: 2 },
      ],
      markdown: `Every Monica package is independently adoptable, but package maturity is part of the public contract.

## Three maturity tiers

- **Stable** is the supported Monica 1.0 application path.
- **Integrations** are versioned adapters around external systems and provider boundaries.
- **Labs** are deliberately fast-moving capabilities that may change before promotion.

## Composition contract

Modules declare their dependencies and register through the host builder. Provider packages sit behind explicit Monica abstractions, while UI packages consume infrastructure facades rather than duplicating application logic.

## Choose the smallest boundary

Existing applications can start with configuration, OpenTelemetry, scheduling, or state. Adopt ProjectUnit conventions when shared vocabulary is more valuable than local freedom.

Browse the [complete package catalog](/modules) for the release-tier inventory.`,
    },
  ],
  "zh-CN": [
    {
      slug: "getting-started",
      title: "快速开始",
      tags: ["模板", "快速开始", ".NET 10"],
      headings: [
        { id: "安装项目模板", title: "安装项目模板", level: 2 },
        { id: "检查运行中的主机", title: "检查运行中的主机", level: 2 },
        { id: "模板证明了什么", title: "模板证明了什么", level: 2 },
      ],
      markdown: `Monica 从一个小而可执行的主机开始。模板只采用 Stable 包与 OpenTelemetry，让你在增加更多基础设施前先检查框架本身。

## 安装项目模板

\`\`\`bash
dotnet new install ${monicaRelease.templatePackage}
dotnet new monica-api --name Acme.Orders
cd Acme.Orders
dotnet run
\`\`\`

生成的项目面向 **.NET 10**，并在应用启动代码中明确保留 Monica 的组合过程。

## 检查运行中的主机

打开根端点，然后检查 \`/healthz\` 与 \`/metrics\`。应用身份、健康状态与遥测从第一次运行起就可见。

## 模板证明了什么

- Monica 仍然是 ASP.NET Core 应用。
- 主机显式选择所需模块。
- 运行时证据属于默认入门路径。

继续阅读[架构设计](architecture.md?from=starter#主机拥有组合权)，了解依赖模型。`,
    },
    {
      slug: "getting-started/agent-setup",
      title: "Agent 设置",
      tags: ["Agent", "Codex", "Claude Code", "monica-guide"],
      headings: [
        { id: "选择-profile", title: "选择 Profile", level: 2 },
        { id: "先预览再应用", title: "先预览，再应用", level: 2 },
        { id: "发布与源码安全", title: "发布与源码安全", level: 2 },
      ],
      markdown: `从官网首页展示的不可变 Monica ref 安装 **monica-guide**。Codex 与 Claude Code Prompt 会显式传入各自的 \`--agent\` 目标，通用 fallback 则选择两者。Guide 会为当前仓库配置 Agent 开发 Skill，并把所有修改操作放在完整预览与已验证 Plan Digest 之后。

## 选择 Profile

- **application**：消费 Monica 的应用。
- **extension-author**：独立模块与 Provider。
- **framework-contributor**：Monica 框架 checkout。
- **docs-contributor**：Monica.Docs 及其源码支撑示例。

Guide 可以建议 Profile，但模糊仓库仍由用户决定。

## 先预览，再应用

\`init\`、\`update\`、\`configure\`、\`source\`、\`contribute\` 与 \`forget\` 默认 Dry run。应用时必须提供 \`--apply\` 与精确的 \`planDigest\`；工作区漂移后会中止。全局 Skill 计划会在同一补偿边界中保护选中 Skill 与计划文件；保留的恢复证据会由 \`doctor\` 报告，并在核对前阻止后续修改。自动化诊断可以使用 \`doctor --json\`。

## 发布与源码安全

每个用户同时只有一个全局 Monica Skill 发布版本。仓库期望值写入 \`.monica/guide.json\`；\`doctor\` 会报告冲突，不会声称支持全局多版本隔离。Stable、Preview 与 Source 绑定始终解析到不可变产物，离线模式也不会替换成其他发布版本。

Guide 只管理根 \`AGENTS.md\` 中自己的标记区块，并可维护最小 \`CLAUDE.md\` import。远程贡献操作始终需要当前会话授权；疑似漏洞只走私密渠道。`,
    },
    {
      slug: "architecture",
      title: "架构设计",
      tags: ["架构", "模块图", "ProjectUnit"],
      headings: [
        { id: "主机拥有组合权", title: "主机拥有组合权", level: 2 },
        { id: "明确的应用行为", title: "明确的应用行为", level: 2 },
        { id: "运行时证据", title: "运行时证据", level: 2 },
      ],
      markdown: `Monica 是面向 ASP.NET Core 的模块化基础设施框架。它增加明确的应用模型，但不会替代你已经使用的运行时、依赖注入容器或领域架构。

## 主机拥有组合权

应用主机通过 Builder 作用域的模块图选择能力。依赖、Provider、配置与生命周期顺序都清楚地留在组合根中。

## 明确的应用行为

ProjectUnit 为应用行为赋予名称与位置：\`ApplicationService\`、\`DomainEventHandler\`、\`Repository\`、任务、触发器和配置都成为开发者与编码智能体可以导航的概念。

## 运行时证据

组织源码的同一组边界也塑造健康状态、指标、链路与 Monica UI。目标不是制造更多抽象，而是减少架构猜测。

选择包之前，请先阅读[模块成熟度](/zh-CN/docs/module-system)。`,
    },
    {
      slug: "module-system",
      title: "模块系统与成熟度",
      tags: ["模块", "Stable", "集成", "Labs"],
      headings: [
        { id: "三个成熟度层级", title: "三个成熟度层级", level: 2 },
        { id: "组合契约", title: "组合契约", level: 2 },
        { id: "选择最小边界", title: "选择最小边界", level: 2 },
      ],
      markdown: `每个 Monica 包都可以独立采用，但包的成熟度属于公开契约的一部分。

## 三个成熟度层级

- **Stable** 是 Monica 1.0 支持的应用路径。
- **生态集成** 是围绕外部系统与 Provider 边界提供的版本化适配器。
- **Labs** 有意保持快速变化，在晋升前可能调整契约。

## 组合契约

模块声明自己的依赖，并通过主机 Builder 注册。Provider 包位于明确的 Monica 抽象之后，UI 包消费基础设施 Facade，而不是复制应用逻辑。

## 选择最小边界

现有应用可以先采用配置、OpenTelemetry、调度或状态模块。当共享词汇比局部自由更有价值时，再引入 ProjectUnit 约定。

前往[完整模块目录](/zh-CN/modules)查看发布层级清单。`,
    },
  ],
};

function createContent(locale: Locale, draft: FallbackDraft, index: number): DocContent {
  const localeDrafts = fallbackDrafts[locale];
  const previousDraft = localeDrafts[index - 1];
  const nextDraft = localeDrafts[index + 1];
  const alternateLocale: Locale = locale === "en" ? "zh-CN" : "en";
  const alternateDraft = fallbackDrafts[alternateLocale].find((item) => item.slug === draft.slug);

  return {
    locale: locale === "en" ? "en-US" : "zh-CN",
    slug: draft.slug,
    title: draft.title,
    relativePath: `${draft.slug}.md`,
    canonicalPath: docsPath(locale, draft.slug),
    markdown: draft.markdown,
    lastModifiedUtc: "2026-07-13T00:00:00.000Z",
    date: null,
    tags: draft.tags,
    metadata: { source: "launch-fallback" },
    headings: draft.headings,
    breadcrumbs: [
      { title: locale === "en" ? "Docs" : "文档", slug: null, isCurrent: false },
      { title: draft.title, slug: draft.slug, isCurrent: true },
    ],
    alternates: alternateDraft
      ? [{
          locale: alternateLocale === "en" ? "en-US" : "zh-CN",
          slug: alternateDraft.slug,
          title: alternateDraft.title,
          path: docsPath(alternateLocale, alternateDraft.slug),
        }]
      : [],
    previous: previousDraft
      ? { slug: previousDraft.slug, title: previousDraft.title, path: docsPath(locale, previousDraft.slug) }
      : null,
    next: nextDraft
      ? { slug: nextDraft.slug, title: nextDraft.title, path: docsPath(locale, nextDraft.slug) }
      : null,
  };
}

export function getFallbackDocuments(locale: Locale): DocContent[] {
  return fallbackDrafts[locale].map((draft, index) => createContent(locale, draft, index));
}

export function getFallbackDocument(locale: Locale, slug: string): DocContent | null {
  const normalizedSlug = normalizeDocSlug(slug);
  return getFallbackDocuments(locale).find((document) => document.slug === normalizedSlug) ?? null;
}

export function getFallbackTree(locale: Locale): DocTreeItem[] {
  const documents = getFallbackDocuments(locale);
  const [gettingStarted, agentSetup, architecture, moduleSystem] = documents;

  if (!gettingStarted || !agentSetup || !architecture || !moduleSystem) {
    return [];
  }

  return [
    {
      title: locale === "en" ? "Start" : "开始",
      path: "getting-started",
      slug: null,
      isDocument: false,
      children: [
        {
          title: gettingStarted.title,
          path: "getting-started.md",
          slug: gettingStarted.slug,
          isDocument: true,
          children: [],
        },
        {
          title: agentSetup.title,
          path: "getting-started/agent-setup.md",
          slug: agentSetup.slug,
          isDocument: true,
          children: [],
        },
      ],
    },
    {
      title: locale === "en" ? "Concepts" : "核心概念",
      path: "concepts",
      slug: null,
      isDocument: false,
      children: [
        {
          title: architecture.title,
          path: "architecture.md",
          slug: architecture.slug,
          isDocument: true,
          children: [],
        },
        {
          title: moduleSystem.title,
          path: "module-system.md",
          slug: moduleSystem.slug,
          isDocument: true,
          children: [],
        },
      ],
    },
  ];
}

export function searchFallbackDocuments(locale: Locale, query: string): DocSearchResult[] {
  const normalizedQuery = query.trim().toLocaleLowerCase(locale === "en" ? "en-US" : "zh-CN");
  if (!normalizedQuery) {
    return [];
  }

  return getFallbackDocuments(locale)
    .map<DocSearchResult | null>((document) => {
      const plainText = document.markdown
        .replace(/```[\s\S]*?```/gu, " ")
        .replace(/[#*`_()]/gu, " ")
        .replaceAll("[", " ")
        .replaceAll("]", " ")
        .replace(/\s+/gu, " ")
        .trim();
      const searchable = `${document.title} ${document.tags.join(" ")} ${plainText}`;
      const matchIndex = searchable.toLocaleLowerCase(locale === "en" ? "en-US" : "zh-CN").indexOf(normalizedQuery);

      if (matchIndex < 0) {
        return null;
      }

      const bodyIndex = plainText.toLocaleLowerCase(locale === "en" ? "en-US" : "zh-CN").indexOf(normalizedQuery);
      const excerptStart = Math.max(0, bodyIndex < 0 ? 0 : bodyIndex - 54);
      const previewText = plainText.slice(excerptStart, excerptStart + 190);
      const highlightStart = previewText.toLocaleLowerCase(locale === "en" ? "en-US" : "zh-CN").indexOf(normalizedQuery);

      return {
        locale: document.locale,
        slug: document.slug,
        title: document.title,
        path: document.canonicalPath,
        pathTrail: locale === "en" ? "Docs" : "文档",
        sectionTitle: null,
        previewText,
        previewHighlights: highlightStart >= 0 ? [{ start: highlightStart, length: query.trim().length }] : [],
        anchorId: null,
        score: document.title.toLocaleLowerCase().includes(normalizedQuery) ? 2 : 1,
      } satisfies DocSearchResult;
    })
    .filter((item): item is DocSearchResult => item !== null)
    .sort((left, right) => right.score - left.score);
}
