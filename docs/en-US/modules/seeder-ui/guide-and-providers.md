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
    monica.AddUIShell(options =>
    {
        options.OperationalPageAccess.AuthorizationPolicy = "SystemDiagnostics";
    });
    monica.AddSeederUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

The shell policy is inherited by Module System, Health Check, Seeder, and other diagnostics that adopt Monica's operational access contract. Override only this page when it needs a different policy:

```csharp
monica.AddSeederUI(options =>
{
    options.AuthorizationPolicyOverride = "SeederDiagnostics";
});
```

Use authentication, HTTPS, network isolation, and least privilege around the shell. Bounded exception messages and type names can still disclose internal implementation details even though stack traces remain in logs.

For a deliberately isolated diagnostic host, `options.OperationalPageAccess.DebugMode = true` bypasses every inherited and page-specific policy in every environment. It is not the same as `ModuleShellUIOption.EnableDebug`, and Monica logs a startup warning when the authorization bypass is active.
