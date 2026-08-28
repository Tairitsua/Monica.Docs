---
title: Scenarios
description: Compose local, durable, and multi-service schedulers with explicit transaction ownership.
sidebar_position: 6
---

## Scenario 1 — Run locally with the in-memory store

The best combination for docs, demos, and local verification: `UseInMemoryStore()` + `UseSchedulerScope("local-dev")`. One process exercises discovery, snapshot publication, scheduling, and execution. See the [Quick start](./quick-start.md) and `examples/JobSchedulerMinimal` in the Monica repository for complete samples.

## Scenario 2 — Persist with the EF Core store

For real deployments, switch the unified store to `Monica.JobScheduler.EfCore` and vary the scope key per environment. Local debugging and production then reuse the same Monica registration shape.

```csharp
using Microsoft.EntityFrameworkCore;
using Monica.Modules;

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
        .UseSchedulerScope(builder.Environment.IsDevelopment() ? "orders-debug" : "orders");
});
```

Every host of one scope must point at the same database; production deployments should use PostgreSQL-compatible serializable transactions.

## Scenario 3 — Share one scope across services

In a microservice deployment, every service registers the same store and scope, and each service's jobs stay with that service:

```csharp
// In every service of the environment — identical store + scope:
monica.AddJobScheduler()
    .UseEfCoreStore((sp, optionsBuilder) => optionsBuilder.UseNpgsql(sharedConnectionString))
    .UseSchedulerScope("zgyg-dev");
```

The owner key resolves per service (for example `AlarmService.API`), so each host discovers, schedules, and executes only its own jobs, while replicas of the same service share one owner queue and coordinate through leases. Operations see every service's jobs in one catalog, and the runtime page lists each owner's footprint and liveness. A service's jobs never execute inside another service, so a job always runs where its dependencies and configuration exist.

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

Operator-side triggering goes through `JobSchedulerFacade.TriggerAsync(...)` and `RunRecurringNowAsync(...)`; both pass admission checks against the active definitions and the durable queue.

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

- Omitting one of the two required choices (store, scope), which fails module validation at startup.
- Reusing one scheduler scope across unrelated environments, mixing definitions, queues, and history.
- Pointing replicas of one service at different stores or scopes, splitting one owner's queue.
- Expecting a host to execute another owner's jobs; scheduling is owner-local by design.
- Assuming a job attempt receives an automatic Unit of Work because it is a business execution descriptor.
- Holding database locks across network calls or an unbounded scan.
