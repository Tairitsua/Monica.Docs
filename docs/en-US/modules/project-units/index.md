---
title: ProjectUnits
description: Give DDD application roles a discoverable, host-scoped runtime model.
sidebar_position: 1
---

# ProjectUnits

`Monica.ProjectUnits` discovers application services, request DTOs, domain services, entities, repositories, domain and local events, handlers, configuration types, and scheduled jobs. It connects those roles into a host-scoped catalog that humans, coding agents, and diagnostic UI can inspect.

```bash
dotnet add package Monica.ProjectUnits --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.ProjectUnits.Models;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddProjectUnits(options =>
    {
        options.EnableMinimalApi = true;
        options.ConventionOptions.EnableNameConvention = true;
        options.ConventionOptions.NameConventionMode =
            ENameConventionMode.Warning;
    });
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

With `EnableMinimalApi = true`, `GET /framework/units` returns the discovered catalog. XML documentation details are parsed by default; set `ParseUnitDetails = false` when the host does not produce or need XML documentation. Naming checks are disabled by default and report warnings when enabled unless a rule selects a different mode.

ProjectUnits derives the CRUD application-service suffix from the host's `CrudControllerOption` when AutoControllers is present, so route naming and architectural diagnostics share one source of truth.

Request filtering is disabled by default. Enabling `EnableRequestFilter` adds runtime request-filter management; treat it as an operational control and protect its endpoints appropriately.

Read [ProjectUnits as an architecture contract](../../concepts/project-units.md) for the role model and dependency view.
