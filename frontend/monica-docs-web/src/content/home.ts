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
  proof: {
    folio: string;
    title: string;
    description: string;
    connected: string;
    request: string;
    badge: string;
    latency: string;
    units: string;
    jobs: string;
    metricNotes: readonly [string, string, string];
    note: string;
  };
  pillars: {
    folio: string;
    title: string;
    cards: readonly { title: string; body: string }[];
  };
  starter: {
    folio: string;
    title: string;
    description: string;
    steps: readonly { title: string; body: string }[];
    quickStart: string;
    copy: string;
    copied: string;
  };
  fit: {
    folio: string;
    title: string;
    description: string;
    cards: readonly { marker: string; title: string; body: string }[];
  };
  surfaces: {
    folio: string;
    title: string;
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

export const homeCopy: Record<Locale, HomeCopy> = {
  en: {
    skip: "Skip to content",
    nav: ["Product", "Proof", "Start", "Modules", "Roadmap"],
    languageLabel: "阅读中文版",
    demoLabel: "Live demo",
    heroEyebrow: "Agent-governed architecture / .NET 10",
    heroLines: [
      "Architecture agents",
      "can follow.",
      "Systems humans",
      "can inspect.",
    ],
    heroDescription:
      "Monica gives .NET teams explicit application structure, composable infrastructure modules, and runtime evidence—without hiding ASP.NET Core.",
    heroPrimary: "Build the reference app",
    heroSecondary: "Read the architecture",
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
    proof: {
      folio: "Living proof",
      title: "The architecture stays visible after startup.",
      description:
        "Registration is only the beginning. Monica exposes application structure and execution metadata as evidence your team can inspect.",
      connected: "Illustrative walkthrough",
      request: "Illustrative request",
      badge: "ILLUSTRATIVE",
      latency: "Latency",
      units: "ProjectUnits",
      jobs: "Recurring jobs",
      metricNotes: ["illustrative timing", "reference app", "reference app"],
      note: "No opaque orchestration. This walkthrough mirrors the boundaries declared by the reference source.",
    },
    pillars: {
      folio: "Product model",
      title: "One operating model, from source to production.",
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
      folio: "First run",
      title: "From empty folder to inspectable system.",
      description:
        "Start with the reference shape, then remove what you do not need. Monica modules remain explicit at every step.",
      steps: [
        { title: "Scaffold", body: "Create the reference host" },
        { title: "Compose", body: "Choose the module graph" },
        { title: "Inspect", body: "Open runtime evidence" },
      ],
      quickStart: "Open the full quick start",
      copy: "Copy",
      copied: "Copied to clipboard",
    },
    fit: {
      folio: "System fit",
      title: "Keep ASP.NET Core. Stop rebuilding the operating model.",
      description:
        "Monica sits between hand-assembled infrastructure and a platform that dictates your application. Use the framework where coherence matters; keep the runtime you already know.",
      cards: [
        {
          marker: "LOW CEREMONY",
          title: "Raw ASP.NET Core",
          body: "Maximum freedom. Your team owns conventions, dependency ordering, module discovery, operations surfaces, and the architecture handbook.",
        },
        {
          marker: "EXPLICIT COHERENCE",
          title: "A visible application model",
          body: "Opinionated boundaries and lifecycle, modular infrastructure, inspectable runtime—without replacing ASP.NET Core or your domain model.",
        },
        {
          marker: "FULL PLATFORM",
          title: "Heavyweight platform",
          body: "More prescribed capabilities and abstraction. Useful when standardization matters more than keeping the native framework close.",
        },
      ],
    },
    surfaces: {
      folio: "Runtime surfaces",
      title: "Architecture you can point at.",
      captions: [
        "Review selected capabilities from the reference host; use runtime diagnostics for the complete module graph.",
        "Inspect application behavior by kind, domain, dependencies, and convention status.",
        "Follow recurring and triggered work through schedules, outcomes, and telemetry.",
      ],
      tabs: ["Selected capabilities", "ProjectUnits", "Scheduler"],
    },
    adoption: {
      folio: "Adoption",
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
          marker: "EVALUATION",
          effort: "REALISTIC DOMAIN",
          title: "Study the reference app",
          body: "Trace an ordering workflow through commands, a repository seam, a unit of work, a local event, and a recurring job before making an architecture decision.",
          action: "Open the reference app",
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
    nav: ["产品", "实证", "开始", "模块", "路线图"],
    languageLabel: "Read in English",
    demoLabel: "在线演示",
    heroEyebrow: "智能体可治理的架构 / .NET 10",
    heroLines: ["智能体可遵循的", "应用架构。", "人类可检查的", "运行系统。"],
    heroDescription:
      "Monica 为 .NET 团队提供明确的应用结构、可组合的基础设施模块与运行时证据，同时保留熟悉的 ASP.NET Core。",
    heroPrimary: "构建参考应用",
    heroSecondary: "阅读架构设计",
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
    proof: {
      folio: "运行实证",
      title: "启动完成后，架构依然清晰可见。",
      description:
        "注册只是开始。Monica 将应用结构与执行元数据转化为团队可检查的运行证据。",
      connected: "示意架构演练",
      request: "示意请求",
      badge: "示意演练",
      latency: "延迟",
      units: "ProjectUnits",
      jobs: "周期任务",
      metricNotes: ["示意时序", "参考应用", "参考应用"],
      note: "没有不透明的编排层。这段演练忠实映射参考应用源码中声明的边界。",
    },
    pillars: {
      folio: "产品模型",
      title: "从源码到生产，使用同一套运行模型。",
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
      folio: "首次运行",
      title: "从空文件夹到可检查的系统。",
      description:
        "先采用参考架构，再删去不需要的部分。每一步中，Monica 模块都保持明确可见。",
      steps: [
        { title: "创建", body: "生成参考主机" },
        { title: "组合", body: "选择模块图" },
        { title: "检查", body: "打开运行时证据" },
      ],
      quickStart: "打开完整快速开始",
      copy: "复制",
      copied: "已复制到剪贴板",
    },
    fit: {
      folio: "系统定位",
      title: "保留 ASP.NET Core，不再重复搭建运行模型。",
      description:
        "Monica 位于手工拼装的基础设施与支配应用设计的平台之间。在需要一致性的地方采用框架，同时保留你熟悉的运行时。",
      cards: [
        {
          marker: "低约束",
          title: "原生 ASP.NET Core",
          body: "自由度最高。团队自行维护约定、依赖顺序、模块发现、运维界面与架构手册。",
        },
        {
          marker: "明确一致性",
          title: "可见的应用模型",
          body: "明确的边界与生命周期、模块化基础设施、可检查的运行时，同时不替代 ASP.NET Core 与你的领域模型。",
        },
        {
          marker: "完整平台",
          title: "重量级平台",
          body: "能力与抽象更加完整且固定。当标准化比贴近原生框架更重要时，这类平台更合适。",
        },
      ],
    },
    surfaces: {
      folio: "运行时界面",
      title: "可以指给团队看的架构。",
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
          marker: "架构评估",
          effort: "真实领域",
          title: "研究参考应用",
          body: "沿着命令、仓储接缝、工作单元、本地事件与周期任务追踪 Ordering 工作流，再做架构选择。",
          action: "打开参考应用",
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
