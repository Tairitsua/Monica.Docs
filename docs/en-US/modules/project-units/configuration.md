---
title: Configuration
description: Configure project-unit discovery details, naming diagnostics, request filtering, and the UI page.
sidebar_position: 3
---

## `ModuleProjectUnitsOption`

| Property | Type | Default | Effect |
|---|---|---|---|
| `ConventionOptions` | `ProjectUnitNamingOptions` | `new()` | Defines global and per-type naming diagnostics. |
| `EnableRequestFilter` | `bool` | `false` | Enables host-local request-filter middleware and management endpoint. |
| `ParseUnitDetails` | `bool` | `true` | Loads XML type and method summaries and declares the XML Documentation dependency. |

`ParseUnitDetails` can satisfy **description coverage** through a type's XML summary, but it does not satisfy explicit metadata, ownership, or requirement coverage.

## Naming diagnostics

```csharp
using Monica.ProjectUnits.Models;

builder.AddMonica(monica =>
{
    monica.AddProjectUnits(options =>
    {
        options.ConventionOptions.EnableNameConvention = true;
        options.ConventionOptions.NameConventionMode = ENameConventionMode.Warning;
    });
});
```

Start with `Warning` when adopting an existing service. Category-specific rules belong in `ConventionOptions.Dict`. Missing metadata is coverage debt rather than a naming violation; malformed explicit metadata appears as a catalog alert.

## UI option

`ModuleProjectUnitsUIOption.DisablePage` defaults to `false`. Set it to `true` when another application owns the operational UI but the host still needs the ProjectUnits catalog.

The dashboard is manually refreshed because discovery is stable after host startup.
