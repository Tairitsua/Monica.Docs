---
title: JobScheduler
description: An immutable job catalog control plane with a revision-aware durable execution plane.
sidebar_position: 1
---

`Monica.JobScheduler` discovers `RecurringJob` and `TriggeredJob<TArgs>` types, publishes them as immutable catalog releases, and hands them to revision-aware workers through a durable leased queue. The module requires three explicit choices: **a unified store, a scheduler scope, and an immutable catalog release**.

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
        .UseSchedulerScope("orders-development")
        .UseCatalogRelease(
            "orders-development:1",
            deploymentGeneration: 1,
            [new("orders", "orders-development:1")])
        .AsStandalone()
        .UseLocalWorkerIdentity("orders", "orders-development:1");
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

## Packages and registration

| Item | Value |
|---|---|
| Package | `Monica.JobScheduler` |
| Registration | `monica.AddJobScheduler()` |
| EF Core persistence | `Monica.JobScheduler.EfCore` (`UseEfCoreStore(...)`) |
| Operational UI | `monica.AddJobSchedulerUI()` |

## Public surface

- `IRecurringJob`, `ITriggeredJob<TArgs>`: job contracts, with the `RecurringJob` and `TriggeredJob<TArgs>` base classes.
- `JobConfigAttribute`: declares a job's display name, description, concurrency, retries, timeout, cron schedule, and validity window.
- `ITriggeredJobManager`: the host entry point for enqueuing triggered work and cancelling executions from code.
- `IJobSchedulerStore`: the single durable correctness boundary for catalog, policy, queue, lease, recurring-cursor, and analytics state.
- `JobSchedulerFacade`: the control-plane facade for host APIs and the operational UI (overview, catalog, policy, trigger, execution, analytics, cancellation, release rollback).
- `JobExecutionFeature`: the typed context for the current attempt inside the execution pipeline.

## Next steps

- [Quick start](./quick-start.md)
- [Catalog releases and lifecycle](./catalog-lifecycle.md)
- [Configuration](./configuration.md)
- [Registration extensions and roles](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Operational UI workspace](./ui-workspace.md)
