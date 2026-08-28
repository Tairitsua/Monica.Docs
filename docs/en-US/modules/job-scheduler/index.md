---
title: JobScheduler
description: Owner-local durable scheduling: every service registers, schedules, and executes its own jobs against one shared store.
sidebar_position: 1
---

`Monica.JobScheduler` discovers the `RecurringJob` and `TriggeredJob<TArgs>` types inside each host, publishes them as that host's owner snapshot, and schedules and executes them through a durable leased queue. Scheduling is **owner-local**: a host only materializes and claims work for its own owner identity, while every host in one environment shares the same store and scope. The module requires two explicit choices: **a unified store and a scheduler scope**.

Each recurring or triggered attempt enters the shared [Execution Pipeline](../execution-pipeline/index.md), but its descriptor uses `ExecutionTransactionMode.None`. The JobScheduler adapter therefore creates no automatic outer Unit of Work. Write-heavy jobs must divide work into business-sized or bounded batches with explicit `IUnitOfWorkManager.RunAsync(...)` scopes.

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

## When to use this module

- You want recurring and triggered jobs managed in one place instead of scattered `IHostedService` implementations.
- You want job declarations, operator policy, a durable queue, and execution leases owned by the module layer.
- You run several services against one environment database and want each service to schedule and execute only its own jobs while operations observe everything in one workspace.
- You need operational pages for overview, catalog, execution history, statistics, and runtime health.

## Packages and registration

| Item | Value |
|---|---|
| Package | `Monica.JobScheduler` |
| Registration | `monica.AddJobScheduler()` |
| EF Core persistence | `Monica.JobScheduler.EfCore` (`UseEfCoreStore(...)`) |
| Operational UI | `monica.AddJobSchedulerUI()` |
| ServiceDiscovery worker insight | `monica.AddJobSchedulerServiceDiscoveryInsight()` |

## Public surface

- `IRecurringJob`, `ITriggeredJob<TArgs>`: job contracts, with the `RecurringJob` and `TriggeredJob<TArgs>` base classes.
- `JobConfigAttribute`: declares a job's display name, description, concurrency, retries, timeout, cron schedule, and validity window.
- `ITriggeredJobManager`: the host entry point for enqueuing triggered work and cancelling executions from code.
- `IJobSchedulerStore`: the single durable correctness boundary for definitions, policy, queue, leases, recurring cursors, and analytics.
- `JobSchedulerFacade`: the operational facade for host APIs and the UI (overview, catalog, policy, trigger, execution, analytics, cancellation, runtime overview).
- `JobExecutionFeature`: the typed context for the current attempt inside the execution pipeline.

## Next steps

- [Quick start](./quick-start.md)
- [Catalog and lifecycle](./catalog-lifecycle.md)
- [Configuration](./configuration.md)
- [Registration and providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Operational UI workspace](./ui-workspace.md)
