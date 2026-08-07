---
title: 核心组合
description: 组合、校验、观测并启动一份宿主拥有的 Monica 模块图。
sidebar_position: 1
---

`Monica.Core` 提供所有 Monica 应用共享的组合边界。一次 `AddMonica(...)` 回调会为一个宿主记录应用身份、模块系统策略、类型发现范围、模块、Option、依赖关系与显式 Feature 选择。宿主构建 Service Provider 前，Monica 会完成模块图校验与封闭。

## 安装与组合

```bash
dotnet add package Monica.Core --prerelease
```

```csharp
using Monica.Core;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.AppId = "orders";
        options.AppName = "Orders";
    });

    monica.ConfigureModuleSystem(options =>
    {
        options.DefaultApiGroupName = "Orders";
        options.EnableSummaryLog = true;
    });

    monica.AddMediator();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`UseMonica()` 应用模块中间件，`MapMonica()` 映射模块拥有的端点。Web Host 必须在同一个应用实例上按此顺序各调用一次。Generic Host 不调用这两个方法，并且只能注册无需 Web Adapter 也能工作的模块。

## 共享配置

| 入口 | 用途 | 重要默认值 |
|---|---|---|
| `ConfigureApplication(...)` | 设置 `ProjectName`、`AppId`、`AppName`、`AppVersion` 与 `DomainName` 回退值。 | 尽可能从入口程序集推断项目名与版本。 |
| `ConfigureModuleSystem(...)` | 控制启动调度、日志、端点默认值、诊断披露与可选性能预算。 | 注册错误阻止启动；除非模块主动启用，否则 Minimal API 默认关闭。 |
| `ConfigureTypeDiscovery(...)` | 替换结构化类型发现使用的程序集包含/排除策略。 | 默认包含项目程序集。 |

### 模块系统 Option

| Option | 默认值 | 用途 |
|---|---|---|
| `MaxConcurrentStartupWorkItems` | `Math.Max(1, Environment.ProcessorCount)` | 限制启动工作并发度，但不会让模块回调并发执行。 |
| `StartupPerformanceBudgets` | `null` | 为实测启动耗时增加显式告警阈值。未配置的指标没有隐含分数或阈值。 |
| `DefaultLogLevel` | `Information` | 设置模块注册日志的默认级别。 |
| `EnableSummaryLog` | `false` | 初始化后输出事实型组合摘要。 |
| `DefaultApiGroupName` | `null` | 为端点模块提供 API 分组回退值。 |
| `EnableMinimalApiByDefault` | `false` | 提供宿主默认值；单个模块 Option 仍可覆盖。 |
| `MonicaEndpointPort` | `null` | 配置后把 Monica 自有端点限制到一个本地端口。 |
| `AutoAddMonicaHttpListener` | `true` | 配置 Monica 端口后，为常见单进程宿主追加匹配的 HTTP Listener。 |
| `MonicaEndpointHost` | 自动推导 | 覆盖自动追加 Listener 使用的 Host。 |
| `OptionDiagnosticsExposureMode` | `Redacted` | 展示有界普通 Option 值并保护敏感值；`RevealSensitive` 仅允许在 Development 中使用。 |

各项性能预算独立且默认关闭：

```csharp
monica.ConfigureModuleSystem(options =>
{
    options.StartupPerformanceBudgets = new ModuleStartupPerformanceBudgets
    {
        TotalComposition = TimeSpan.FromSeconds(2),
        ServiceRegistration = TimeSpan.FromSeconds(1),
        TypeDiscovery = TimeSpan.FromMilliseconds(500),
        AggregateBarrierWait = TimeSpan.FromMilliseconds(250),
        LongestModuleCallback = TimeSpan.FromMilliseconds(100),
        LongestStartupQueue = TimeSpan.FromMilliseconds(100)
    };
});
```

超过已配置预算会生成 Warning Finding，并给出 Actual、Limit 与 Utilization。没有配置预算时，Monica 只报告测量事实，不会虚构“健康分”。

## 不可变诊断 Facade

宿主或 UI 需要查看模块系统时，加入诊断模块：

```csharp
builder.AddMonica(monica =>
{
    monica.AddModuleSystem();
});
```

在宿主/UI 边界注入 `ModuleDiagnosticsFacade`。它提供同步、只读的 `Res<T>` 方法：

| 方法 | 结果 |
|---|---|
| `GetSnapshot()` | 版本化不可变快照，包含组合标识、修订、结果、耗时、Span、类型发现指标、模块、直接依赖边、阻塞链与结构化 Finding。 |
| `GetAssemblyInventory()` | 单独延迟加载并缓存的扫描成功、排除、解析失败与部分类型加载清单。 |
| `GetModuleOptions(moduleKey)` | 模块最终默认 Option 的完整公开属性目录与有界投影。 |
| `GetModuleOptions(moduleKey, selector)` | 指定命名 Profile 的同类目录，并显式定义回退行为。 |
| `CreateExport()` | 供客户端自行比较的可移植脱敏基线。 |

Registry、Profiler 与启动调度器状态会先被一致捕获，再在短锁之外完成投影。快照按 Revision 缓存；启动进入最终状态后，重复调用会返回同一个快照实例。

可移植导出绝不包含 Option 诊断、程序集路径、Stack Trace 或原始异常细节。消费方根据稳定 Finding Code 与参数负责本地化显示文本。

## Option 诊断与敏感值

每个公开、非索引 Option 属性都会保留名称与干净类型。普通标量、对象组与集合样本都有边界；Getter 失败或不支持的运行时形状仍以元数据存在，不会破坏整份快照。

敏感值默认只显示存在性。可在 Option 类型上标记：

```csharp
using Monica.Core.Modularity.Diagnostics.Annotations;

