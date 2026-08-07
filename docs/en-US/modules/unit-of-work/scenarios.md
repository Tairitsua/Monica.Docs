---
title: Scenarios
description: Choose automatic, independent, and bounded transaction scopes.
sidebar_position: 5
---

## Scenario 1 — Let a normal application boundary join automatically

Mediator requests, direct MVC actions, EventBus handlers, seeders, and finite hosted work items use automatic execution descriptors. With Unit of Work registered, their repository operations share one ambient scope. Nested automatic boundaries join rather than create redundant transactions.

## Scenario 2 — Give a job business-sized transactions

The JobScheduler adapter intentionally creates no automatic job-wide Unit of Work. Split scanning or bulk work into bounded chunks and call `RunAsync(...)` for each write unit:

```csharp
foreach (var batch in batches)
{
    await unitOfWorkManager.RunAsync(
        () => PersistBatchAsync(batch, cancellationToken),
        cancellationToken: cancellationToken);
}
```

This limits lock duration and rollback scope. Publish external messages only after the database work has committed.

## Scenario 3 — Isolate nested work from an ambient scope

Without an ambient Unit of Work, each `RunAsync(...)` call already creates its own scope. Use `RequiresNew: true` only when an ambient scope exists and nested work must commit or roll back independently:

```csharp
await unitOfWorkManager.RunAsync(
    RebuildOneCategoryAsync,
    new UnitOfWorkScopeOptions(RequiresNew: true),
    cancellationToken);
```

## Scenario 4 — Publish after commit

For manually controlled work, register an asynchronous completion callback:

```csharp
await using var unitOfWork = unitOfWorkManager.BeginScope();
await repository.InsertAsync(order, cancellationToken);
unitOfWork.OnCompleted(
    () => localEventBus.PublishAsync(new OrderApproved(order.Id)));
await unitOfWork.CompleteAsync(cancellationToken);
```

## Failure semantics

`RunAsync(...)` rolls back with `CancellationToken.None`, then rethrows the original operation or completion exception. A rollback failure is attached under `Monica.Repository.UnitOfWork.RollbackException` in the original exception's `Data` dictionary.

## Common mistakes

- Starting one transaction around an entire long-running job or unbounded scan.
- Adding `RequiresNew` when no ambient scope exists, or using it inside an ambient transaction without a deliberate partial-commit policy.
- Opening a manual scope and forgetting `CompleteAsync()`.
- Publishing irreversible external work before the database commit succeeds.
