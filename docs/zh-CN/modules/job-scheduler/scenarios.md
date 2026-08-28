---
title: Scenarios
description: 组合本地、持久化与多服务调度，并保持显式事务归属。
sidebar_position: 6
---

## 场景 1 — 本地开发用内存存储跑通完整链路

文档、演示与本地验证的最佳组合：`UseInMemoryStore()` + `UseSchedulerScope("local-dev")`。单进程即可体验发现、快照发布、调度与执行。完整示例见 [Quick Start](./quick-start.md) 与 Monica 仓库中的 `examples/JobSchedulerMinimal`。

## 场景 2 — 用 EF Core 存储持久化

真实部署把统一存储切换为 `Monica.JobScheduler.EfCore`，并按环境区分作用域键。本地调试与生产复用同一 Monica 注册形态。

```csharp
using Microsoft.EntityFrameworkCore;
using Monica.Modules;

builder.AddMonica(monica =>
{
    monica.AddJobScheduler(o =>
        {
            o.RecurringJobDebugMode = builder.Environment.IsDevelopment();
        })
        .UseEfCoreStore((sp, optionsBuilder) =>
        {
            optionsBuilder.UseNpgsql(builder.Configuration.GetConnectionString("JobScheduler")!);
        })
        .UseSchedulerScope(builder.Environment.IsDevelopment() ? "orders-debug" : "orders");
});
```

同一作用域的所有宿主必须指向同一个数据库；生产部署应使用 PostgreSQL 兼容的可串行化事务。

## 场景 3 — 多服务共享一个作用域

微服务部署里，每个服务注册相同的存储与作用域，而每个服务的作业留在自己的服务内：

```csharp
// 环境内每个服务都这样注册 —— 存储与作用域完全一致：
monica.AddJobScheduler()
    .UseEfCoreStore((sp, optionsBuilder) => optionsBuilder.UseNpgsql(sharedConnectionString))
    .UseSchedulerScope("zgyg-dev");
```

所有者键按服务解析（例如 `AlarmService.API`），因此每个宿主只发现、调度并执行自己的作业；同一服务的副本共享一个所有者队列，通过租约协调。运维在一个目录里看到所有服务的作业，运行时页列出每个所有者的足迹与在线状态。一个服务的作业永远不会在另一个服务里执行，作业总是运行在其依赖与配置所在的地方。

## 场景 4 — 从代码触发带参数的作业

当工作由用户操作、领域事件或外部系统驱动而非 Cron 驱动时，注入 `ITriggeredJobManager` 入队与取消。

```csharp
using Monica.JobScheduler.Abstractions;
using Monica.JobScheduler.Models.Execution;

public sealed class InvoiceService(ITriggeredJobManager jobs)
{
    public Task<string> QueueAsync(InvoiceJobArgs args)
    {
        return jobs.EnqueueAsync(args, delay: TimeSpan.FromMinutes(1));
    }

    public Task<JobCancellationResult> CancelAsync(string instanceId)
    {
        return jobs.CancelExecutionAsync(instanceId);
    }
}
```

运维侧触发走 `JobSchedulerFacade.TriggerAsync(...)` 与 `RunRecurringNowAsync(...)`；两者都要通过活动定义与持久化队列的准入检查。

## 场景 5 — 显式约束数据库工作量

不要把长扫描包进一个事务。在事务外读取候选，再按有界批次持久化：

```csharp
foreach (var batch in candidates.Chunk(100))
{
    await unitOfWorkManager.RunAsync(
        () => PersistAsync(batch, cancellationToken),
        cancellationToken: cancellationToken);
}
```

如果作业必须发布事件或调用外部系统，先提交数据库单元。使用提交后回调，或在 `RunAsync(...)` 成功返回后再发布。

## 常见错误

- 漏掉两个必需选择（存储、作用域）之一，启动时被模块校验拒绝。
- 不相关的环境复用同一个调度作用域，混入彼此的定义、队列与历史。
- 同一服务的副本指向不同存储或作用域，把一个所有者的队列拆散。
- 期望宿主执行其他所有者的作业；调度在设计上就是所有者本地化的。
- 因为是业务执行描述符就假定作业尝试自带 UnitOfWork。
- 跨网络调用或无上限扫描期间持有数据库锁。
