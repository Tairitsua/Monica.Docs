---
title: 主机绑定的模块组合
description: 理解 Monica 的冻结模块图、生命周期、Option 边界、类型发现与启动工作。
sidebar_position: 1
---

`builder.AddMonica(monica => ...)` 为一个宿主创建一份独立的 Monica 应用上下文。模块注册、最终 Option、依赖边、类型发现计划、启动工作、运行时目录与诊断数据都归这份上下文所有；同一进程里的两个宿主不会共享可变模块注册表。

## 组合生命周期

Monica 按固定顺序完成服务组合：

1. 应用回调记录模块、Option Contribution、注册 Contribution 与宿主级策略。
2. 每个模块实例只执行一次 `Describe(ModuleDescriptor)`，声明不读取 Option 的硬依赖、可选顺序关系与必需 Feature。
3. Monica 校验模块图，移除被主动禁用的模块及其硬依赖方，拒绝依赖环和未满足的 Feature，并生成一份不可变编译图。
4. 默认 Option 与命名 Profile 按依赖优先顺序完成绑定、定稿和校验。
5. Monica 修改宿主前，每个 Active 模块只执行一次 `DeclareTypeDiscovery(...)`。Monica 丢弃没有注册项的计划，解析程序集，只枚举一次类型并计算去重后的结构查询；非空查询即使匹配到零个类型也仍会进入 Commit。
6. Monica 注册自身核心服务，再按模块图顺序串行执行 `ConfigureBuilder` 与 `ConfigureServices`。注册扩展可以在模块回调前后贡献回调，但不会改变模块图所有权。
7. Monica 到达 `BeforeTypeDiscovery` 启动工作 Barrier 后，串行提交已经编译好的类型发现匹配；随后到达 `BeforePostConfigureServices`、执行 `PostConfigureServices`、关闭工作提交，并在 `AddMonica(...)` 返回前排空 `BeforeServiceRegistrationCompletion` 工作。
8. Generic Host 到此完成组合；Web Host 还必须在同一个应用实例上通过 `UseMonica()` 应用中间件，再通过 `MapMonica()` 映射端点。

应用回调以及它返回的 `ModuleRegistration<,>` 都是记录阶段的 API，不是运行时对象。回调结束时模块图即被封闭，不要保留 Registration 并在稍后修改。

## 模块形态

每个模块由一个策略类型与一个启动阶段冻结的 Option 类型组成：

```csharp
public sealed class ModuleAnalyticsOption : ModuleOptions<ModuleAnalytics>
{
    public bool EnableDetailedMetrics { get; set; }
}

public sealed class ModuleAnalytics : MonicaModule<ModuleAnalyticsOption>
{
    public override void Describe(ModuleDescriptor module)
    {
        module.Require<ModuleLogging, ModuleLoggingOption>();
        module.AfterIfPresent<ModuleOpenTelemetry, ModuleOpenTelemetryOption>();
    }

    public override void ConfigureServices(ModuleContext<ModuleAnalyticsOption> context)
    {
        context.Services.AddSingleton<AnalyticsService>();
    }
}

public static class ModuleAnalyticsBuilderExtensions
{
    extension(IMonicaBuilder builder)
    {
        public ModuleRegistration<ModuleAnalytics, ModuleAnalyticsOption> AddAnalytics(
            Action<ModuleAnalyticsOption>? configure = null)
        {
            return builder.AddModule<ModuleAnalytics, ModuleAnalyticsOption>(configure);
        }
    }
}
```

当模块可以贡献中间件或端点、但在 Generic Host 中仍有意义时，实现 `IWebModule`；只有缺少 Web Contribution 会让模块不可用或产生误导时，才实现 `IWebHostRequiredModule`。

## 依赖、Feature 与注册 Contribution

`Describe(...)` 负责模块固有的图结构：

- `Require<TModule,TOptions>()` 包含一个硬依赖。
- `AfterIfPresent<TModule,TOptions>()` 只在目标已经存在时增加顺序关系。
- `RequireFeature(name)` 声明：某条显式注册路径满足该 Feature 之前，组合无效。

公开的 `Add*`、`Use*`、`Map*` 与 `Register*` 方法扩展 `ModuleRegistration<TModule,TOptions>`。它们可以包含或硬依赖配套模块、配置 Option 与命名 Profile、贡献生命周期回调、声明或满足 Feature，并记录 keyed service 标识。这样可选能力仍在组合根显式可见，同时不再需要单独的 Guide 对象。

