export type Locale = "en" | "zh-CN";

type HomeCopy = {
  skip: string;
  nav: readonly [string, string, string, string, string];
  languageLabel: string;
  demoLabel: string;
  heroEyebrow: string;
  heroLines: readonly [string, string, string, string];
  heroDescription: string;
  heroPrimary: string;
  heroSecondary: string;
  facts: readonly string[];
  trace: {
    label: string;
    scenarios: readonly [string, string, string];
    instruction: string;
    composition: string;
    runtime: string;
    completed: string;
    replay: string;
  };
  outcomes: {
    folio: string;
    title: string;
    description: string;
    cards: readonly { title: string; body: string }[];
  };
  starter: {
    folio: string;
    title: string;
    description: string;
    steps: readonly { title: string; body: string }[];
    quickStart: string;
    modeLabel: string;
    modes: readonly [string, string];
    beforeTitle: string;
    beforeItems: readonly [string, string, string, string];
    promptAction: string;
    promptContext: string;
    verifiedLabel: string;
    verifiedDescription: string;
    capabilitiesTitle: string;
    capabilitiesDescription: string;
    capabilities: readonly [string, string, string, string, string];
    fullPrompt: string;
    manualLabel: string;
    manualTabs: readonly [string, string];
    genericFallback: string;
    genericFallbackDescription: string;
    localDevelopment: string;
    windowKicker: string;
    copy: string;
    copied: string;
    copyFailed: string;
    selectManually: string;
  };
  how: {
    folio: string;
    title: string;
    description: string;
    flowLabel: string;
    steps: readonly [
      { label: string; title: string; body: string },
      { label: string; title: string; body: string },
      { label: string; title: string; body: string },
      { label: string; title: string; body: string },
    ];
    note: string;
    surfacesTitle: string;
    captions: readonly [string, string, string];
    tabs: readonly [string, string, string];
  };
  adoption: {
    folio: string;
    title: string;
    cards: readonly {
      marker: string;
      effort: string;
      title: string;
      body: string;
      action: string;
    }[];
  };
  modules: {
    folio: string;
    title: string;
    description: string;
    tiers: readonly [string, string, string];
    tierDescriptions: readonly [string, string, string];
    visible: string;
    catalog: string;
  };
  trust: {
    folio: string;
    title: string;
    description: string;
    github: string;
    roadmap: string;
    ledger: readonly string[];
  };
  footer: {
    statement: string;
    learn: string;
    project: string;
    closing: readonly [string, string];
  };
};

export type StarterCopy = HomeCopy["starter"];

