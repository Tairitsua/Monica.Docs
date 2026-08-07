---
title: Scenarios
description: JobScheduler 的常见接入方式与使用陷阱。
sidebar_position: 5
---

## 场景 1 — 本地开发用内存 Provider 跑通完整链路

这是最适合文档、Demo 和本地验证的组合：`UseInMemoryMetadataRepository()` + `UseSchedulerScope("local-dev")` + `UseInMemoryProvider()`。它可以让你在单实例宿主里直接观察作业发现、调度和执行。

## 场景 2 — 用 EF Core 元数据仓储接近真实部署

真实项目里，常见做法是把元数据仓储切到 `Monica.JobScheduler.EfCore`，同时按环境切换 `SchedulerScopeKey` 和 Provider。这样本地调试与生产部署可以复用同一套 Monica 注册模式。

```csharp
using Microsoft.EntityFrameworkCore;
using Monica.Modules;

builder.AddMonica(monica =>
{
    monica.AddJobScheduler(o =>
        {
            o.RecurringJobDebugMode = builder.Environment.IsDevelopment();
            o.TriggeredJobDebugMode = builder.Environment.IsDevelopment();
        })
        .UseEfCoreMetadataRepository((sp, optionsBuilder) =>
        {
            optionsBuilder.UseNpgsql(builder.Configuration.GetConnectionString("JobScheduler")!);
        })
        .UseSchedulerScope(builder.Environment.IsDevelopment() ? "debug" : "prod")
        .UseDistributeProvider();
});
```

## 场景 3 — 通过代码触发带参数的触发式作业

当业务不是按 Cron 定时执行，而是由用户动作、领域事件或外部系统触发时，直接注入 `ITriggeredJobManager` 即可提交实例。

```csharp
public sealed class InvoiceService(ITriggeredJobManager jobs)
{
    public Task<string> QueueAsync(InvoiceJobArgs args)
    {
        return jobs.EnqueueAsync(args, delay: TimeSpan.FromMinutes(1));
    }
}
```

## 场景 4 — 显式划分数据库事务

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

- 漏掉三项必需 Guide 之一，导致模块在启动时校验失败。
- 不同环境共用同一个 `SchedulerScopeKey`，最终把作业定义和实例混在一起。
- 因为作业是业务执行描述，就误以为整次尝试会自动获得 UnitOfWork。
- 在网络调用或无界扫描期间一直持有数据库锁。
