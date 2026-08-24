---
title: Catalog releases and lifecycle
description: Core concepts behind immutable catalog releases, activation convergence, operator policy, and execution templates.
sidebar_position: 3
---

JobScheduler separates "what jobs the code declares" from "how operations run those jobs" into two independently evolving planes: the control plane stages, publishes, and activates immutable catalog releases, while the worker plane claims and executes work by exact revision. Once the concepts below click, the remaining configuration and operations are straightforward.

## Identity model

| Concept | Description |
|---|---|
| Scheduler scope (`UseSchedulerScope`) | The stable namespace of one environment or logical scheduler installation. Every control-plane and worker host in the same scope shares the catalog, queue, and history; different environments must use different scope keys. |
| Catalog release (`UseCatalogRelease`) | One immutable deployment release, identified by a release id, a monotonically increasing `deploymentGeneration`, and the complete owner manifest. |
| Owner manifest | The mapping from every owner to one worker revision. Each host participating in the same release must provide byte-equivalent values; removing an owner from the manifest decommissions that owner's jobs when the release activates. |
| Logical job key | The job type's full name, unique within a scope. Operator policy is bound to the logical key, not to a specific deployment revision. |

## Publication and activation

The control plane converges a release in this order:

1. **Stage the release**: local job declarations and the owner manifest are written to the store.
2. **Publish owner snapshots**: once every owner's catalog snapshot is ready, the release becomes activatable.
3. **Activate**: the store appends a new activation epoch. Activation never mutates history; rollback uses `JobSchedulerFacade.ReactivateReleaseAsync(...)` to append a new epoch instead of rewriting existing records.

Normal deployments rely on the monotonic `deploymentGeneration` to order intent automatically; explicit reactivation exists only for deliberate operator rollback.

**Convergence** means the desired release matches the active catalog, and every owner's active workers match its declared revision. The overview page and `GetOverviewAsync(...)` expose per-owner convergence status. A `ControlPlane` host cannot carry executable job types — it only publishes releases and materializes recurring work.

## Declaration versus operator policy

- **Declaration (`JobDeclaration`)**: the immutable contract that comes from code and `[JobConfig]`, frozen per release. Covers concurrency, retries, timeout, cron expression, timezone, and validity window.
- **Operator policy (`JobPolicy`)**: an independently editable overlay replaced atomically through `JobSchedulerFacade.UpdatePolicyAsync(...)` / `UpdatePoliciesAsync(...)` with optimistic concurrency. It can override display name, description, concurrency, retries, timeout, schedule (cron plus validity window), the disabled flag, and retention policy (retained record count and retention days).

Two semantics matter most:

- **Unset overrides inherit declaration values.** Policy stores only what operations explicitly changed; upgrading job code never forces a policy refresh.
- **Policy is sticky to the logical job key.** Changing a job's owner or revision does not lose its policy; `IsPolicyReviewOutdated` flags release drift when the policy was last reviewed against an older job revision than the active release provides.

Batch updates (up to 100 items) settle per item: a single failure does not roll back successful items, so operators only refresh and retry the stale selections.

## Execution template freezing

When an execution is enqueued, the store captures an immutable **execution template** for it: the effective configuration plus the applied policy revision (`AppliedPolicyRevision`). Queued or running executions are immune to later policy edits; operational changes only affect attempts enqueued afterwards.

## Leases and fenced execution

Workers advertise their executable revision through capability leases and hold each attempt through execution leases; every state transition happens inside serializable store transactions with row-level fencing. Expired leases are recovered and retried by the control plane. When job code gets stuck, the host requests process shutdown after a grace period so an external supervisor can terminate the unsafe process instead of risking double writes.

## Recurring schedule cursors

Each recurring schedule owns a store-authoritative cursor:

- **Suspension reasons** are tracked separately for operator-policy disabling and host debug mode (`RecurringJobDebugMode`).
- When concurrency capacity is unavailable, due occurrences are recorded as **Skipped** instead of building an unbounded replay backlog.
- **Run-now never moves the cursor**, and a suspended schedule remains eligible for explicit run-now.
- After a schedule replacement or resume, the new schedule takes effect from the next occurrence computed against store-authoritative time.

## Related pages

- [Registration extensions and roles](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Operational UI workspace](./ui-workspace.md)
