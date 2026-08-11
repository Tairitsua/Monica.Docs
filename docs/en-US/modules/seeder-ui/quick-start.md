---
title: Quick start
description: Add the Development Seeder dashboard to Monica's shared operations shell.
sidebar_position: 2
---

## Install

```bash
dotnet add package Monica.Framework.UI --prerelease
dotnet add package Monica.UI --prerelease
```

## Register the runtime and page

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddSeeder();
    monica.AddUIShell();
    monica.AddSeederUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Run the host in Development and open `/seeders`. The page appears under Monitor after Health Check in the default navigation order.

`AddSeederUI()` declares dependencies on Seeder, localization, and the shell. Keeping `AddSeeder()` explicit makes the runtime policy visible in the composition root and separates runtime readiness from page exposure.
