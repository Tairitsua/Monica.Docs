---
title: Configuration
description: Configure scheduler identity, leases, execution capacity, and retention.
sidebar_position: 4
---

All options live on `ModuleJobSchedulerOption`. Identity options are written through registration extensions; the rest can be set directly in `AddJobScheduler(options => ...)`.

## Identity and catalog

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `SchedulerScopeKey` | `string` | `string.Empty` | Yes | Always required | Set only through `UseSchedulerScope(...)`; separates environments or logical scheduler installations. |
| `CatalogReleaseId` | `string` | `string.Empty` | Yes | On every deployment release | Set only through `UseCatalogRelease(...)`; must be byte-equivalent on every host of the release. |
| `DeploymentGeneration` | `long` | — | Yes | Incremented per deployment | Monotonic ordering of desired-release intent; written via `UseCatalogRelease(...)`. |
| `CatalogOwners` | `List<JobCatalogOwnerManifest>` | Empty | Yes | On every deployment release | The complete owner→worker-revision manifest; removing an owner decommissions its jobs on activation. |
| `ProjectName` | `string?` | Entry assembly name | No | To override the default local owner identity | Resolves the local owner when a worker host does not set `LocalOwnerId`. |
| `LocalOwnerId` | `string?` | `null` | No | When deployment ownership intentionally differs | Set through `UseLocalWorkerIdentity(...)`. |
| `LocalWorkerRevisionId` | `string?` | `null` | No | Same as above | Must match the manifest revision for the resolved owner. |
| `Role` | `JobSchedulerRole` | `Worker` | No | When splitting control-plane and worker hosts | `ControlPlane` / `Worker` / `Standalone`; usually set with `AsControlPlane()` / `AsWorker()` / `AsStandalone()`. |
| `WorkerInstanceId` | `string` | `HOSTNAME` env var, else `machine:pid` | No | To customize the fencing identity | Fences capability and execution leases per process. |
| `CronTimeZone` | `TimeZoneInfo` | `TimeZoneInfo.Local` | No | To unify cron interpretation across hosts | Persisted occurrences are always converted to UTC. |
| `RecurringJobDebugMode` | `bool` | `false` | No | To suppress automatic recurring materialization | Suspends recurring cursors with an explicit debug reason; does not affect triggered work and does not block run-now. |

## Polling and leases

| Property | Type | Default | When to change | Notes |
|---|---|---|---|---|
| `ControlPlanePollInterval` | `TimeSpan` | `1s` | Tune control-plane convergence cadence | Checks catalog activation, recurring cursors, and expired leases; replicas coordinate through store-level CAS. |
| `WorkerPollInterval` | `TimeSpan` | `250ms` | Tune worker claim cadence | Used while the worker has free execution capacity. |
| `WorkerCapabilityLeaseDuration` | `TimeSpan` | `30s` | Loosen or tighten capability leases | Must exceed `WorkerCapabilityRenewInterval`. |
| `WorkerCapabilityRenewInterval` | `TimeSpan` | `10s` | Same as above | Measured locally from the last successful registration or renewal. |
| `ExecutionLeaseDuration` | `TimeSpan` | `30s` | Loosen or tighten execution leases | Must exceed `ExecutionLeaseRenewInterval`. |
| `ExecutionLeaseRenewInterval` | `TimeSpan` | `10s` | Same as above | Renewals also observe durable cancellation requests. |
| `ExecutionRetryDelay` | `TimeSpan` | `5s` | Adjust failure retry spacing | Store-side delay before a failed attempt becomes claimable again. |
| `ExecutionCancellationGracePeriod` | `TimeSpan` | `15s` | Adjust stuck-code grace | After the grace period the host requests shutdown so a supervisor terminates it. |
| `WorkerShutdownGracePeriod` | `TimeSpan` | `15s` | Adjust the graceful shutdown window | Surviving leases expire afterwards and are recovered by the control plane. |

## Execution capacity

| Property | Type | Default | When to change | Notes |
|---|---|---|---|---|
| `MaxWorkerExecutionThreads` | `int` | `4` | Limit or raise per-instance concurrency | Must be greater than zero. |
| `MaxClaimBatchSize` | `int` | `16` | Tune per-poll claim batch | 1–256; the effective value never exceeds available worker slots. |
| `MaxRecurringMaterializationsPerCycle` | `int` | `100` | Tune the occurrence budget | Shared budget for all recurring cursors in one convergence cycle. |
| `MaxExpiredLeaseRecoveriesPerCycle` | `int` | `100` | Tune expired-lease recovery batch | Upper bound per control-plane cycle. |

## History and retention

| Property | Type | Default | When to change | Notes |
|---|---|---|---|---|
| `MaxExecutionHistoryEntriesPerExecution` | `int` | `1000` | Raise or lower the per-execution history cap | State transitions, job logs, and cancellation audits share the cap; oldest entries are evicted atomically. |
| `MaxExecutionHistoryMessageLength` | `int` | `4096` | Adjust history message length | Longer messages are truncated with an ellipsis. |
| `EnableHistoryCleanup` | `bool` | `true` | To stop trimming terminal history automatically | Cleanup follows each job's active retention policy. |
| `HistoryCleanupInterval` | `TimeSpan` | `1h` | Adjust the cleanup cadence | Partial passes continue on later control-plane polls. |
| `MaxHistoryDeletionsPerCycle` | `int` | `5000` | Cap deletions per cleanup pass | Must be greater than zero. |
| `MaxRetainedOrphanedExecutions` | `int` | `10` | Adjust orphaned-execution retention | Newest terminal executions kept for jobs absent from the active catalog; `0` disables count-based cleanup. |

## Serialization

| Property | Type | Default | When to change | Notes |
|---|---|---|---|---|
| `JobArgsSerializerOptions` | `JsonSerializerOptions` | `UnsafeRelaxedJsonEscaping` enabled | To customize job-argument serialization | The default preserves non-ASCII text. |

These options control catalog convergence, leases, and maintenance cadence; none changes transaction ownership. Job attempts always use `ExecutionTransactionMode.None`, so database chunking remains explicit application code.

## Required registration choices

| Requirement | Satisfied by | Notes |
|---|---|---|
| Unified store | `UseInMemoryStore()`, `UseStore<TStore>()`, or `UseEfCoreStore(...)` | Pick one; `UseEfCoreStore(...)` comes from `Monica.JobScheduler.EfCore`. |
| Scheduler scope | `UseSchedulerScope(string scopeKey)` | Explicit and stable per environment and host group. |
| Catalog release | `UseCatalogRelease(releaseId, deploymentGeneration, owners)` | Worker and standalone manifests must include the local owner; a control plane may pass an empty manifest to decommission every owner. |
