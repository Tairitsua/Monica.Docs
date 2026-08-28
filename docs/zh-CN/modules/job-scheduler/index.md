---
title: JobScheduler
description: 所有者本地化的持久化调度：每个服务注册、调度并执行自己的作业，共享同一个存储。
sidebar_position: 1
---

`Monica.JobScheduler` 发现每个宿主内的 `RecurringJob` 与 `TriggeredJob<TArgs>` 类型，把它们发布为该宿主的所有者快照，并通过持久化租约队列调度与执行。调度是**所有者本地化**的：宿主只物化和认领自己所有者身份的作业，而同一环境内的所有宿主共享同一个存储与作用域。模块要求两个显式选择：**统一存储与调度作用域**。

每次定时或触发式作业尝试都会进入统一 [Execution Pipeline](../execution-pipeline/index.md)，但描述符使用 `ExecutionTransactionMode.None`。JobScheduler 因此不会自动创建作业级外层 UnitOfWork；有数据库写入的作业必须通过 `IUnitOfWorkManager.RunAsync(...)` 划分业务粒度或有界批次。

```bash
dotnet add package Monica.JobScheduler --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.JobScheduler.Abstractions;
using Monica.JobScheduler.Annotations;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddJobScheduler()
        .UseInMemoryStore()
        .UseSchedulerScope("orders-development");
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

[JobConfig(
    JobName = "订单积压报表",
    CronSchedule = "0 * * * * *",
    MaxConcurrency = 1)]
public sealed class OrderBacklogJob(ILogger<OrderBacklogJob> logger)
    : RecurringJob(logger)
{
    public override Task ExecuteAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Checking the order backlog.");
        return Task.CompletedTask;
    }
}
```

## 何时使用这个模块

- 你需要统一管理定时作业与触发式作业，而不是自己维护零散 `HostedService`。
- 你希望作业声明、运维策略、持久化队列与执行租约都在模块层统一收口。
- 你有多个服务共用一个环境数据库，希望每个服务只调度和执行自己的作业，运维侧在一个工作台里看到全部。
- 你需要总览、目录、执行历史、统计与运行时健康等运维页面。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.JobScheduler` |
| 注册入口 | `monica.AddJobScheduler()` |
| EF Core 持久化 | `Monica.JobScheduler.EfCore`（`UseEfCoreStore(...)`） |
| 运维 UI | `monica.AddJobSchedulerUI()` |
| ServiceDiscovery 实例洞察 | `monica.AddJobSchedulerServiceDiscoveryInsight()` |

## 公开使用面

- `IRecurringJob`、`ITriggeredJob<TArgs>`：作业定义契约，配套基类 `RecurringJob`、`TriggeredJob<TArgs>`。
- `JobConfigAttribute`：声明单个作业的显示名、描述、并发、重试、超时、Cron 计划与生效边界。
- `ITriggeredJobManager`：代码内入队触发式作业、取消执行的宿主入口。
- `IJobSchedulerStore`：定义、策略、队列、租约、周期游标与统计的统一持久化正确性边界。
- `JobSchedulerFacade`：面向宿主 API 与运维 UI 的运维门面（总览、目录、策略、触发、执行、统计、取消、运行时总览）。
- `JobExecutionFeature`：执行管线中当前作业尝试的类型化上下文。

## 相关页面

- [Quick Start](./quick-start.md)
- [目录与生命周期](./catalog-lifecycle.md)
- [Configuration](./configuration.md)
- [注册与提供程序](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [运维 UI 工作台](./ui-workspace.md)
