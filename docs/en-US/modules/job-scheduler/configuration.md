---
title: Configuration
description: Configure scheduler identity, execution limits, recovery, and retention.
sidebar_position: 3
---

# Configuration

## Core options

| Property | Default | Purpose |
|---|---:|---|
| `SchedulerScopeKey` | Empty | Required stable identity that separates environments or clusters; set through `UseSchedulerScope(...)`. |
| `ProjectName` | Entry assembly name | Project identity used for definition reconciliation. |
| `RecurringJobDebugMode` | `false` | Registers recurring jobs without automatic scheduling. |
| `TriggeredJobDebugMode` | `false` | Disables automatic triggered-job publication for debugging. |
| `MaxWorkerExecutionThreads` | `null` | Optional per-instance execution concurrency limit. |
| `JobArgsSerializerOptions` | Monica defaults | Customizes triggered-job argument JSON. |

## Recovery and retention defaults

Zombie detection, long-interval scheduling, and history cleanup are enabled by default. Important controls include `ZombieDetectionInterval`, `ProcessingTimeoutMultiplier`, `EnqueuedStateTimeout`, `LongIntervalScanInterval`, `HistoryCleanupInterval`, and `MaxDeletionsPerJobPerCycle`.

These options control scheduling and metadata lifecycle; none changes transaction ownership. Job attempts always use `ExecutionTransactionMode.None`, so database chunking remains explicit application code.

## Required Guide choices

| Requirement | Methods |
|---|---|
| Metadata repository | `UseCustomMetadataRepository<TRepository>()` or `UseInMemoryMetadataRepository()` |
| Scheduler scope | `UseSchedulerScope(string scopeKey)` |
| Execution provider | `UseDistributeProvider()` or `UseInMemoryProvider()` |
