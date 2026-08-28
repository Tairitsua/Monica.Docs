---
title: Operational UI workspace
description: JobScheduler UI pages, runtime insight, access control, and options.
sidebar_position: 7
---

`Monica.JobScheduler.UI` provides the localized scheduler operational workspace. Its pages register under the Task Scheduling navigation category, and all copy is localized through `JobSchedulerResource`.

```bash
dotnet add package Monica.JobScheduler.UI --prerelease
```

```csharp
monica.AddJobSchedulerUI();
```

The UI module depends on `ModuleJobScheduler`, the localization module, and Shell UI; access control reuses the shared operational-page policy (below). Add it on any service of the scope — every host serves the same shared-store view.

## Pages

| Page | Route | Coverage |
|---|---|---|
| Overview | `/job-scheduler` | Workload KPIs (totals, running, success rate, 24h throughput), execution-state distribution, recent queue activity, and attention signals. |
| Catalog | `/job-scheduler/catalog` | Operational table over all owners' definitions: filters, schedule descriptions, next/last run; title links to the job dossier, the job key copies to the clipboard, and rows expose run-now, pause/resume, and policy editing. |
| Job detail | `/job-scheduler/catalog/{OwnerKey}/{JobKey}` | One job's declaration contract, schedule panel, latest execution, and activity (hidden from navigation). |
| Executions | `/job-scheduler/executions` | Paged durable execution query with state filters; the row title and the detail action open execution evidence with an append-only history ledger and cancellation. |
| Statistics | `/job-scheduler/statistics` | Analytics dashboard: completion reliability, duration percentiles, outcome trend, rankings, and slowest executions over a bounded time range. |
| Runtime | `/job-scheduler/runtime` | Serving-host identity and effective configuration, store kind/provider, local scheduling-plane readiness, per-owner footprints with online badges, and worker instances when insight is enabled. |

The overview auto-refreshes on `AutoRefreshInterval`; catalog and executions pages use `DefaultPageSize` for their default page size.

## Worker-instance insight

The runtime page's worker table needs an insight provider. Register the ServiceDiscovery integration to populate it:

```csharp
monica.AddJobSchedulerServiceDiscoveryInsight();
```

The integration requires `AddServiceDiscovery(...)` with shared storage (`UseDistributedStorage()` across services, `UseMemoryStorage()` for a single host). Without it, the runtime page shows a setup hint instead of an empty table.

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

- [Catalog and lifecycle](./catalog-lifecycle.md)
- [Registration and providers](./guide-and-providers.md)
