---
title: Quick start
description: Add the Development Health Check dashboard to Monica's shared UI shell.
sidebar_position: 2
---

## Install

```bash
dotnet add package Monica.HealthCheck.UI --prerelease
dotnet add package Monica.UI --prerelease
```

## Register the runtime and page

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddHealthCheck();
    monica.AddUIShell();
    monica.AddHealthCheckUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Run the host in Development and open `/health-checks`. The page appears under the Monitor navigation category. Probe endpoints remain available independently at `/health` and `/alive`.

`AddHealthCheckUI()` declares dependencies on Health Check, localization, and the shell, but registering the runtime and shell explicitly keeps the composition root clear and gives the host an obvious place to configure their options.
