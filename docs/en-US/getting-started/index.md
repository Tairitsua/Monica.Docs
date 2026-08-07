---
title: Getting started with Monica
description: Install Monica, compose a host-bound module graph, and run the application.
sidebar_position: 1
---

This guide creates a small ASP.NET Core host with ProjectUnits and the JobScheduler dashboard. The composition is explicit, validated before the host is built, and isolated from other hosts in the same process.

For agent-assisted setup, start with [Agent setup](./agent-setup.md). It installs the repository-appropriate Monica development skills and previews managed instructions before changing the workspace.

## Install

```bash
dotnet add package Monica.ProjectUnits --prerelease
dotnet add package Monica.JobScheduler --prerelease
dotnet add package Monica.JobScheduler.UI --prerelease
```

To start from the official template instead:

```bash
dotnet new install Monica.Templates@{{monica.version}}
dotnet new monica-api -n Orders
```

## Compose the host

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.AppName = "Orders";
        options.AppId = "orders";
    });

    monica.ConfigureModuleSystem(options =>
    {
        options.DefaultApiGroupName = "Orders";
    });

    monica.AddProjectUnits(options =>
    {
        options.EnableMinimalApi = true;
        options.ConventionOptions.EnableNameConvention = true;
    });

    monica.AddJobScheduler()
        .UseInMemoryMetadataRepository()
        .UseSchedulerScope("orders")
        .UseInMemoryProvider();

    monica.AddJobSchedulerUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`AddMonica(...)` is the complete service-composition boundary. Web hosts then use `UseMonica()` for middleware and `MapMonica()` for Monica-owned endpoints. Console hosts only need `AddMonica(...)`.

## What to try next

1. Open `/job-scheduler` to inspect the scheduler runtime.
2. Add one `RecurringJob` and confirm its definition appears.
3. Open `/framework/units` to inspect discovered ProjectUnits.
4. Move from the in-memory provider to an Integration package only when the deployment needs it.

Continue with [ProjectUnits](../modules/project-units/index.md), [JobScheduler](../modules/job-scheduler/index.md), or the [Stable module catalog](../modules/index.md). For a domain-oriented application layout, use the Ordering reference application in the Monica repository.