注册扩展需要把回调放到模块自身生命周期回调前后时，使用 `ModuleRegistrationOrder.BeforeModule`、`AfterModule` 或 `Late`。直接服务写入应保留在 owner 模块的 `ModuleContext` 或显式注册 Contribution 中。

## 最终 Option 访问

当前模块通过受保护的 `Option` 或 `context.Options` 读取自己的最终 Option。跨模块访问会校验关系：

- `GetOptions<TModule,TOptions>()` 或 `context.Modules.Get<TModule,TOptions>()` 读取直接硬依赖模块。
- `TryGetOptions<TModule,TOptions>(out ...)` 或 `context.Modules.TryGet(...)` 读取通过 `AfterIfPresent` 声明、且当前已激活的模块。

未声明关系的读取会明确指出源模块与目标模块，而不是依赖偶然的回调顺序。模块需要运行时协作时，应使用 owner 提供的抽象或 Contribution API；不要把其他模块的 Option 当作共享可变注册表。

## 集中式类型发现

模块覆盖 `DeclareTypeDiscovery(TypeDiscoveryPlan<TOptions> discovery)`，通过 `discovery.Match(query, commit)` 声明结构查询。查询计算只做分析；Commit 接收受限的 `TypeDiscoveryContext<TOptions>`、不可变匹配结果与带索引的 `ModuleServiceRegistrationWriter`，不会拿到原始 Service Collection。

诊断时间线记录五个事实阶段：

1. `TypeDiscoveryPlanDeclaration`
2. `TypeDiscoveryAssemblyResolution`
3. `TypeDiscoveryTypeEnumeration`
4. `TypeDiscoveryQueryEvaluation`
5. `TypeDiscoveryRegistrationCommit`

只要存在至少一个非空发现计划，宿主组合期间就只枚举一次程序集与类型；重复读取诊断快照不会重新扫描。相同查询只计算一次，注册成功或失败后都会释放编译器持有的匹配引用。启动工作 Commit 保留原始阶段，不会伪装成又一次类型发现编译。

## 调度启动工作

`MonicaModule.ScheduleStartupWork(...)` 在 Monica 的有界调度器上启动隔离的同步工作。带 `commit` 参数的重载可以并发执行昂贵计算，再通过确定性的串行 Commit 应用结果。

请选择能够保护第一个消费者的最晚 Barrier：

| Barrier | 契约 |
|---|---|
| `BeforeTypeDiscovery` | 已编译的类型发现匹配提交到服务注册前必须完成。 |
| `BeforePostConfigureServices` | Post-service configuration 开始前必须完成。 |
| `BeforeServiceRegistrationCompletion` | `AddMonica(...)` 返回前必须完成；这是默认值。 |
| `BeforeHostLifecycle` | 任一 Generic Host lifecycle 参与者启动前必须完成。 |
| `NoBarrier` | 不延迟组合或主机就绪；失败只进入诊断，Monica 持有该工作直至完成或宿主释放。 |

Work Action 必须同步、确定、CPU 密集，并与宿主 Builder、`IServiceCollection`、Service Provider、模块图和共享可变状态隔离。I/O、持续运行、运行时激活与清理应使用 Hosted Service。

`MaxConcurrentStartupWorkItems` 控制调度并发度。设为 `1` 会串行化启动工作，同时保留 Barrier 语义；必需工作仍可提交时，非阻塞工作不会占用唯一执行通道。

## Web 完成边界

在同一个 `WebApplication` 上只调用一次 `UseMonica()`，随后只调用一次 `MapMonica()`。缺失、重复、顺序颠倒或跨应用实例的调用都会被拒绝。尚未完成组合的 Web Host 会在 Hosted lifecycle 参与者运行前失败。Generic Host 不调用这两个方法，并且只能包含无需 Web Adapter 也能工作的模块。

当测试需要覆盖模块图校验、最终 Option、类型发现、服务注册与宿主生命周期时，使用 `MonicaTestApplicationFactory<TDiscoveryAnchor>` 复用同一完整边界。

继续阅读 [Option 与注册扩展](./configuration-and-guide.md)了解公开配置面，阅读[核心组合](../modules/core-composition/index.md)了解宿主策略与诊断，或阅读[测试 Monica 应用](../guides/testing-monica-applications.md)了解宿主级测试模式。
