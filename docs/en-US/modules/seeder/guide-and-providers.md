---
title: Registration, graph, and diagnostics
description: Understand discovery, graph validation, execution ownership, and the current-host facade.
sidebar_position: 4
---

## Public surface

| API | Purpose |
|---|---|
| `monica.AddSeeder(...)` | Registers discovery, the DAG scheduler, readiness, state, and diagnostics facade. |
| `ISeeder.SeedAsync(...)` | Implements one finite, idempotent seed attempt. |
| `SeederBase` | Optional logger-owning base class for a seeder. |
| `[SeederDependsOn<TSeeder>]` | Declares a direct success prerequisite; multiple attributes are allowed. |
| `[SeederPolicy]` | Overrides execution, criticality, failure, or retry policy. |
| `SeederFacade.GetSnapshotAsync(...)` | Returns the sanitized current-process diagnostics snapshot as `Res<SeederDiagnosticsSnapshot>`. |

There is no storage or scheduler provider to select. Seeder types are discovered, registered as transient concrete services, and resolved from a fresh asynchronous scope for each attempt.

## Graph validation

Composition fails before execution when:

- a discovered type is abstract or does not implement `ISeeder`;
- a type or full type name is duplicated in the discovery scope;
- a dependency is undiscovered, self-referential, or declared twice;
- the graph contains a cycle; or
- a required seeder depends on an optional seeder.

Only successful prerequisites release their dependents. A failed, blocked, or cancelled prerequisite blocks its dependency chain.

## Execution ownership

Each attempt enters the [Execution Pipeline](../execution-pipeline/index.md) with `ExecutionTransactionMode.Automatic`. When the Unit of Work behavior participates, the attempt receives an automatic transactional boundary. Keep each seeder finite, avoid long-lived locks and external calls inside a database transaction, and make retries safe.

Retryable failures are logged at Warning. The final failed attempt is logged once at Error with structured seeder type, attempt count, and effective failure behavior. Stack traces stay in logs; the diagnostics snapshot bounds exception type and recursive message.

## Query diagnostics

```csharp
using Monica.Framework.Seeder.Facades;
using Monica.Framework.Seeder.Models;

public sealed class StartupDiagnostics(SeederFacade seeders)
{
    public async Task<SeederDiagnosticsSnapshot?> GetAsync(
        CancellationToken cancellationToken)
    {
        var result = await seeders.GetSnapshotAsync(cancellationToken);
        return result.IsFailed(out _, out var snapshot) ? null : snapshot;
    }
}
```

The snapshot includes configuration, run state, UTC timestamps, duration, counts, deterministic fail-fast trigger, full and friendly names, dependencies, effective policy origins, attempt history, and final bounded errors. It is replaced when the host process restarts; durable Seeder history is outside this module.
