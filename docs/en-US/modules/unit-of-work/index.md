---
title: Unit of Work
description: Coordinate repository changes through automatic execution boundaries or explicit business-sized scopes.
sidebar_position: 1
---

The Unit of Work module lives in `Monica.Repository`. It coordinates transactional DbContexts, exposes `IUnitOfWorkManager`, and runs post-commit callbacks. It integrates with Monica's shared [Execution Pipeline](../execution-pipeline/index.md); it no longer installs an MVC action filter.

## Automatic and explicit boundaries

`AddUnitOfWork()` contributes `UnitOfWorkExecutionBehavior<,>` for execution descriptors whose transaction mode is `Automatic`. Mediator requests, direct MVC actions, EventBus handlers, seeders, and finite hosted work items use that mode. Nested automatic boundaries join the ambient unit of work.

Job attempts and hosted-service lifecycle callbacks deliberately use `ExecutionTransactionMode.None`. Long-running or batch work must create explicit, business-sized scopes with `IUnitOfWorkManager.RunAsync(...)` instead of holding one transaction for the whole job.

Selecting `DbContextProviderType.UnitOfWork` on a repository context adds the module and adaptive DbContext provider automatically. Register `monica.AddUnitOfWork()` directly only when no repository registration already claims it.

## Public surface

- `IUnitOfWorkManager.RunAsync(...)` opens, completes, rolls back, and disposes a scope around one operation.
- `IUnitOfWorkManager.BeginScope(...)` exposes manual control when completion callbacks or multiple flushes are required.
- `UnitOfWorkScopeOptions` controls transaction use, isolation, `RequiresNew`, and command timeout.
- `IUnitOfWork.OnCompleted(...)` schedules work only after a successful commit.

Repository `SaveChangesAsync()` inside an active unit of work flushes through the unit rather than committing independently. Operation exceptions retain their original type, identity, and stack. If rollback also fails, Monica attaches the rollback exception to `Exception.Data["Monica.Repository.UnitOfWork.RollbackException"]` without replacing the primary failure.

## Next steps

- [Quick start](./quick-start.md)
- [Configuration](./configuration.md)
- [Registration Extensions and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
