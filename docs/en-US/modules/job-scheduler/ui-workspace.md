---
title: Operational UI workspace
description: JobScheduler UI pages, access control, and options.
sidebar_position: 7
---

`Monica.JobScheduler.UI` provides the localized scheduler operational workspace. Its pages register under the Task Scheduling navigation category, and all copy is localized through `JobSchedulerResource`.

```bash
dotnet add package Monica.JobScheduler.UI --prerelease
```

```csharp
monica.AddJobSchedulerUI();
```

The UI module depends on `ModuleJobScheduler`, the localization module, and Shell UI; access control reuses the shared operational-page policy (below).

## Pages

| Page | Route | Coverage |
|---|---|---|
| Overview | `/job-scheduler` | Release readiness, catalog publication status, owner convergence, workload and attention signals, recent executions. |
| Catalog | `/job-scheduler/catalog` | Operational table over the active catalog: filters, schedule descriptions, policy review status; trigger, run-now, and policy editing. |
| Job detail | `/job-scheduler/catalog/{JobKey}` | One job's declaration contract, schedule panel, latest execution, and activity (hidden from navigation). |
| Executions | `/job-scheduler/executions` | Paged durable execution query, state flow, execution detail with evidence facts and an append-only history ledger, cancellation. |
| Statistics | `/job-scheduler/statistics` | Analytics dashboard: entered cohort, completion reliability, recurring fulfillment, duration percentiles, trend, rankings, and slowest executions. |

The overview auto-refreshes on `AutoRefreshInterval`; catalog and executions pages use `DefaultPageSize` for their default page size.

## Access control

Every page and mutation is protected by `OperationalPageAccessPolicy<ModuleJobSchedulerUIOption>`:

- When `AuthorizationPolicyOverride` is set, it overrides the shell-wide operational policy.
- When unset, the shell operational policy is inherited.
- **Outside the Development environment, a missing effective policy denies access** — production deployments must configure an authorization policy explicitly.

## Module options

| Property | Type | Default | When to change |
|---|---|---|---|
| `AuthorizationPolicyOverride` | `string?` | `null` | To give scheduler pages a dedicated authorization policy. |
| `AutoRefreshInterval` | `TimeSpan` | `5s` | To adjust the overview auto-refresh cadence. |
| `DefaultPageSize` | `int` | `20` | To adjust the default catalog and execution page size. |

## Related pages

- [Catalog releases and lifecycle](./catalog-lifecycle.md)
- [Registration extensions and roles](./guide-and-providers.md)