[ModuleOptionDiagnosticsSensitive]
public string? ApiToken { get; set; }
```

宿主也可以在不修改 Option 类型的情况下增加敏感规则：

```csharp
monica.AddModuleSystem(options =>
{
    options.ConfigureModuleOptionDiagnostics<ModulePayments, ModulePaymentsOption>(policy =>
        policy.MarkSensitive(static value => value.Provider.ApiSecret));
});
```

只有专用本地调试才应把 `OptionDiagnosticsExposureMode` 设为 `RevealSensitive`。Monica 会在非 `Development` 环境拒绝该模式；可见标量仍受长度限制，导出仍完全省略 Option 数据。

## 类型发现诊断

模块只通过 `DeclareTypeDiscovery(...)` 声明一次结构查询。Monica 分别报告计划声明、程序集解析、类型枚举、去重查询计算与注册 Commit 五个阶段，并记录程序集、类型、排除、计划、查询、匹配、回调以及索引化 Service Writer 的 Add/Replace/Skip 数量。

程序集清单只有在排查类型发现时才延迟加载。主快照保留阶段汇总与查询摘要，不会长期持有编译器的匹配数组。

## OpenTelemetry 指标

订阅 Meter `Monica.Core.Modularity`。最终耗时使用 Histogram，只有实时数量使用 Observable Gauge：

- `monica.module.composition.duration`
- `monica.module.service_registration.duration`
- `monica.module.type_discovery.duration`
- `monica.module.barrier_wait.duration`
- `monica.module.callback.duration`
- `monica.module.startup_work.duration`
- `monica.module.live.count`

Tag 只使用 Result、Callback Kind、Phase 与 Measurement Kind 等稳定低基数值。回调耗时与启动工作的执行/排队耗时保持独立。

继续阅读[主机绑定的模块组合](../../concepts/module-pattern.md)了解模块编写与生命周期约束，或阅读[模块诊断工作台](../../scenarios/diagnostics-and-ops.md)了解交互界面与访问边界。