export const homeCopy: Record<Locale, HomeCopy> = {
  en: {
    skip: "Skip to content",
    nav: ["Quick start", "Concepts", "Skills", "Example", "Docs"],
    languageLabel: "阅读中文版",
    demoLabel: "Live demo",
    heroEyebrow: ".NET 10 framework · built for coding agents and teams",
    heroLines: [
      "Build .NET apps",
      "with coding agents.",
      "Compose infrastructure.",
      "See the running system.",
    ],
    heroDescription:
      "Monica gives coding agents a clear map of your .NET application: ProjectUnit conventions, composable infrastructure, and a runtime you can inspect together.",
    heroPrimary: "Start with Monica",
    heroSecondary: "Explore Agent Skills",
    facts: [
      "Builder-scoped composition",
      "Explicit package maturity",
      "Observable by design",
    ],
    trace: {
      label: "Interactive architecture walkthrough · illustrative",
      scenarios: ["Create order", "Approve order", "Backlog report"],
      instruction: "Instruction",
      composition: "Module composition",
      runtime: "Runtime evidence",
      completed: "completed",
      replay: "Replay walkthrough",
    },
    outcomes: {
      folio: "Why Monica",
      title: "Structure where teams need it. Native .NET where they do not.",
      description: "Monica aligns source structure, infrastructure composition, and runtime evidence without introducing a separate application platform.",
      cards: [
        {
          title: "Structure",
          body: "ProjectUnits give application behavior explicit names, placement, and ownership—clear enough for humans and coding agents to navigate.",
        },
        {
          title: "Compose",
          body: "Declare a host-bound module graph with clear dependencies, configuration, providers, and ordered lifecycle phases.",
        },
        {
          title: "Inspect",
          body: "See modules, ProjectUnits, scheduled work, configuration, health, and OpenTelemetry evidence in one runtime language.",
        },
      ],
    },
    starter: {
      folio: "Agent-first quick start",
      title: "Start with an agent or stay fully manual.",
      description:
        "Monica Guide is a global toolbox for exploring, configuring, and diagnosing Monica. Install it before you choose a repository or development path, then let Guide explain the available next steps.",
      steps: [
        { title: "Copy", body: "Copy one universal Guide instruction" },
        { title: "Install", body: "Let your agent install and discover Guide" },
        { title: "Choose", body: "Review the toolbox, then choose what comes next" },
      ],
      quickStart: "Open the full quick start",
      modeLabel: "Quick start mode",
      modes: ["Agent setup", "Manual .NET"],
      beforeTitle: "Before you start",
      beforeItems: [
        "Use any coding agent that supports Agent Skills. You do not need a repository yet.",
        "Paste the copied instruction into agent chat—not into a terminal.",
        "The instruction has your agent download the platform-matched Monica Guide release, verify it against SHA256SUMS, and install Monica skills into your current project.",
        "Guide explains its toolbox and waits before initializing, binding source, or changing files.",
      ],
      promptAction: "Copy Monica Guide instruction",
      promptContext: "One prompt · no repository or profile required",
      verifiedLabel: "Release-verified hosts",
      verifiedDescription: "The same instruction also works with other Agent Skills-compatible coding agents.",
      capabilitiesTitle: "What Monica Guide can help with",
      capabilitiesDescription: "Guide reports the current global setup first, then asks what you want instead of forcing an initialization path.",
      capabilities: [
        "Explore Monica and choose a development path",
        "Initialize or configure a repository when you are ready",
        "Bind exact Monica framework source for read-only lookup",
        "Check status, diagnose drift, and update Monica skills",
        "Prepare framework, documentation, or upstream contributions safely",
      ],
      fullPrompt: "View the full instruction",
      manualLabel: "Manual .NET setup",
      manualTabs: ["CLI", "Program.cs"],
      genericFallback: "Manual terminal fallback",
      genericFallbackDescription: "Use this in a terminal only when your coding agent cannot run the installation itself. First download the Monica Guide release asset for your platform (win-x64, linux-x64, or osx-arm64) and verify it against SHA256SUMS, then preview and apply the workspace configuration with the guide executable.",
      localDevelopment: "Local-development prompt preview — public builds require a verified immutable Monica ref.",
      windowKicker: "MONICA / INSTALL ONCE, CHOOSE LATER",
      copy: "Copy",
      copied: "Copied to clipboard",
      copyFailed: "Clipboard access failed. The instruction is selected below so you can copy it manually.",
      selectManually: "Select and copy this instruction manually",
    },
    how: {
      folio: "How Monica works",
      title: "A request stays traceable from intent to runtime evidence.",
      description:
        "This illustrative order flow mirrors the boundaries in the reference application. It explains the model; it does not claim production benchmark data.",
      flowLabel: "Illustrative order request flow",
      steps: [
        { label: "01 / REQUEST", title: "HTTP intent enters ASP.NET Core", body: "The request contract owns its endpoint metadata and remains familiar .NET code." },
        { label: "02 / BEHAVIOR", title: "A ProjectUnit owns the use case", body: "The application behavior has an explicit name, location, lifetime, and dependency surface." },
        { label: "03 / COMPOSITION", title: "Modules provide infrastructure", body: "Repository, unit of work, events, scheduling, and telemetry compose through the host." },
        { label: "04 / EVIDENCE", title: "The runtime exposes the same model", body: "Diagnostics describe modules, ProjectUnits, work, health, and telemetry with shared vocabulary." },
      ],
      note: "The maintained reference application is the evidence source; timings shown in interactive walkthroughs are illustrative only.",
      surfacesTitle: "Inspect the model from the running host",
      captions: [
        "Review selected capabilities from the reference host; use runtime diagnostics for the complete module graph.",
        "Inspect application behavior by kind, domain, dependencies, and convention status.",
        "Follow recurring and triggered work through schedules, outcomes, and telemetry.",
      ],
      tabs: ["Selected capabilities", "ProjectUnits", "Scheduler"],
    },
    adoption: {
      folio: "Adoption paths",
      title: "Choose the smallest credible first step.",
      cards: [
        {
          marker: "GREENFIELD",
          effort: "~ 5 MIN",
          title: "Start a new service",
          body: "Use the template to get host-bound composition, health, and Prometheus telemetry in one inspectable host.",
          action: "Use the template",
        },
        {
          marker: "EXISTING APP",
          effort: "MODULE BY MODULE",
          title: "Adopt one boundary",
          body: "Begin with configuration, scheduling, or telemetry. Add ProjectUnit conventions when the team is ready to standardize behavior.",
          action: "Browse stable modules",
        },
        {
          marker: "EXTENSION",
          effort: "REUSABLE PACKAGE",
          title: "Build a Monica extension",
          body: "Use exact framework source to design a module or provider while generated projects continue consuming Monica through NuGet.",
          action: "Open extension guidance",
        },
      ],
    },
    modules: {
      folio: "Module catalog",
      title: "Maturity is part of the API.",
      description:
        "A supported Stable set anchors the 1.0 path. Integrations connect the ecosystem. Labs stay visible without pretending to carry the same release promise.",
      tiers: ["Stable", "Integrations", "Labs"],
      tierDescriptions: [
        "Release-gated packages with documented contracts, clean public surfaces, and production-oriented examples.",
        "Provider packages that connect Monica boundaries to the wider .NET and distributed-systems ecosystem.",
        "Visible experiments with preview contracts. Useful for exploration, deliberately outside the stable release promise.",
      ],
      visible: "packages visible",
      catalog: "Open the complete module catalog",
    },
    trust: {
      folio: "Release trust",
      title: "Trust is a build artifact.",
      description:
        "The public launch is gated by executable examples, explicit maturity, clean builds, documented contracts, and an architecture that can explain itself.",
      github: "View on GitHub",
      roadmap: "Read the 1.0 roadmap",
      ledger: [
        "Current runtime baseline",
        "Whole-solution quality gate",
        "Clear open-source license",
        "Launch-critical bilingual docs",
        "Realistic architecture proof",
      ],
    },
    footer: {
      statement:
        "Observable application architecture for .NET teams and the agents working beside them.",
      learn: "LEARN",
      project: "PROJECT",
      closing: [
        "ARCHITECTURE AGENTS CAN FOLLOW.",
        "SYSTEMS HUMANS CAN INSPECT.",
      ],
    },
  },
  "zh-CN": {
    skip: "跳转到正文",
    nav: ["快速开始", "核心概念", "技能", "示例", "文档"],
    languageLabel: "Read in English",
    demoLabel: "在线演示",
    heroEyebrow: ".NET 10 框架 · 为 Coding Agent 和团队而设计",
    heroLines: ["让 Coding Agent", "理解你的应用。", "让基础设施自由组合。", "让运行系统清晰可见。"],
    heroDescription:
      "Monica 为 Coding Agent 提供清晰的 .NET 应用地图：ProjectUnit 约定、可组合的基础设施，以及可共同检查的运行时。",
    heroPrimary: "开始使用 Monica",
    heroSecondary: "浏览 Agent Skills",
    facts: ["Builder 作用域组合", "明确的包成熟度", "可观测性内建"],
    trace: {
      label: "交互式架构演练 · 示意",
      scenarios: ["创建订单", "批准订单", "积压报告"],
      instruction: "业务指令",
      composition: "模块组合",
      runtime: "运行时证据",
      completed: "已完成",
      replay: "重放演练",
    },
    outcomes: {
      folio: "为什么选择 Monica",
      title: "需要一致性的地方有结构，其余地方仍是原生 .NET。",
      description: "Monica 统一源码结构、基础设施组合与运行时证据，但不会引入一套独立的应用平台。",
      cards: [
        {
          title: "结构化",
          body: "ProjectUnit 为应用行为赋予明确的名称、位置与归属，让开发者和编码智能体都能可靠导航。",
        },
        {
          title: "可组合",
          body: "声明绑定到当前主机的模块图，明确依赖、配置、Provider 与有序生命周期。",
        },
        {
          title: "可检查",
          body: "用统一的运行时语言查看模块、ProjectUnit、计划任务、配置、健康度与 OpenTelemetry 证据。",
        },
      ],
    },
    starter: {
      folio: "Agent-first 快速开始",
      title: "可以从编码 Agent 开始，也可以完全手动。",
      description:
        "Monica Guide 是用来了解、配置和诊断 Monica 的全局工具箱。你可以在选定仓库或开发路线之前安装它，再让 Guide 解释后续选项。",
      steps: [
        { title: "复制", body: "复制一条通用 Guide 指令" },
        { title: "安装", body: "让 Agent 安装并发现 Guide" },
        { title: "选择", body: "先了解工具箱，再决定下一步" },
      ],
      quickStart: "打开完整快速开始",
      modeLabel: "快速开始模式",
      modes: ["Agent 设置", "手动 .NET"],
      beforeTitle: "开始之前",
      beforeItems: [
        "使用任意支持 Agent Skills 的编码 Agent；现在还不需要仓库。",
        "把复制的指令粘贴到 Agent 对话中，而不是终端。",
        "这条指令会让 Agent 下载与当前平台匹配的 Monica Guide 发布资产，对照 SHA256SUMS 校验，并把 Monica Skills 安装进当前项目。",
        "Guide 会先解释工具箱，在初始化、绑定源码或修改文件前等待你选择。",
      ],
      promptAction: "复制 Monica Guide 指令",
      promptContext: "一条指令 · 无需仓库或 Profile",
      verifiedLabel: "已验证宿主",
      verifiedDescription: "同一条指令也可用于其他兼容 Agent Skills 的编码 Agent。",
      capabilitiesTitle: "Monica Guide 可以做什么",
      capabilitiesDescription: "Guide 会先报告当前全局设置，再询问你的意图，不会强制进入初始化路线。",
      capabilities: [
        "了解 Monica 并选择开发路线",
        "准备好后再初始化或配置仓库",
        "绑定精确版本的 Monica 框架源码，用于只读查找",
        "查看状态、诊断漂移并更新 Monica Skills",
        "安全准备框架、文档或上游贡献",
      ],
      fullPrompt: "查看完整指令",
      manualLabel: "手动 .NET 设置",
      manualTabs: ["CLI", "Program.cs"],
      genericFallback: "手动终端备用方案",
      genericFallbackDescription: "只有当编码 Agent 无法自行完成安装时，才在终端使用。先下载与你的平台匹配的 Monica Guide 发布资产（win-x64、linux-x64 或 osx-arm64）并对照 SHA256SUMS 校验，再用 Guide 可执行文件预览并应用工作区配置。",
      localDevelopment: "本地开发 Prompt 预览——公开构建必须使用已验证的不可变 Monica ref。",
      windowKicker: "MONICA / 安装一次，稍后选择",
      copy: "复制",
      copied: "已复制到剪贴板",
      copyFailed: "无法访问剪贴板。下面的指令已被选中，你可以手动复制。",
      selectManually: "手动选择并复制这段指令",
    },
    how: {
      folio: "Monica 如何工作",
      title: "从业务意图到运行证据，一条请求始终可以追踪。",
      description:
        "这段订单流程映射参考应用中的真实边界，用于解释模型，不代表生产性能基准。",
      flowLabel: "订单请求示意流程",
      steps: [
        { label: "01 / 请求", title: "HTTP 意图进入 ASP.NET Core", body: "请求契约持有端点元数据，仍然是熟悉的 .NET 代码。" },
        { label: "02 / 行为", title: "ProjectUnit 承担用例", body: "应用行为具有明确的名称、位置、生命周期与依赖面。" },
        { label: "03 / 组合", title: "模块提供基础设施", body: "仓储、工作单元、事件、调度与遥测通过宿主进行组合。" },
        { label: "04 / 证据", title: "运行时暴露同一模型", body: "诊断界面使用共同语言描述模块、ProjectUnit、任务、健康度与遥测。" },
      ],
      note: "持续维护的参考应用是证据来源；交互演练中的时间数据仅为示意。",
      surfacesTitle: "从运行主机检查应用模型",
      captions: [
        "查看参考主机中的能力选摘；完整模块图以运行时诊断结果为准。",
        "按类型、领域、依赖与约定状态检查应用行为。",
        "沿着计划、结果与遥测追踪循环任务和触发任务。",
      ],
      tabs: ["能力选摘", "ProjectUnits", "任务调度"],
    },
    adoption: {
      folio: "采用路径",
      title: "选择最小但可信的第一步。",
      cards: [
        {
          marker: "新项目",
          effort: "约 5 分钟",
          title: "创建新服务",
          body: "通过模板一次获得主机绑定组合、健康检查与 Prometheus 遥测，并在同一主机中检查它们。",
          action: "使用模板",
        },
        {
          marker: "现有应用",
          effort: "逐模块采用",
          title: "先采用一个边界",
          body: "从配置、调度或遥测开始；当团队准备统一应用行为时，再引入 ProjectUnit 约定。",
          action: "浏览稳定模块",
        },
        {
          marker: "扩展开发",
          effort: "可复用包",
          title: "构建 Monica 扩展",
          body: "使用精确框架源码设计模块或 Provider，同时让生成项目继续通过 NuGet 使用 Monica。",
          action: "打开扩展开发指引",
        },
      ],
    },
    modules: {
      folio: "模块目录",
      title: "成熟度也是 API 的一部分。",
      description:
        "受支持的 Stable 能力构成 1.0 主路径，集成层连接生态，Labs 保持开放探索但不伪装成同等发布承诺。",
      tiers: ["Stable", "生态集成", "实验室"],
      tierDescriptions: [
        "经过发布门禁的包，具备已记录的契约、干净的公开面与面向生产的示例。",
        "将 Monica 边界连接到 .NET 与分布式系统生态的 Provider 包。",
        "使用预览契约开放探索，但明确不属于稳定版本承诺。",
      ],
      visible: "个包可见",
      catalog: "打开完整模块目录",
    },
    trust: {
      folio: "发布可信度",
      title: "信任是构建产物。",
      description:
        "公开发布由可执行示例、明确成熟度、干净构建、已记录契约，以及能够自我解释的架构共同把关。",
      github: "在 GitHub 查看",
      roadmap: "阅读 1.0 路线图",
      ledger: [
        "当前运行时基线",
        "整个解决方案的质量门禁",
        "清晰的开源许可证",
        "发布关键内容中英双语",
        "真实架构实证",
      ],
    },
    footer: {
      statement: "为 .NET 团队及其协作智能体打造的可观测应用架构。",
      learn: "学习",
      project: "项目",
      closing: ["智能体可遵循的架构。", "人类可检查的系统。"],
    },
  },
};

