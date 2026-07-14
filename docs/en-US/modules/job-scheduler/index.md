---
title: JobScheduler
description: Run recurring and triggered work with inspectable definitions and execution history.
sidebar_position: 1
---

# JobScheduler

`Monica.JobScheduler` discovers `RecurringJob` and `TriggeredJob<TArgs>` types, reconciles definitions, executes work with scoped dependency injection, and tracks execution state. The module deliberately requires a metadata repository, a scheduler scope, and an execution provider.

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
        .UseInMemoryMetadataRepository()
        .UseSchedulerScope("orders-development")
        .UseInMemoryProvider();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

[JobConfig(
    JobName = "Order backlog report",
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

## Required Guide choices

| Requirement | Local choice | Production/provider choice |
|---|---|---|
| Metadata | `UseInMemoryMetadataRepository()` | `UseCustomMetadataRepository<T>()` or `Monica.JobScheduler.EfCore` |
| Scope | `UseSchedulerScope("...")` | Use a stable key unique to the application and environment. |
| Execution coordination | `UseInMemoryProvider()` | `UseDistributeProvider()` after configuring distributed EventBus, cancellation, state, and discovery providers. |

The default cron timezone is `TimeZoneInfo.Local`. Zombie detection, long-interval scheduling, and history cleanup are enabled. The in-memory path is for local or single-process operation; it does not provide durable history or cross-instance coordination. `Monica.JobScheduler.UI` is a separate Stable dashboard package.
