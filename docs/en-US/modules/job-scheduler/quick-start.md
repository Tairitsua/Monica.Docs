---
title: Quick start
description: Register the required JobScheduler choices and run a recurring job.
sidebar_position: 2
---

## Install

```bash
dotnet add package Monica.JobScheduler --prerelease
```

## Register the two required choices

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
        .UseSchedulerScope("local-development");
});

[JobConfig(JobName = "Ping job", CronSchedule = "0 */5 * * * *")]
public sealed class PingJob(ILogger<PingJob> logger) : RecurringJob(logger)
{
    public override Task ExecuteAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Ping");
        return Task.CompletedTask;
    }
}
```

JobScheduler always requires a unified store and a scheduler scope; module validation fails at startup when either is missing. The in-memory store is intended for local or single-process use; it does not survive restarts and cannot coordinate multiple hosts.

The host resolves its owner key from `ProjectName` (or the application-level project name, falling back to the entry assembly name) and its worker instance id from the `HOSTNAME` environment variable (or `machine:pid`). Both feed job discovery, snapshot publication, and lease fencing automatically.

The job attempt enters the execution pipeline and can receive registered diagnostics, routing, and application behaviors that match its descriptor, but it does not receive an automatic outer Unit of Work. Add explicit transaction scopes only around its database write units.

## First useful configuration

Two settings cover most real adjustments:

```csharp
monica.AddJobScheduler(options =>
    {
        options.CronTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Shanghai");
        options.RecurringJobDebugMode = builder.Environment.IsDevelopment();
    })
```

`CronTimeZone` unifies cron interpretation across hosts (persisted occurrences are always UTC), and `RecurringJobDebugMode` suppresses automatic recurring materialization in development while leaving run-now and triggered work available.

## What to read next

- [Catalog and lifecycle](./catalog-lifecycle.md)
- [Configuration](./configuration.md)
- [Registration and providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
