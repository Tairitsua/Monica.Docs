---
title: Guide and Requirement Resolver
description: Register requirement navigation while preserving unresolved IDs and catalog availability.
sidebar_position: 4
---

# Guide and Requirement Resolver

`AddProjectUnits()` returns `ModuleProjectUnitsGuide`. Its application extension point is `UseRequirementLinkResolver<TResolver>()`.

## Implement the resolver

```csharp
using Monica.ProjectUnits.Abstractions;
using Monica.ProjectUnits.Models;

public sealed class RequirementLinkResolver
    : IProjectUnitRequirementLinkResolver
{
    public ValueTask<ProjectUnitRequirementLink?> ResolveAsync(
        string requirementId,
        CancellationToken cancellationToken = default)
    {
        var href = $"/workflow/requirements/{Uri.EscapeDataString(requirementId)}";
        return ValueTask.FromResult<ProjectUnitRequirementLink?>(
            new ProjectUnitRequirementLink(requirementId, href));
    }
}
```

## Register it

```csharp
builder.AddMonica(monica =>
{
    monica.AddProjectUnits()
        .UseRequirementLinkResolver<RequirementLinkResolver>();
});
```

The resolver is scoped and runs only for `GetProjectUnitDetailAsync(key)` or `GET /framework/units/{key}`. List and dashboard queries do not resolve links.

Return `null` for unknown IDs. Monica keeps those IDs visible and non-clickable. Resolver exceptions are isolated per reference, and unsafe links are discarded, so one external documentation failure cannot hide the architecture catalog.

The built-in no-op resolver requires no configuration and leaves every requirement unresolved.
