---
title: 核心组合
description: 组合、校验并启动宿主拥有的 Monica 模块图。
sidebar_position: 1
---

`Monica.Core` 提供所有 Monica 应用共享的宿主边界。一次 `AddMonica(...)` 调用会为一个宿主记录模块、应用身份、类型发现范围与模块系统策略。模块图会在 `Build()` 返回 Service Provider 前完成校验与封闭。

## 安装与组合

```bash
dotnet add package Monica.Core --prerelease
```

```csharp
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

`UseMonica()` 围绕路由安装模块中间件，`MapMonica()` 映射模块拥有的端点。非 Web 宿主只调用 `AddMonica(...)`，并且只注册支持非 Web 运行的模块。

组合会在宿主特定的边界完成：

- 对两种宿主，Monica 都会在每个已声明的组合工作 Deadline 等待，并在 `AddMonica(...)` 返回前排空全部剩余工作项。任一工作项失败都会在 `Build()` 前中止组合。
- Generic Host 在 `AddMonica(...)` 完成服务注册与全部调度的组合工作后结束组合，不调用 `UseMonica()` 或 `MapMonica()`。
- Web Host 只有在同一个 `WebApplication` 实例上依次调用一次 `UseMonica()` 和一次 `MapMonica()` 后才完成组合。
- 未完整组合的 Web Host 会在 Hosted lifecycle 服务开始运行前校验失败。

调度组合工作不会改变模块回调的串行顺序。模块可以通过 `ModuleBase.ScheduleCompositionWork(...)` 启动隔离的 CPU 密集型工作，并声明 Monica 最晚必须等待该工作的组合检查点。Deadline 不是超时设置，任何工作项都不能晚于 `AddMonica(...)` 结束。这些校验使中间件与端点注册成为 Web 组合的一部分，而不是可能在运行时激活后才失败的可选工作。

`Monica.Core` 还拥有 [Execution Pipeline](../execution-pipeline/index.md)。Mediator、MVC、EventBus、作业、Seeder 与 Hosted work-item 适配器通过这个共享类型化内核执行；应用类型不会仅仅因为是 ProjectUnit 就被拦截。完整边界与事务矩阵见[执行边界](../../concepts/execution-boundaries.md)。

## 共享配置

| 入口 | 用途 | 重要默认值 |
|---|---|---|
| `ConfigureApplication(...)` | 设置 `ProjectName`、`AppId`、`AppName`、`AppVersion` 与 `DomainName` 的回退值。 | 能够推断时，从入口程序集获取 `ProjectName` 与版本。 |
| `ConfigureModuleSystem(...)` | 控制注册失败、摘要日志、默认 API 分组、Minimal API 默认值与可选的 Monica 专用监听器。 | 注册错误会阻止启动；除非模块主动启用，否则默认禁用 Minimal API。 |
| `ConfigureTypeDiscovery(...)` | 增加或排除业务类型发现使用的程序集。 | 默认包含项目程序集。 |

### 模块系统选项

| 选项 | 类型 | 默认值 | 用途与约束 |
|---|---|---|---|
| `MaxConcurrentCompositionWorkItems` | `int` | `Math.Max(1, Environment.ProcessorCount)` | 限制 Monica 可以并发执行的调度组合工作项数量。值必须至少为 `1`；启动阶段 CPU 或内存压力较大时可以调低。它不会让模块回调或 Generic Host 服务启动并发执行。 |

### 诊断

模块系统诊断会把串行回调耗时与调度工作分开。UI 展示每个工作项的来源阶段、Deadline、排队时间、执行时间与最终状态，并分别汇总墙钟、执行、排队和检查点等待耗时。

OpenTelemetry 保持相同边界：`monica.module.init.duration` 使用 `phase` 标签报告串行回调耗时；`monica.module.composition.work.duration` 使用 `kind=wall|execution|queue|checkpoint_wait` 报告调度工作耗时。

每个宿主 Builder 只能调用一次 `AddMonica(...)`。不要保留 Module Guide 并在回调结束后继续修改；回调完成时模块图已经封闭。

继续阅读 [Module 模式与主机边界](../../concepts/module-pattern.md)了解生命周期、工作 Deadline 与调度组合工作的模块作者约束，阅读[执行边界](../../concepts/execution-boundaries.md)了解运行时行为组合，或阅读[快速开始](../../getting-started/index.md)创建可运行宿主。
