---
title: Scenarios
description: Compose local and distributed jobs with explicit transaction ownership.
sidebar_position: 5
---

# Scenarios

## Scenario 1 — Run locally with complete scheduler composition

Use `UseInMemoryMetadataRepository()`, `UseSchedulerScope("local-development")`, and `UseInMemoryProvider()` to exercise discovery, reconciliation, and execution in one process.

## Scenario 2 — Persist metadata with EF Core

Install `Monica.JobScheduler.EfCore` and configure `UseEfCoreMetadataRepository(...)` when definitions, instances, and history must survive restarts. Keep the scheduler scope stable per application and environment.

## Scenario 3 — Trigger parameterized work

Inject `ITriggeredJobManager` when a user action, domain event, or external input should enqueue a `TriggeredJob<TArgs>` rather than waiting for a cron schedule.

## Scenario 4 — Bound database work explicitly

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

- Omitting one of the three required Guide choices.
- Reusing one scheduler scope across unrelated environments.
- Assuming a job attempt receives an automatic Unit of Work because it is a business execution descriptor.
- Holding database locks across network calls or an unbounded scan.
