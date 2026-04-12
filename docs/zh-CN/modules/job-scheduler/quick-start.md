---
title: Quick Start
description: 安装并注册 JobScheduler。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.JobScheduler
```

## 最小注册

```csharp
using Monica.JobScheduler.Abstractions;
using Monica.JobScheduler.Annotations;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddJobScheduler(o =>
{
    o.MaxWorkerExecutionThreads = 4;
})
.UseInMemoryMetadataRepository()
.UseSchedulerScope("local-dev")
.UseInMemoryProvider();

builder.UseMonica();

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

`JobScheduler` 不是“只加模块就能跑”的类型。它要求你明确三件事：**元数据存储、调度 Provider、调度 Scope**。本地开发时，最小可运行组合通常是 `UseInMemoryMetadataRepository()` + `UseSchedulerScope("local-dev")` + `UseInMemoryProvider()`。

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
