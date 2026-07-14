---
title: ProjectUnits
description: Use typed architectural roles to make application structure discoverable and enforceable.
sidebar_position: 2
---

# ProjectUnits

ProjectUnits are Monica's typed vocabulary for application architecture. They tell a developer, a coding agent, and the running host what role a type owns.

## The vocabulary

- `ApplicationService` and `RequestDto` describe use cases and their public inputs.
- `DomainService`, `Entity`, and `Repository` keep domain behavior and persistence boundaries explicit.
- `DomainEvent`, `DomainEventHandler`, and `LocalEventHandler` describe collaboration and side effects.
- `Configuration` describes owned settings.
- `RecurringJob` and `TriggeredJob` describe background work.

## Register discovery

```csharp
builder.AddMonica(monica =>
{
    monica.ConfigureTypeDiscovery(options =>
        options.Add("Domains.Ordering", "Platform.Protocol"));

    monica.AddProjectUnits(options =>
    {
        options.ConventionOptions.EnableNameConvention = true;
    });
});
```

ProjectUnits now live in the focused `Monica.ProjectUnits` package. Their catalog is host-owned and available through `IProjectUnitCatalog`; it is not a static registry.

## What discovery enables

- Naming and dependency diagnostics.
- Runtime architecture views and `/framework/units` metadata.
- Agent skills that can reason about the application in Monica's own vocabulary.
- Consistent placement and collaboration rules across bounded contexts.

ProjectUnits are not annotations for an anemic model. Keep behavior on the object that owns the state, and use services for orchestration and boundaries.