export type TraceScenario = {
  id: "create-order" | "approve-order" | "backlog-report";
  instruction: Record<Locale, string>;
  endpoint: string;
  unit: string;
  unitMeta: string;
  modules: readonly string[];
  latency: string;
  spans: string;
  traceId: string;
  footnote: Record<Locale, string>;
};

export const traceScenarios: readonly TraceScenario[] = [
  {
    id: "create-order",
    instruction: { en: "“Create order MON-1003”", "zh-CN": "“创建订单 MON-1003”" },
    endpoint: "POST /api/v1/Ordering/orders",
    unit: "CommandHandlerCreateOrder",
    unitMeta: "ApplicationService · transient",
    modules: ["WebApi", "ProjectUnits", "UnitOfWork", "Repository", "OpenTelemetry"],
    latency: "example",
    spans: "illustrative steps",
    traceId: "reference source",
    footnote: { en: "Validated entity · repository seam", "zh-CN": "实体校验 · 仓储边界" },
  },
  {
    id: "approve-order",
    instruction: { en: "“Approve a draft order”", "zh-CN": "“批准草稿订单”" },
    endpoint: "POST /api/v1/Ordering/orders/approve",
    unit: "CommandHandlerApproveOrder",
    unitMeta: "ApplicationService · transient",
    modules: ["UnitOfWork", "Repository", "EventBus", "ProjectUnits", "OpenTelemetry"],
    latency: "example",
    spans: "illustrative steps",
    traceId: "reference source",
    footnote: { en: "Post-commit local event", "zh-CN": "提交后本地事件" },
  },
  {
    id: "backlog-report",
    instruction: { en: "“Report the draft-order backlog”", "zh-CN": "“汇报草稿订单积压”" },
    endpoint: "cron 0 * * * * *",
    unit: "WorkerOrderBacklogReport",
    unitMeta: "RecurringJob · transient",
    modules: ["JobScheduler", "Repository", "Configuration", "ProjectUnits", "OpenTelemetry"],
    latency: "scheduled",
    spans: "scheduled execution",
    traceId: "reference source",
    footnote: { en: "One-minute recurring job", "zh-CN": "每分钟循环任务" },
  },
];

