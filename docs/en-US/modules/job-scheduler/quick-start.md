---
title: Quick start
description: Register the required JobScheduler choices and run a recurring job.
sidebar_position: 2
---

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
        .UseInMemoryStore()
        .UseSchedulerScope("local-development")
        .UseCatalogRelease(
            "local-development:1",
            deploymentGeneration: 1,
            [new("local-development", "local-development:1")])
        .AsStandalone()
        .UseLocalWorkerIdentity("local-development", "local-development:1");
});

[JobConfig(JobName = "Ping job", CronSchedule = "0 */5 * * * *")]
public sealed class PingJob : IRecurringJob
{
    public Task ExecuteAsync(CancellationToken cancellationToken) =>
        Task.CompletedTask;
}
```

JobScheduler always requires a unified store, a scheduler scope, and an immutable catalog release. The in-memory store is intended for local or single-process use; it does not survive restarts and cannot coordinate multiple hosts.

`UseCatalogRelease(...)` takes a release identifier, a monotonically increasing `deploymentGeneration`, and the complete owner-to-worker-revision manifest. In a single-process sample the manifest only contains the local owner; worker and standalone hosts must always include their local owner. See [Catalog releases and lifecycle](./catalog-lifecycle.md).

The job attempt enters the execution pipeline and can receive registered diagnostics, routing, and application behaviors that match its descriptor, but it does not receive an automatic outer Unit of Work. Add explicit transaction scopes only around its database write units.

## Next steps

- [Catalog releases and lifecycle](./catalog-lifecycle.md)
- [Configuration](./configuration.md)
- [Registration extensions and roles](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
