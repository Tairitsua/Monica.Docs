---
title: Quick Start
description: 安装并注册 JobScheduler。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.JobScheduler --prerelease
```

## 最小注册

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.JobScheduler.Abstractions;
using Monica.JobScheduler.Annotations;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddJobScheduler(options =>
        {
            options.MaxWorkerExecutionThreads = 4;
        })
        .UseInMemoryStore()
        .UseSchedulerScope("local-dev")
        .UseCatalogRelease(
            "local-dev:development",
            deploymentGeneration: 1,
            [new("local-dev", "local-dev:development")])
        .AsStandalone()
        .UseLocalWorkerIdentity("local-dev", "local-dev:development");
});

[JobConfig(JobName = "Ping Job", CronSchedule = "0 */5 * * * *")]
public sealed class PingJob : IRecurringJob
{
    public Task ExecuteAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
```

## 第一个有价值的配置

`JobScheduler` 不是"只加模块就能跑"的类型。它要求你明确三件事：**统一存储、调度作用域、不可变目录发布**。本地开发时，最小可运行组合通常是 `UseInMemoryStore()` + `UseSchedulerScope("local-dev")` + `UseCatalogRelease(...)`，并配合 `AsStandalone()` 让单进程同时承担控制面与工作面。

`UseCatalogRelease(...)` 需要一个发布标识、单调递增的部署代号（`deploymentGeneration`）以及完整的 owner 到 worker revision 清单。单进程示例里，清单只需包含本地 owner；worker 与 standalone 宿主必须在清单里包含自己的本地 owner。详见[目录发布与生命周期](./catalog-lifecycle.md)。

作业尝试会进入统一执行管线，因此可以获得宿主已注册且匹配的诊断、路由和应用行为，但不会获得自动外层 UnitOfWork。只有数据库写入单元需要显式事务作用域。

## 接下来读什么

- [目录发布与生命周期](./catalog-lifecycle.md)
- [Configuration](./configuration.md)
- [注册扩展与角色](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
