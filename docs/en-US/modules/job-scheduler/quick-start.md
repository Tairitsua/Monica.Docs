---
title: Quick start
description: Register the required JobScheduler choices and run a recurring job.
sidebar_position: 2
---

# Quick start

## Install

```bash
dotnet add package Monica.JobScheduler --prerelease
```

## Register the three required choices

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
        .UseInMemoryMetadataRepository()
        .UseSchedulerScope("local-development")
        .UseInMemoryProvider();
});

[JobConfig(JobName = "Ping job", CronSchedule = "0 */5 * * * *")]
public sealed class PingJob : IRecurringJob
{
    public Task ExecuteAsync(CancellationToken cancellationToken) =>
        Task.CompletedTask;
}
```

JobScheduler always requires a metadata repository, scheduler scope, and execution provider. The in-memory choices are intended for local or single-process use.

The job attempt enters the execution pipeline and can receive registered diagnostics, routing, and application behaviors that match its descriptor, but it does not receive an automatic outer Unit of Work. Add explicit transaction scopes only around its database write units.
