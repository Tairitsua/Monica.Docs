---
title: Registration extensions and roles
description: Choose a store, scheduler scope, catalog release, and host role.
sidebar_position: 5
---

## Registration extensions

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `UseStore<TStore>()` | Registers a custom unified scheduler store | Yes (pick one) | You have your own persistence implementation that satisfies the `IJobSchedulerStore` atomicity contract. |
| `UseInMemoryStore()` | Process-local store | Yes (pick one) | Standalone development, demos, and deterministic tests; does not survive restarts and cannot coordinate multiple hosts. |
| `UseEfCoreStore(optionsAction, moduleAction?)` | Uses one EF Core database as the catalog, policy, queue, lease, and history correctness boundary | Yes (pick one) | Real deployments; provided by `Monica.JobScheduler.EfCore`. |
| `UseSchedulerScope(scopeKey)` | Sets the scheduler namespace | Yes | One stable key shared by every control-plane and worker host in an environment. |
| `UseCatalogRelease(releaseId, generation, owners)` | Declares one immutable catalog release | Yes | Updated on every deployment release; byte-equivalent on every participating host. |
| `AsControlPlane()` / `AsWorker()` / `AsStandalone()` | Selects the host role | No | Default is `Worker`; use `AsStandalone()` for single-process hosts. |
| `UseLocalWorkerIdentity(ownerId, workerRevisionId)` | Overrides the local worker identity | No | Only when deployment ownership intentionally differs from the project identity. |

## Role choices

| Role | How to enable | What this host does |
|---|---|---|
| ControlPlane | `AsControlPlane()` | Stages and activates releases, materializes recurring occurrences, recovers expired leases; **cannot own executable job types**. |
| Worker | Default (`AsWorker()`) | Publishes one owner catalog snapshot and claims only exact-revision executions; does not materialize recurring schedules. |
| Standalone | `AsStandalone()` | Owns both planes in one process; ideal for local development and minimal deployments. |

## EF Core persistence

Install `Monica.JobScheduler.EfCore`, then:

```csharp
monica.AddJobScheduler()
    .UseEfCoreStore((sp, optionsBuilder) =>
    {
        optionsBuilder.UseNpgsql(builder.Configuration.GetConnectionString("JobScheduler")!);
    })
    .UseSchedulerScope(builder.Environment.IsDevelopment() ? "orders-debug" : "orders")
    .UseCatalogRelease("orders:2026.8", deploymentGeneration: 12, owners)
    .AsStandalone();
```

The selected database must be shared by every control-plane and worker replica of the same scope; production deployments should use PostgreSQL-compatible serializable transactions.

## Module dependencies

- The module requires the HostedService capability and the Health Check capability (health check `monica.job-scheduler`, tag `scheduler`).
- Its contract requires an `IJobSchedulerStore` in the container, satisfied by the store-selection extensions.
- Control-plane hosts additionally register `JobSchedulerFacade`; worker and standalone hosts register `ITriggeredJobManager` and the execution services.
- For a visual control plane, add `monica.AddJobSchedulerUI()`.

## Execution ownership

The JobScheduler adapter creates `jobs.recurring-attempt` and `jobs.triggered-attempt` execution descriptors. Both are business operations, but both use transaction mode `None`. Execution behaviors such as diagnostics may still run; `UnitOfWorkExecutionBehavior<,>` does not.

This split is intentional: the scheduler owns attempts, retries, cancellation, and history, while the job implementation owns database transaction size. Use explicit [Unit of Work](../unit-of-work/index.md) scopes for write batches.
