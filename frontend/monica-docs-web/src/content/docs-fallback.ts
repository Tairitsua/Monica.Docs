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
  description: string;
  markdown: string;
  tags: string[];
  headings: DocHeading[];
};

const fallbackDrafts: Record<Locale, FallbackDraft[]> = {
  en: [
    {
      slug: "getting-started",
      title: "Getting started with Monica",
      description: "Install Monica, compose a host-bound module graph, and run the application.",
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
      description: "Set up Codex or Claude Code for a Monica repository, preview the changes, and begin development safely.",
      tags: ["agent", "Codex", "Claude Code", "monica-guide"],
      headings: [
        { id: "before-you-start", title: "Before you start", level: 2 },
        { id: "choose-your-goal", title: "Choose your goal", level: 2 },
        { id: "review-the-preview", title: "Review the preview", level: 2 },
        { id: "apply-the-unchanged-plan", title: "Apply the unchanged plan", level: 2 },
        { id: "start-development", title: "Start development", level: 2 },
      ],
      markdown: `**monica-guide** prepares a coding agent to work in a Monica repository. It installs the development guidance for your goal, checks the repository, and previews setup before changing files. It is not a runtime package and does not edit business code during initialization.

## Before you start

Open Codex or Claude Code at the target repository root. Choose the host and goal in the [Agent setup starter](/#start), then paste the generated instruction into agent chat—not a terminal. Guide is normally installed once per user account and initialized once per repository.

## Choose your goal

- **Build a Monica application** when the repository consumes Monica packages.
- **Build an extension** for an independent module, provider, UI package, or companion image.

Guide explains its repository recommendation, but ambiguous repositories remain your decision. Contributor flows live in [Guide operations and safety](guide-operations.md#contributor-repositories).

## Review the preview

The instruction installs Guide from an immutable Monica tag, verifies discovery, initializes the selected goal without \`--apply\`, and reports the release, actions, files, diff, blockers, and \`planDigest\`. It does not authorize commits, pushes, issues, pull requests, or other remote changes.

## Apply the unchanged plan

After approval, Guide requires \`--apply\` and the exact \`--plan-digest\`. It refuses an apply after repository or plan drift. Run \`doctor\` after apply and start a new agent run when managed instructions changed.

## Start development

Ask the agent to explain the repository architecture and identify where the next feature belongs before editing. For channels, updates, state, source, and recovery, continue to [Guide operations and safety](guide-operations.md).`,
    },
    {
      slug: "getting-started/guide-operations",
      title: "Guide operations and safety",
      description: "Understand Monica Guide releases, updates, source bindings, managed state, recovery, and contribution safeguards.",
      tags: ["agent", "release", "update", "safety"],
      headings: [
        { id: "three-version-axes", title: "Three version axes", level: 2 },
        { id: "channels-and-exact-releases", title: "Channels and exact releases", level: 2 },
        { id: "status-doctor-and-update", title: "Status, doctor, and update", level: 2 },
        { id: "plan-digests-and-protected-apply", title: "Plan digests and protected apply", level: 2 },
        { id: "source-binding", title: "Source binding", level: 2 },
        { id: "managed-instructions-and-state", title: "Managed instructions and state", level: 2 },
        { id: "contributor-repositories", title: "Contributor repositories", level: 2 },
      ],
      markdown: `Use this page after the first [Agent setup](agent-setup.md), when maintaining an existing setup, or when working in a Monica contributor repository.

## Three version axes

- The **framework version** is the Monica dependency used by the project.
- The **skill-bundle release** is one tested set published with an immutable Monica release.
- A **per-skill revision** advances during a release only when that skill's authoritative digest changed.

Ordinary CI validates contracts and revision accounting. Only Monica's release workflow publishes immutable assets, advances revisions, or moves \`stable\` and \`preview\` pointers after smoke tests pass.

## Channels and exact releases

Stable and preview resolve to immutable tags. An explicit release tag selects that exact release and derives its channel. Source selects an exact commit. Offline mode never substitutes another artifact. One global Monica skill-bundle release is active per user, and \`doctor\` reports repository conflicts.

## Status, doctor, and update

Use \`status\` for current bindings and \`doctor\` for actionable checks; both support \`--json\`. \`update\` previews changed revisions and reinstalls only changed or unhealthy Monica skills. A targeted update still requires a coherent dependency closure.

## Plan digests and protected apply

Every mutating intent previews actions and diffs. Apply requires \`--apply --plan-digest <digest>\` and fails after drift. Global-skill changes use a compensating boundary, and unresolved recovery evidence blocks another mutation.

## Source binding

Required source is bound to a verified ref, commit, provenance, access mode, and local path through the stable \`inspect-dependency-source resolve --json\` contract. Mixed versions and unavailable exact artifacts fail closed.

## Managed instructions and state

Guide manages only its marked root \`AGENTS.md\` block and can maintain a minimal \`CLAUDE.md\` import. Repository choices live in \`.monica/guide.json\`; global release, local source paths, preferences, and observations remain in user state.

## Contributor repositories

Framework and docs profiles require their canonical writable repositories and the documented source access. Remote Issues, pull requests, branches, and pushes always need current-session approval. Suspected vulnerabilities must use a private route.`,
    },
    {
      slug: "architecture",
      title: "Architecture",
      description: "Understand Monica host composition, ProjectUnits, and runtime evidence.",
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
      description: "Choose Monica packages using the Stable, Integrations, and Labs maturity contract.",
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
      title: "开始使用 Monica",
      description: "安装 Monica，组合主机绑定的模块图，并启动应用。",
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
      description: "为 Monica 仓库设置 Codex 或 Claude Code，预览变更，并安全开始开发。",
      tags: ["Agent", "Codex", "Claude Code", "monica-guide"],
      headings: [
        { id: "开始前", title: "开始前", level: 2 },
        { id: "选择开发目标", title: "选择开发目标", level: 2 },
        { id: "审核预览", title: "审核预览", level: 2 },
        { id: "应用未变化的计划", title: "应用未变化的计划", level: 2 },
        { id: "开始开发", title: "开始开发", level: 2 },
      ],
      markdown: `**monica-guide** 用来让编码 Agent 为 Monica 仓库做好开发准备。它会按目标安装开发指导、检查仓库，并在修改文件前预览设置方案。它不是运行时包，也不会在初始化期间修改业务代码。

## 开始前

在目标仓库根目录打开 Codex 或 Claude Code。前往首页的 [Agent 设置起步区](/zh-CN/#start)选择宿主与目标，再把生成的指令粘贴到 Agent 对话框，而不是终端。通常每个用户只需安装一次 Guide，每个仓库只需初始化一次。

## 选择开发目标

- **开发 Monica 应用**：仓库通过 Monica 包实现应用。
- **开发扩展**：创建独立模块、Provider、UI 包或配套镜像。

Guide 会解释仓库建议，但模糊仓库仍由你决定。贡献者流程位于 [Guide 运维与安全](guide-operations.md#贡献者仓库)。

## 审核预览

指令会从不可变 Monica tag 安装 Guide、验证发现能力、不带 \`--apply\` 初始化目标，并报告发布版本、操作、文件、Diff、阻塞项与 \`planDigest\`。它不会授权 Commit、Push、Issue、Pull Request 或其他远程变更。

## 应用未变化的计划

批准后，Guide 要求同时提供 \`--apply\` 与精确的 \`--plan-digest\`。仓库或计划漂移后会拒绝执行。应用完成后运行 \`doctor\`；托管指令变化后开始一次新的 Agent 运行。

## 开始开发

可以先让 Agent 解释仓库架构，并在修改前指出下一个功能应该放在哪里。如需了解通道、更新、状态、源码与恢复，请继续阅读 [Guide 运维与安全](guide-operations.md)。`,
    },
    {
      slug: "getting-started/guide-operations",
      title: "Guide 运维与安全",
      description: "了解 Monica Guide 的发布、更新、源码绑定、托管状态、恢复机制与贡献安全边界。",
      tags: ["Agent", "发布", "更新", "安全"],
      headings: [
        { id: "三类版本身份", title: "三类版本身份", level: 2 },
        { id: "通道与精确发布版本", title: "通道与精确发布版本", level: 2 },
        { id: "statusdoctor-与-update", title: "Status、Doctor 与 Update", level: 2 },
        { id: "plan-digest-与受保护执行", title: "Plan Digest 与受保护执行", level: 2 },
        { id: "源码绑定", title: "源码绑定", level: 2 },
        { id: "托管指令与状态", title: "托管指令与状态", level: 2 },
        { id: "贡献者仓库", title: "贡献者仓库", level: 2 },
      ],
      markdown: `完成首次 [Agent 设置](agent-setup.md)后、维护已有设置时，或在 Monica 贡献仓库中工作时，请使用本页。

## 三类版本身份

- **框架版本**是项目使用的 Monica 依赖版本。
- **Skill Bundle 发布版本**是随不可变 Monica 版本发布的一组共同测试资产。
- **单个 Skill Revision**仅在发布时该 Skill 的权威 Digest 发生变化后递增。

日常 CI 只验证契约与 Revision 记账。只有 Monica Release Workflow 会在 Smoke Test 通过后发布不可变资产、递增 Revision 或移动 \`stable\` 与 \`preview\` 指针。

## 通道与精确发布版本

Stable 与 Preview 解析到不可变 tag。显式 release tag 选择精确发布版本并推导通道；Source 选择精确 commit。离线模式不会替换其他产物。每个用户同时只有一个全局 Monica Skill Bundle 发布版本，\`doctor\` 会报告仓库冲突。

## Status、Doctor 与 Update

使用 \`status\` 查看当前绑定，使用 \`doctor\` 获取可执行检查；两者都支持 \`--json\`。\`update\` 会预览变化的 Revision，并只重新安装已变化或不健康的 Monica Skill。定向更新仍必须形成一致的依赖闭包。

## Plan Digest 与受保护执行

每个修改型 Intent 都会预览操作与 Diff。应用要求 \`--apply --plan-digest <digest>\`，发生漂移后会失败。全局 Skill 变更使用补偿边界；未解决的恢复证据会阻止下一次修改。

## 源码绑定

必须使用的源码通过稳定的 \`inspect-dependency-source resolve --json\` 契约绑定到经过验证的 ref、commit、来源、访问模式与本地路径。混合版本与不可用的精确产物会 Fail closed。

## 托管指令与状态

Guide 只管理根 \`AGENTS.md\` 中自己的标记区块，并可维护最小 \`CLAUDE.md\` import。仓库选择保存在 \`.monica/guide.json\`；全局发布版本、本地源码路径、偏好与观察记录保留在用户状态中。

## 贡献者仓库

框架与文档 Profile 要求对应的规范可写仓库以及文档规定的源码访问模式。远程 Issue、Pull Request、分支与 Push 始终需要当前会话授权。疑似漏洞必须走私密渠道。`,
    },
    {
      slug: "architecture",
      title: "架构设计",
      description: "理解 Monica 的主机组合、ProjectUnit 与运行时证据。",
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
      description: "按照 Stable、生态集成与 Labs 成熟度契约选择 Monica 包。",
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
    metadata: { source: "launch-fallback", description: draft.description },
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
  const gettingStarted = documents.find((document) => document.slug === "getting-started");
  const agentSetup = documents.find((document) => document.slug === "getting-started/agent-setup");
  const guideOperations = documents.find((document) => document.slug === "getting-started/guide-operations");
  const architecture = documents.find((document) => document.slug === "architecture");
  const moduleSystem = documents.find((document) => document.slug === "module-system");

  if (!gettingStarted || !agentSetup || !guideOperations || !architecture || !moduleSystem) {
    return [];
  }

  return [
    {
      title: locale === "en" ? "Getting started" : "快速开始",
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
        {
          title: guideOperations.title,
          path: "getting-started/guide-operations.md",
          slug: guideOperations.slug,
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
