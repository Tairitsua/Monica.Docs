---
title: Catalog and lifecycle
description: Owner-local identity, snapshot publication, operator policy, and the execution lifecycle.
sidebar_position: 3
---

JobScheduler separates "what jobs the code declares" from "how operations run those jobs". Every host owns both planes for its own jobs: it publishes its declarations as an owner snapshot and runs its own queue, while operations read one shared catalog and adjust policy per job. Once the concepts below click, the remaining configuration and operations are straightforward.

## Identity model

| Concept | Description |
|---|---|
| Scheduler scope (`UseSchedulerScope`) | The stable namespace of one environment or logical scheduler installation. Every host in the same scope shares definitions, queue, and history; different environments must use different scope keys. |
| Owner key | The identity each host schedules and executes under: explicit `ProjectName` → application-level project name → entry assembly name. Replicas of one service share the owner key; different services get different owners. |
| Logical job key | The job type's full name, unique within an owner. Operator policy binds to `(owner, job key)`, so renaming or moving the class changes its identity. |
| Worker instance id | `WorkerInstanceId` (`HOSTNAME` env var, else `machine:pid`) fences leases per process; replicas of one service claim distinct instances of the same owner's queue. |

## Owner snapshots and absent definitions

Each host periodically publishes a `JobOwnerSnapshot` with every job type it currently carries (default cadence `SnapshotSyncInterval`, 30s). The store keeps definitions that disappear from a snapshot as **absent**: they stop being scheduled, their retained executions stay available for audit, and the UI marks them so operators can distinguish retired work from a missing deployment. A definition becomes present again as soon as its owner republishes it.

## Declaration versus operator policy

- **Declaration (`JobDeclaration`)**: the immutable contract that comes from code and `[JobConfig]`. Covers concurrency, retries, timeout, cron expression, timezone, and validity window.
- **Operator policy (`JobPolicy`)**: an independently editable overlay replaced atomically through `JobSchedulerFacade.UpdatePolicyAsync(...)` / `UpdatePoliciesAsync(...)` with optimistic concurrency. It can override display name, description, concurrency, retries, timeout, schedule (cron plus validity window), the disabled flag, and retention policy (retained record count and retention days).

Two semantics matter most:

- **Unset overrides inherit declaration values.** Policy stores only what operations explicitly changed; upgrading job code never forces a policy refresh.
- **Policy is sticky to the logical job key.** Editing policy never mutates the declaration; both stay independently versioned with a concurrency stamp that fences stale edits.

Batch updates (up to 100 items) settle per item: a single failure does not roll back successful items, so operators only refresh and retry the stale selections.

## Execution template freezing

When an execution is enqueued, the store captures an immutable **execution template** for it: the effective configuration at admission time. Queued or running executions are immune to later policy edits; operational changes only affect attempts enqueued afterwards.

## Leases and fenced execution

Every state transition happens inside serializable store transactions with row-level fencing. The worker claims its own owner's queued executions in bounded batches, holds each attempt through an execution lease, and renews the lease while the attempt runs. Expired leases are recovered and retried by the scheduling loop, so a crashed process does not strand work. When job code gets stuck, the host requests process shutdown after a grace period so an external supervisor can terminate the unsafe process instead of risking double writes.

## Recurring schedule cursors

Each recurring schedule owns a store-authoritative cursor:

- **Suspension reasons** are tracked separately for operator-policy disabling and host debug mode (`RecurringJobDebugMode`).
- When concurrency capacity is unavailable, due occurrences are recorded as **Skipped** instead of building an unbounded replay backlog.
- **Run-now never moves the cursor**, and a suspended schedule remains eligible for explicit run-now.
- After a schedule replacement or resume, the new schedule takes effect from the next occurrence computed against store-authoritative time.

## Related pages

- [Registration and providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Operational UI workspace](./ui-workspace.md)
