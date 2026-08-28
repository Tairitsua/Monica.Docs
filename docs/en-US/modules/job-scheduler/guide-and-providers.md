---
title: Registration and providers
description: Choose a store and scheduler scope, and understand module dependencies.
sidebar_position: 5
---

## Registration extensions

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `UseStore<TStore>()` | Registers a custom unified scheduler store | Yes (pick one) | You have your own persistence implementation that satisfies the `IJobSchedulerStore` atomicity contract. |
| `UseInMemoryStore()` | Process-local store | Yes (pick one) | Standalone development, demos, and deterministic tests; does not survive restarts and cannot coordinate multiple hosts. |
| `UseEfCoreStore(optionsAction, moduleAction?)` | Uses one EF Core database as the definition, policy, queue, lease, and history correctness boundary | Yes (pick one) | Real deployments; provided by `Monica.JobScheduler.EfCore`. |
| `UseSchedulerScope(scopeKey)` | Sets the scheduler namespace | Yes | One stable key shared by every host in an environment. |

There is no default store: the module declares a required store feature, and module validation fails until one of the store extensions is called.

## EF Core persistence

Install `Monica.JobScheduler.EfCore`, then:

```csharp
monica.AddJobScheduler()
    .UseEfCoreStore((sp, optionsBuilder) =>
    {
        optionsBuilder.UseNpgsql(builder.Configuration.GetConnectionString("JobScheduler")!);
    })
    .UseSchedulerScope(builder.Environment.IsDevelopment() ? "orders-debug" : "orders");
```

The selected database must be shared by every host of the same scope; production deployments should use PostgreSQL-compatible serializable transactions. Any store that can serve serializable transactions (including openGauss/GaussDB via a PostgreSQL-compatible EF provider) works with the same registration shape.

## Module dependencies

- The module requires the HostedService capability and the Health Check capability (health check `monica.job-scheduler`, tag `scheduler`).
- Its contract requires an `IJobSchedulerStore` in the container, satisfied by the store-selection extensions.
- Every host registers `JobSchedulerFacade` and `ITriggeredJobManager`; each host schedules and executes only its own owner's work.
- For the operational workspace, add `monica.AddJobSchedulerUI()`; for worker-instance insight in the runtime page, add `monica.AddJobSchedulerServiceDiscoveryInsight()`.

## Execution ownership

The JobScheduler adapter creates `jobs.recurring-attempt` and `jobs.triggered-attempt` execution descriptors. Both are business operations, but both use transaction mode `None`. Execution behaviors such as diagnostics may still run; `UnitOfWorkExecutionBehavior<,>` does not.

This split is intentional: the scheduler owns attempts, retries, cancellation, and history, while the job implementation owns database transaction size. Use explicit [Unit of Work](../unit-of-work/index.md) scopes for write batches.
