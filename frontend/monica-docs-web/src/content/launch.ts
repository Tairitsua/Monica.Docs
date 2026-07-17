import type { Locale } from "@/content/home";

export type PackageTier = "stable" | "integration" | "labs";

export const packageCatalog: Record<PackageTier, readonly string[]> = {
  stable: [
    "Monica.Authority",
    "Monica.AutoModel",
    "Monica.Configuration",
    "Monica.Configuration.UI",
    "Monica.Core",
    "Monica.DependencyInjection",
    "Monica.EventBus",
    "Monica.Framework",
    "Monica.Framework.Generators",
    "Monica.Framework.UI",
    "Monica.Generators.AutoController",
    "Monica.JobScheduler",
    "Monica.JobScheduler.UI",
    "Monica.Locker",
    "Monica.Logging",
    "Monica.Markdown",
    "Monica.OpenTelemetry",
    "Monica.OpenTelemetry.UI",
    "Monica.ProjectUnits",
    "Monica.Repository",
    "Monica.Repository.UI",
    "Monica.ServiceDiscovery",
    "Monica.StateStore",
    "Monica.StateStore.UI",
    "Monica.Templates",
    "Monica.Testing",
    "Monica.Testing.UI",
    "Monica.Tool",
    "Monica.UI",
    "Monica.Utilities",
    "Monica.WebApi",
  ],
  integration: [
    "Monica.Configuration.EfCore",
    "Monica.Configuration.EventBus",
    "Monica.Dapr",
    "Monica.EventBus.Kafka",
    "Monica.JobScheduler.EfCore",
    "Monica.SignalR",
    "Monica.StateStore.StackExchange",
  ],
  labs: [
    "Monica.AI",
    "Monica.AI.UI",
    "Monica.DataChannel",
    "Monica.DevOps",
    "Monica.Office",
    "Monica.Profiling",
  ],
};

type LaunchCopy = {
  docs: {
    eyebrow: string;
    title: string;
    description: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchAction: string;
    searchHint: string;
    noResults: string;
    catalog: string;
    fallbackTitle: string;
    fallbackBody: string;
    apiTitle: string;
    apiBody: string;
    unavailableTitle: string;
    unavailableBody: string;
    articleUnavailable: string;
    articleUnavailableBody: string;
    onThisPage: string;
    previous: string;
    next: string;
    updated: string;
    back: string;
  };
  modules: {
    eyebrow: string;
    title: string;
    description: string;
    counts: readonly [string, string, string];
    tierNames: readonly [string, string, string];
    tierPromises: readonly [string, string, string];
    boundaryTitle: string;
    boundaryBody: string;
    unpublishedTitle: string;
    unpublishedBody: string;
  };
  reference: {
    eyebrow: string;
    title: string;
    description: string;
    templateLabel: string;
    templateTitle: string;
    templateBody: string;
    runLabel: string;
    proofLabel: string;
    source: string;
    appLabel: string;
    appTitle: string;
    appBody: string;
    architecture: string;
    dependency: string;
    seamTitle: string;
    seamBody: string;
    endpoints: string;
  };
  roadmap: {
    eyebrow: string;
    title: string;
    description: string;
    currentLabel: string;
    currentTitle: string;
    currentBody: string;
    phases: readonly { marker: string; title: string; body: string; state: string }[];
    gatesTitle: string;
    gates: readonly string[];
    promisesTitle: string;
    promises: readonly string[];
    dateNote: string;
  };
};

