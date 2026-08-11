---
title: Registration and access boundary
description: Compose the Seeder page with the runtime and protect production diagnostics.
sidebar_position: 4
---

## Registration

| Method | What it adds | Dependencies |
|---|---|---|
| `monica.AddSeederUI(...)` | `/seeders`, localized Monitor navigation, page session, and access policy. | Seeder runtime, localization, and Shell UI. |

The UI has no durable-history or execution provider. It reads `SeederFacade` for the current process. All execution policy belongs to `monica.AddSeeder(...)` and the discovered seeder annotations.

## Protected non-Development access

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SystemDiagnostics", policy =>
        policy.RequireRole("Operations"));
});

builder.AddMonica(monica =>
{
    monica.AddSeeder();
    monica.AddUIShell();
    monica.AddSeederUI(options =>
    {
        options.EnableOutsideDevelopment = true;
        options.AuthorizationPolicy = "SystemDiagnostics";
    });
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Use authentication, HTTPS, network isolation, and least privilege around the shell. Bounded exception messages and type names can still disclose internal implementation details even though stack traces remain in logs.
