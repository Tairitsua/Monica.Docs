---
title: Scenarios
description: JobScheduler 的常见接入方式与使用陷阱。
sidebar_position: 6
---

## 场景 1 — 本地开发用内存存储跑通完整链路

这是最适合文档、Demo 和本地验证的组合：`UseInMemoryStore()` + `UseSchedulerScope("local-dev")` + `UseCatalogRelease(...)` + `AsStandalone()`。它可以让你在单进程宿主里直接观察目录收敛、调度和执行。完整示例见 [Quick Start](./quick-start.md) 与 Monica 仓库中的 `examples/JobSchedulerMinimal`。

## 场景 2 — 用 EF Core 存储接近真实部署

真实项目里，把统一存储切到 `Monica.JobScheduler.EfCore`，同时按环境切换作用域键与发布清单。这样本地调试与生产部署可以复用同一套 Monica 注册模式。

```csharp
using Microsoft.EntityFrameworkCore;
using Monica.JobScheduler.Models.Catalog;
using Monica.Modules;

var owners = new[] { new JobCatalogOwnerManifest("orders", "orders:2026.8") };

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
        .UseSchedulerScope(builder.Environment.IsDevelopment() ? "orders-debug" : "orders")
        .UseCatalogRelease("orders:2026.8", deploymentGeneration: 12, owners)
        .AsStandalone();
});
```

同一作用域内的所有副本必须连接同一个数据库，并且使用字节一致的发布清单；生产部署建议使用支持可序列化事务的 PostgreSQL 兼容数据库。

## 场景 3 — 多主机拆分控制面与工作面

需要横向扩展时，把控制面与工作面分开部署，共享同一个数据库与作用域：

```csharp
// 控制面宿主：不携带任何可执行作业类型。
monica.AddJobScheduler()
    .UseEfCoreStore((sp, optionsBuilder) => optionsBuilder.UseNpgsql(connectionString))
    .UseSchedulerScope("orders")
    .UseCatalogRelease("orders:2026.8", deploymentGeneration: 12, owners)
    .AsControlPlane();

// Worker 宿主：清单必须包含本地 owner。
monica.AddJobScheduler()
    .UseEfCoreStore((sp, optionsBuilder) => optionsBuilder.UseNpgsql(connectionString))
    .UseSchedulerScope("orders")
    .UseCatalogRelease("orders:2026.8", deploymentGeneration: 12, owners)
    .AsWorker();
```

Worker 只认领与自身版本精确匹配的执行；新版本上线时，更新清单中的 worker revision 并递增 `deploymentGeneration` 发布即可。需要回滚时用 `JobSchedulerFacade.ReactivateReleaseAsync(...)` 显式重新激活旧发布。

## 场景 4 — 通过代码触发带参数的触发式作业

当业务不是按 Cron 定时执行，而是由用户动作、领域事件或外部系统触发时，直接注入 `ITriggeredJobManager` 即可入队执行，也可以取消已入队的执行。

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

运维侧的触发与立即执行走 `JobSchedulerFacade.TriggerAsync(...)` 与 `RunRecurringNowAsync(...)`，两者都会经过激活目录与持久化队列的准入校验。

## 场景 5 — 显式划分数据库事务

不要用一个事务包裹长时间扫描。可以在事务外读取候选项，再按有界批次持久化：

```csharp
foreach (var batch in candidates.Chunk(100))
{
    await unitOfWorkManager.RunAsync(
        () => PersistAsync(batch, cancellationToken),
        cancellationToken: cancellationToken);
}
```

如果作业还要发布事件或调用外部系统，应先提交数据库单元。可以使用提交后回调，或在 `RunAsync(...)` 成功返回后再发布。

## Common mistakes

- 漏掉三项必需注册选择之一（存储、作用域、目录发布），导致模块在启动时校验失败。
- 不同环境共用同一个调度作用域，最终把目录、队列和历史混在一起。
- 同一发布在不同宿主上提供了不一致的发布清单（发布标识、代号或 owner 清单字节不一致）。
- Worker 或 Standalone 宿主的清单里漏掉本地 owner，或者给 `ControlPlane` 宿主携带了可执行作业类型。
- 因为作业是业务执行描述，就误以为整次尝试会自动获得 UnitOfWork。
- 在网络调用或无界扫描期间一直持有数据库锁。