export type ModuleTier = "stable" | "integration" | "labs";

export const packages: readonly {
  tier: ModuleTier;
  prefix: string;
  name: string;
  description: Record<Locale, string>;
  role: string;
}[] = [
  { tier: "stable", prefix: "MONICA.", name: "Core", description: { en: "Host-scoped composition, module lifecycle, results, and application identity.", "zh-CN": "主机作用域组合、模块生命周期、结果类型与应用身份。" }, role: "FOUNDATION" },
  { tier: "stable", prefix: "MONICA.", name: "ProjectUnits", description: { en: "Explicit application behavior, conventions, discovery, and runtime indexing.", "zh-CN": "明确的应用行为、约定、发现机制与运行时索引。" }, role: "STRUCTURE" },
  { tier: "stable", prefix: "MONICA.", name: "UI Runtime", description: { en: "Shared operational shell and inspectable framework surfaces.", "zh-CN": "共享运维外壳与可检查的框架界面。" }, role: "OPERATIONS" },
  { tier: "stable", prefix: "MONICA.", name: "WebApi", description: { en: "API conventions and automatic controller generation for public contracts.", "zh-CN": "面向公开契约的 API 约定与自动控制器生成。" }, role: "DELIVERY" },
  { tier: "stable", prefix: "MONICA.", name: "Configuration", description: { en: "Layered application configuration with pluggable persistence.", "zh-CN": "支持可插拔持久化的分层应用配置。" }, role: "STATE" },
  { tier: "stable", prefix: "MONICA.", name: "Repository / UoW", description: { en: "Persistence boundaries, repositories, and coherent transactions.", "zh-CN": "持久化边界、仓储与一致事务。" }, role: "PERSISTENCE" },
  { tier: "stable", prefix: "MONICA.", name: "JobScheduler", description: { en: "Recurring and triggered work with inspectable execution metadata.", "zh-CN": "带可检查执行元数据的循环与触发任务。" }, role: "EXECUTION" },
  { tier: "stable", prefix: "MONICA.", name: "OpenTelemetry", description: { en: "Metrics, traces, and health aligned with Monica’s application model.", "zh-CN": "与 Monica 应用模型对齐的指标、链路与健康状态。" }, role: "EVIDENCE" },
  { tier: "integration", prefix: "MONICA.", name: "EF Core", description: { en: "Entity Framework Core persistence adapters and transaction integration.", "zh-CN": "Entity Framework Core 持久化适配与事务集成。" }, role: "INTEGRATION" },
  { tier: "integration", prefix: "MONICA.", name: "Kafka", description: { en: "Event transport for durable cross-service collaboration.", "zh-CN": "用于可靠跨服务协作的事件传输。" }, role: "INTEGRATION" },
  { tier: "integration", prefix: "MONICA.", name: "Redis", description: { en: "Distributed cache and state adapters behind explicit contracts.", "zh-CN": "位于明确契约之后的分布式缓存与状态适配。" }, role: "INTEGRATION" },
  { tier: "integration", prefix: "MONICA.", name: "Dapr", description: { en: "Dapr-backed infrastructure providers for distributed hosts.", "zh-CN": "面向分布式主机的 Dapr 基础设施 Provider。" }, role: "INTEGRATION" },
  { tier: "integration", prefix: "MONICA.", name: "SignalR", description: { en: "Real-time delivery and client coordination for ASP.NET Core.", "zh-CN": "面向 ASP.NET Core 的实时投递与客户端协调。" }, role: "INTEGRATION" },
  { tier: "labs", prefix: "MONICA.LABS.", name: "AI", description: { en: "Agent runtime exploration with durable conversation and tool boundaries.", "zh-CN": "探索具备持久会话与工具边界的智能体运行时。" }, role: "PREVIEW" },
  { tier: "labs", prefix: "MONICA.LABS.", name: "RAG", description: { en: "Retrieval workflows and knowledge-source experimentation.", "zh-CN": "检索工作流与知识源实验。" }, role: "PREVIEW" },
  { tier: "labs", prefix: "MONICA.LABS.", name: "MCP", description: { en: "Model Context Protocol tools, resources, and transport exploration.", "zh-CN": "Model Context Protocol 工具、资源与传输探索。" }, role: "PREVIEW" },
  { tier: "labs", prefix: "MONICA.LABS.", name: "DataChannel", description: { en: "Experimental channels for flowing structured runtime data.", "zh-CN": "用于传递结构化运行时数据的实验通道。" }, role: "PREVIEW" },
  { tier: "labs", prefix: "MONICA.LABS.", name: "DevTools", description: { en: "Profiling, diagnostics, and development-only runtime experiments.", "zh-CN": "性能分析、诊断与仅用于开发期的运行时实验。" }, role: "PREVIEW" },
];
