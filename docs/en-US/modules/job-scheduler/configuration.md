---
title: Configuration
description: Configure scheduler identity, polling, leases, execution capacity, and retention.
sidebar_position: 4
---

All options live on `ModuleJobSchedulerOption`. Identity options are written through registration extensions; the rest can be set directly in `AddJobScheduler(options => ...)`.

## Identity

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `SchedulerScopeKey` | `string` | `string.Empty` | Yes | Always required | Set only through `UseSchedulerScope(...)`; separates environments or logical scheduler installations. |
| `ProjectName` | `string?` | Application project name, else entry assembly name | No | To override the owner identity | The owner key every host schedules and executes under; replicas of one service must resolve the same value. |
| `WorkerInstanceId` | `string` | `HOSTNAME` env var, else `machine:pid` | No | To customize the fencing identity | Fences execution leases per process. |
| `CronTimeZone` | `TimeZoneInfo` | `TimeZoneInfo.Local` | No | To unify cron interpretation across hosts | Persisted occurrences are always converted to UTC. |
| `RecurringJobDebugMode` | `bool` | `false` | No | To suppress automatic recurring materialization | Suspends recurring cursors with an explicit debug reason; does not affect triggered work and does not block run-now. |

## Scheduling and snapshot sync

| Property | Type | Default | When to change | Notes |
|---|---|---|---|---|
| `SchedulingPollInterval` | `TimeSpan` | `1s` | Tune the scheduling loop cadence | One loop publishes the owner snapshot, materializes due recurring occurrences, recovers expired leases, and runs history cleanup. |
| `SnapshotSyncInterval` | `TimeSpan` | `30s` | Adjust owner-snapshot publication | Also drives the UI's owner-online threshold (3× this interval). |
| `MaxRecurringMaterializationsPerCycle` | `int` | `100` | Tune the occurrence budget | Shared budget for all recurring cursors in one scheduling cycle. |
| `MaxExpiredLeaseRecoveriesPerCycle` | `int` | `100` | Tune expired-lease recovery batch | Upper bound per scheduling cycle. |

## Worker polling and leases

| Property | Type | Default | When to change | Notes |
|---|---|---|---|---|
| `WorkerPollInterval` | `TimeSpan` | `250ms` | Tune worker claim cadence | Used while the worker has free execution capacity. |
| `MaxWorkerExecutionThreads` | `int` | `4` | Limit or raise per-instance concurrency | Must be greater than zero. |
| `MaxClaimBatchSize` | `int` | `16` | Tune per-poll claim batch | 1–256; the effective value never exceeds available worker slots. |
| `ExecutionLeaseDuration` | `TimeSpan` | `30s` | Loosen or tighten execution leases | Must exceed `ExecutionLeaseRenewInterval`, `ExecutionCancellationGracePeriod`, and `WorkerShutdownGracePeriod`. |
| `ExecutionLeaseRenewInterval` | `TimeSpan` | `10s` | Same as above | Renewals also observe durable cancellation requests. |
| `ExecutionRetryDelay` | `TimeSpan` | `5s` | Adjust failure retry spacing | Store-side delay before a failed attempt becomes claimable again. |
| `ExecutionCancellationGracePeriod` | `TimeSpan` | `15s` | Adjust stuck-code grace | After the grace period the host requests shutdown so a supervisor terminates it. |
| `WorkerShutdownGracePeriod` | `TimeSpan` | `15s` | Adjust the graceful shutdown window | Surviving leases expire afterwards and are recovered by the scheduling loop. |

## History and retention

| Property | Type | Default | When to change | Notes |
|---|---|---|---|---|
| `MaxExecutionHistoryEntriesPerExecution` | `int` | `1000` | Raise or lower the per-execution history cap | State transitions, job logs, and cancellation audits share the cap; oldest entries are evicted atomically. |
| `MaxExecutionHistoryMessageLength` | `int` | `4096` | Adjust history message length | Longer messages are truncated with an ellipsis. |
| `EnableHistoryCleanup` | `bool` | `true` | To stop trimming terminal history automatically | Cleanup follows each job's active retention policy. |
| `HistoryCleanupInterval` | `TimeSpan` | `1h` | Adjust the cleanup cadence | Partial passes continue on later scheduling cycles. |
| `MaxHistoryDeletionsPerCycle` | `int` | `5000` | Cap deletions per cleanup pass | Must be greater than zero. |
| `MaxRetainedOrphanedExecutions` | `int` | `10` | Adjust orphaned-execution retention | Newest terminal executions kept for jobs absent from the owner's snapshot; `0` disables count-based cleanup. |

## Serialization

| Property | Type | Default | When to change | Notes |
|---|---|---|---|---|
| `JobArgsSerializerOptions` | `JsonSerializerOptions` | `UnsafeRelaxedJsonEscaping` enabled | To customize job-argument serialization | The default preserves non-ASCII text. |

All `TimeSpan` options must be positive. These options control polling, leases, and maintenance cadence; none changes transaction ownership. Job attempts always use `ExecutionTransactionMode.None`, so database chunking remains explicit application code.

## Required registration choices

| Requirement | Satisfied by | Notes |
|---|---|---|
| Unified store | `UseInMemoryStore()`, `UseStore<TStore>()`, or `UseEfCoreStore(...)` | Pick one; `UseEfCoreStore(...)` comes from `Monica.JobScheduler.EfCore`. |
| Scheduler scope | `UseSchedulerScope(string scopeKey)` | Explicit and stable per environment and host group. |
