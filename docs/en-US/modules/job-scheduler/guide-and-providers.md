---
title: Guide and providers
description: Choose metadata, scheduler scope, and local or distributed execution.
sidebar_position: 4
---

# Guide and providers

## Guide methods

| Method | What it enables | Typical use |
|---|---|---|
| `UseCustomMetadataRepository<TRepository>()` | Host-owned metadata persistence. | Durable definitions, instances, and history. |
| `UseInMemoryMetadataRepository()` | Process-local metadata. | Development, demos, and focused tests. |
| `UseSchedulerScope(scopeKey)` | Stable scheduling partition. | Separate applications, environments, or clusters. |
| `UseDistributeProvider()` | Distributed dispatch, cancellation, state, and discovery composition. | Multi-instance deployment. |
| `UseInMemoryProvider()` | Process-local execution coordination. | Single-instance operation. |

`Monica.JobScheduler.EfCore` supplies an EF Core metadata repository integration. `Monica.JobScheduler.UI` is a separate dashboard package.

## Execution ownership

The JobScheduler adapter creates `jobs.recurring-attempt` and `jobs.triggered-attempt` execution descriptors. Both are business operations, but both use transaction mode `None`. Execution behaviors such as diagnostics may still run; `UnitOfWorkExecutionBehavior<,>` does not.

This split is intentional: the scheduler owns attempts, retries, cancellation, and history, while the job implementation owns database transaction size. Use explicit [Unit of Work](../unit-of-work/index.md) scopes for write batches.
