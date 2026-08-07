---
title: ProjectUnits
description: Build an agent-readable architecture catalog from typed roles, explicit context, and requirement traceability.
sidebar_position: 2
---

ProjectUnits are Monica's typed vocabulary for application architecture. They let developers, coding agents, and the running host agree on what each discovered type does, who owns it, and which requirements justify it.

## Architectural roles

- `ApplicationService` and `RequestDto` define use-case boundaries.
- `DomainService`, `Entity`, and `Repository` own domain behavior and persistence boundaries.
- `DomainEvent`, `DomainEventHandler`, and `LocalEventHandler` describe collaboration and side effects.
- `Configuration` describes host-managed settings.
- `RecurringJob` and `TriggeredJob` describe background entry points.

ProjectUnits do not replace good domain modeling. Keep invariants on the state owner and use services for orchestration.

## Roles are not interception boundaries

A ProjectUnit role describes architecture; it does not automatically wrap every method call. Runtime boundaries are established by subsystem adapters—for example Mediator requests, EventBus handlers, direct MVC actions, jobs, seeders, and hosted work items. A `DomainService` normally runs inside its caller's boundary.

Use the [Execution Pipeline](../modules/execution-pipeline/index.md) when a subsystem needs a shared behavior chain. Ordinary application and domain services remain inside their caller's boundary; a subsystem that owns a new independent entry point should provide an explicit typed adapter.

## Declare agent context explicitly

Every discovered class or record should declare its own metadata. The annotation is deliberately not inherited because a base class cannot accurately describe the responsibility of every derived unit.

```csharp
using Monica.ProjectUnits.Annotations;

[ProjectUnitMetadata(
    "Approve Order",
    Owner = "Ordering Team",
    Description = "Approves an eligible order.",
    Tags = ["ordering", "approval"])]
[ProjectUnitRequirement("ORD-REQ-001")]
public sealed class CommandHandlerApproveOrder(
    DomainOrderApproval domainService)
    : ApplicationService<CommandApproveOrder>
{
    public override async Task<Res> Handle(
        CommandApproveOrder request,
        CancellationToken cancellationToken)
    {
        await domainService.ApproveAsync(request.OrderId, cancellationToken);
        return Res.Ok();
    }
}
```

`ProjectUnitRequirementAttribute` is repeatable. Monica trims and deduplicates requirement IDs case-insensitively, but the consuming application owns their format. Store stable IDs rather than document paths or URLs.

Malformed explicit annotations produce catalog warnings. Missing annotations remain visible as adoption debt and do not block startup.

## Independent coverage semantics

The dashboard measures every discovered ProjectUnit against four independent dimensions:

| Dimension | Covered when |
|---|---|
| Metadata | The unit declares `ProjectUnitMetadataAttribute` directly. |
| Description | Metadata supplies a description, or XML documentation supplies a type summary. |
| Ownership | Metadata supplies a non-empty owner. |
| Requirements | The unit declares at least one valid requirement annotation. |

Each denominator is the complete host catalog. Monica does not combine these values into a weighted readiness score. An empty catalog reports **no data**, never 100%.

## Host-scoped typed catalog

The internal discovery model may use reflection, but the facade and HTTP boundary expose serializable projections only:

- `ProjectUnitSummary`
- `ProjectUnitDetail`
- `ProjectUnitDashboardSnapshot`
- `ProjectUnitCoverageMetric`
- `ProjectUnitTypeStatistics`
- `ProjectUnitRequirementReference`
- `ProjectUnitServiceIdentity`

The catalog belongs to the current Monica host. Cross-service aggregation is a gateway or platform concern.

## Requirement navigation

An application may implement `IProjectUnitRequirementLinkResolver` and register it through `UseRequirementLinkResolver<TResolver>()`. Resolution occurs only when detail is loaded. Unknown IDs remain visible and non-clickable; one resolver failure does not make the catalog unavailable.

Read the [ProjectUnits module guide](../modules/project-units/index.md) for registration, endpoints, dashboard use, and resolver examples.

## Testing ProjectUnits

Use `ProjectUnitFixture<TUnit>` only for focused collaboration tests with explicit dependencies. Use a complete host-owned scenario when behavior depends on discovery, conventional registration, execution-pipeline behaviors, proxies, options, persistence, or host lifecycle.

[Choose the correct testing boundary](../guides/testing-monica-applications.md).
