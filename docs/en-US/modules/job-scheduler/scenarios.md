---
title: Scenarios
description: Compose local, durable, and multi-host schedulers with explicit transaction ownership.
sidebar_position: 6
---

## Scenario 1 — Run locally with the in-memory store

The best combination for docs, demos, and local verification: `UseInMemoryStore()` + `UseSchedulerScope("local-dev")` + `UseCatalogRelease(...)` + `AsStandalone()`. It lets one process exercise catalog convergence, scheduling, and execution. See the [Quick start](./quick-start.md) and `examples/JobSchedulerMinimal` in the Monica repository for complete samples.

## Scenario 2 — Persist with the EF Core store

For real deployments, switch the unified store to `Monica.JobScheduler.EfCore` and vary the scope key and release manifest per environment. Local debugging and production then reuse the same Monica registration shape.

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

Every replica of one scope must share the same database and byte-equivalent release manifests; production deployments should use PostgreSQL-compatible serializable transactions.

## Scenario 3 — Split control plane and workers across hosts

To scale out, deploy the control plane and workers separately against the same database and scope:

```csharp
// Control-plane host: carries no executable job types.
monica.AddJobScheduler()
    .UseEfCoreStore((sp, optionsBuilder) => optionsBuilder.UseNpgsql(connectionString))
    .UseSchedulerScope("orders")
    .UseCatalogRelease("orders:2026.8", deploymentGeneration: 12, owners)
    .AsControlPlane();

// Worker host: the manifest must include its local owner.
monica.AddJobScheduler()
    .UseEfCoreStore((sp, optionsBuilder) => optionsBuilder.UseNpgsql(connectionString))
    .UseSchedulerScope("orders")
    .UseCatalogRelease("orders:2026.8", deploymentGeneration: 12, owners)
    .AsWorker();
```

Workers claim only exact-revision executions. To roll out a new revision, update the worker revision in the manifest and publish a higher `deploymentGeneration`. To roll back, use `JobSchedulerFacade.ReactivateReleaseAsync(...)` to explicitly reactivate the older release.

## Scenario 4 — Trigger parameterized work from code

When work is driven by user actions, domain events, or external systems instead of cron, inject `ITriggeredJobManager` to enqueue executions and cancel them.

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

Operator-side triggering goes through `JobSchedulerFacade.TriggerAsync(...)` and `RunRecurringNowAsync(...)`; both pass admission checks against the active catalog and the durable queue.

## Scenario 5 — Bound database work explicitly

Do not wrap a long scan in one transaction. Read candidates outside a transaction, then persist bounded batches:

```csharp
foreach (var batch in candidates.Chunk(100))
{
    await unitOfWorkManager.RunAsync(
        () => PersistAsync(batch, cancellationToken),
        cancellationToken: cancellationToken);
}
```

If the job must publish an event or call another external system, commit the database unit first. Use a post-commit callback or publish after `RunAsync(...)` returns successfully.

## Common mistakes

- Omitting one of the three required choices (store, scope, catalog release), which fails module validation at startup.
- Reusing one scheduler scope across unrelated environments, mixing catalogs, queues, and history.
- Providing inconsistent release manifests across hosts of the same release (release id, generation, or owner manifest not byte-equivalent).
- Leaving the local owner out of a worker or standalone manifest, or attaching executable job types to a `ControlPlane` host.
- Assuming a job attempt receives an automatic Unit of Work because it is a business execution descriptor.
- Holding database locks across network calls or an unbounded scan.