export const launchCopy: Record<Locale, LaunchCopy> = {
  en: {
    docs: {
      eyebrow: "Documentation / executable guidance",
      title: "Build with the architecture in view.",
      description: "Start from an executable host, understand the application model, then adopt only the modules your boundary needs.",
      searchLabel: "Search documentation",
      searchPlaceholder: "Search concepts, modules, APIs…",
      searchAction: "Search",
      searchHint: "Searches the public documentation API when connected.",
      noResults: "No matching documentation found.",
      catalog: "Documentation map",
      fallbackTitle: "Curated launch preview",
      fallbackBody: "The documentation API is not configured in this build. These launch-critical guides remain available locally.",
      apiTitle: "Live documentation catalog",
      apiBody: "Navigation and article content are being served by Monica.Docs Public API.",
      unavailableTitle: "Catalog temporarily unavailable",
      unavailableBody: "The public documentation source could not be reached. Try again when the API is available.",
      articleUnavailable: "This document is not available yet.",
      articleUnavailableBody: "The requested slug is outside the local launch preview and the documentation API did not return an article.",
      onThisPage: "On this page",
      previous: "Previous",
      next: "Next",
      updated: "Last source update",
      back: "Back to documentation",
    },
    modules: {
      eyebrow: "Package maturity / public contract",
      title: "Know the promise before you install the package.",
      description: "Monica publishes maturity as architecture metadata: a supported 1.0 path, versioned external adapters, and deliberately fast-moving experiments.",
      counts: ["30 stable packages", "7 integration packages", "6 labs packages"],
      tierNames: ["Stable", "Integrations", "Labs"],
      tierPromises: [
        "The supported Monica 1.0 application path.",
        "Versioned adapters around external systems and provider boundaries.",
        "Deliberately fast-moving capabilities that may change before promotion.",
      ],
      boundaryTitle: "Maturity is not a quality ranking.",
      boundaryBody: "It describes the release promise. Stable packages form the intended 1.0 application path; integrations remain explicit opt-ins; Labs make experimentation visible without implying contract stability.",
      unpublishedTitle: "Intentionally unpublished",
      unpublishedBody: "Monica.Experimental remains a Labs-only workspace package. Monica.Generators.AutoController.BuildTasks is implementation detail packaged through the public generator.",
    },
    reference: {
      eyebrow: "Executable evidence / two entry paths",
      title: "Evaluate Monica in running code, not in a feature list.",
      description: "Use the template for a five-minute host. Use Monica Ordering Reference when you need to inspect boundaries, dependencies, and replacement seams in a realistic application.",
      templateLabel: "PATH 01 / NEW HOST",
      templateTitle: "Start with the Monica template.",
      templateBody: "A deliberately small .NET 10 application using Stable packages and OpenTelemetry. It proves startup composition and runtime evidence without preloading every module.",
      runLabel: "Run",
      proofLabel: "Inspect",
      source: "Open source",
      appLabel: "PATH 02 / ARCHITECTURE REVIEW",
      appTitle: "Trace the Ordering reference.",
      appBody: "A modular-monolith reference with one domain and an explicit dependency chain. Follow a request from the AppHost into Ordering and down through shared platform layers.",
      architecture: "Solution shape",
      dependency: "Allowed dependency direction",
      seamTitle: "A seam is only credible when it can be replaced.",
      seamBody: "The reference uses an in-memory repository that resets on restart. That limitation is intentional: the repository boundary is the documented replacement seam for a real persistence provider.",
      endpoints: "Runtime surfaces",
    },
    roadmap: {
      eyebrow: "Release roadmap / evidence before dates",
      title: "1.0 ships when the contract is credible.",
      description: "Monica is currently 1.0.0-rc.2. The roadmap is organized around release evidence, not invented calendar promises.",
      currentLabel: "CURRENT",
      currentTitle: "1.0.0-rc.2 / RC hardening",
      currentBody: "The supported path is taking shape now. Contracts may still change before GA when simplification or correctness requires it.",
      phases: [
        { marker: "01", title: "RC hardening", body: "Simplify public contracts, close architecture gaps, and keep the whole solution warning-free.", state: "NOW" },
        { marker: "02", title: "Release evidence", body: "Make templates, reference applications, package tiers, and bilingual launch documentation independently verifiable.", state: "IN PROGRESS" },
        { marker: "03", title: "1.0 GA", body: "Publish the Stable 1.0 set only after build, package, documentation, and executable-reference gates all pass.", state: "GATED" },
        { marker: "04", title: "Post-1.0 ecosystem", body: "Promote integrations and Labs capabilities only when their contracts earn a stronger maturity promise.", state: "LATER" },
      ],
      gatesTitle: "Release gates",
      gates: [
        "The complete solution builds with zero warnings.",
        "Templates and reference applications execute from documented commands.",
        "Public contracts and Stable behavior have usable documentation.",
        "Stable, Integrations, and Labs boundaries match published packages.",
        "Release packages can be reproduced and inspected before publishing.",
      ],
      promisesTitle: "What this roadmap does not promise",
      promises: [
        "Labs APIs are not stable merely because they are visible.",
        "Integration providers are not pulled into the core adoption path.",
        "Pre-1.0 contracts will not be preserved at the cost of a clearer design.",
      ],
      dateNote: "No GA date is announced. Evidence closes the gate.",
    },
  },
  "zh-CN": {
    docs: {
      eyebrow: "使用文档 / 可执行指南",
      title: "让架构始终处于视野之内。",
      description: "从可执行主机开始，理解应用模型，然后只采用当前边界真正需要的模块。",
      searchLabel: "搜索文档",
      searchPlaceholder: "搜索概念、模块、API…",
      searchAction: "搜索",
      searchHint: "连接后将搜索 Monica.Docs 公开 API。",
      noResults: "没有找到匹配的文档。",
      catalog: "文档地图",
      fallbackTitle: "发布内容预览",
      fallbackBody: "当前构建没有配置文档 API。发布所需的核心指南仍可从本地内容读取。",
      apiTitle: "实时文档目录",
      apiBody: "导航与文章内容正由 Monica.Docs Public API 提供。",
      unavailableTitle: "文档目录暂时不可用",
      unavailableBody: "无法连接公开文档源，请在 API 恢复后重试。",
      articleUnavailable: "这篇文档尚不可用。",
      articleUnavailableBody: "请求的路径不在本地发布预览中，文档 API 也没有返回对应文章。",
      onThisPage: "本页内容",
      previous: "上一篇",
      next: "下一篇",
      updated: "源文件最后更新",
      back: "返回文档",
    },
    modules: {
      eyebrow: "包成熟度 / 公开契约",
      title: "安装之前，先看清它承诺什么。",
      description: "Monica 将成熟度作为架构元数据公开：受支持的 1.0 路径、围绕外部系统的版本化适配器，以及有意快速演进的实验能力。",
      counts: ["30 个稳定包", "7 个集成包", "6 个 Labs 包"],
      tierNames: ["Stable", "生态集成", "Labs"],
      tierPromises: [
        "Monica 1.0 受支持的应用路径。",
        "围绕外部系统与 Provider 边界提供的版本化适配器。",
        "有意快速演进、晋升前可能变化的能力。",
      ],
      boundaryTitle: "成熟度不是质量排名。",
      boundaryBody: "它描述的是发布承诺。稳定包构成预期的 1.0 应用路径；集成保持显式选择；Labs 让实验开放可见，但不暗示契约稳定。",
      unpublishedTitle: "有意不发布的项目",
      unpublishedBody: "Monica.Experimental 保持为仅供 Labs 使用的工作区包。Monica.Generators.AutoController.BuildTasks 是通过公开 Generator 打包的实现细节。",
    },
    reference: {
      eyebrow: "可执行实证 / 两条入口路径",
      title: "用运行中的代码评估 Monica，而不是功能清单。",
      description: "用模板在五分钟内启动主机；需要在真实应用中检查边界、依赖与替换接缝时，再进入 Monica Ordering Reference。",
      templateLabel: "路径 01 / 新主机",
      templateTitle: "从 Monica 模板开始。",
      templateBody: "一个刻意保持精简的 .NET 10 应用，只采用 Stable 包与 OpenTelemetry。它证明启动组合与运行证据，不会预装所有模块。",
      runLabel: "运行命令",
      proofLabel: "检查界面",
      source: "查看源码",
      appLabel: "路径 02 / 架构评估",
      appTitle: "追踪 Ordering 参考应用。",
      appBody: "一个单领域、依赖链明确的模块化单体参考。沿着请求从 AppHost 进入 Ordering，再进入共享平台层。",
      architecture: "解决方案结构",
      dependency: "允许的依赖方向",
      seamTitle: "只有可替换的边界，才是可信的接缝。",
      seamBody: "参考应用使用重启后重置的内存仓储。这个限制是有意设计的：Repository 边界就是替换为真实持久化 Provider 的明确接缝。",
      endpoints: "运行时界面",
    },
    roadmap: {
      eyebrow: "发布路线图 / 证据先于日期",
      title: "当契约足够可信，1.0 才会发布。",
      description: "Monica 当前版本为 1.0.0-rc.2。路线图围绕发布证据组织，不编造日历承诺。",
      currentLabel: "当前",
      currentTitle: "1.0.0-rc.2 / RC 加固",
      currentBody: "受支持路径正在成形。GA 之前，只要简化或正确性需要，契约仍可能调整。",
      phases: [
        { marker: "01", title: "RC 加固", body: "简化公开契约、补齐架构缺口，并保持整个解决方案零警告。", state: "进行中" },
        { marker: "02", title: "发布实证", body: "让模板、参考应用、包层级与双语发布文档都可以独立验证。", state: "构建中" },
        { marker: "03", title: "1.0 GA", body: "只有构建、包、文档与可执行参考的全部门禁通过后，才发布 Stable 1.0 能力集。", state: "待门禁" },
        { marker: "04", title: "1.0 后的生态", body: "只有契约足以承担更强成熟度承诺时，才晋升集成与 Labs 能力。", state: "后续" },
      ],
      gatesTitle: "发布门禁",
      gates: [
        "整个解决方案构建零警告。",
        "模板与参考应用可通过文档命令直接运行。",
        "公开契约与 Stable 行为具备可用文档。",
        "稳定、集成与 Labs 边界和发布包保持一致。",
        "正式发布前可以复现并检查全部发布包。",
      ],
      promisesTitle: "这份路线图不承诺什么",
      promises: [
        "Labs API 不会仅因为公开可见就被视为稳定。",
        "集成 Provider 不会被强行纳入核心采用路径。",
        "不会为了保留 1.0 前契约而牺牲更清晰的设计。",
      ],
      dateNote: "目前没有宣布 GA 日期。证据负责关闭门禁。",
    },
  },
};
