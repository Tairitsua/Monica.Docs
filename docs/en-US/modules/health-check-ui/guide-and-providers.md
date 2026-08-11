---
title: Registration and access boundary
description: Compose the Health Check page with the shell and protect production access.
sidebar_position: 4
---

## Registration

| Method | What it adds | Dependencies |
|---|---|---|
| `monica.AddHealthCheckUI(...)` | `/health-checks`, localized Monitor navigation, page session, and access policy. | Health Check runtime, localization, and Shell UI. |

The UI has no storage or remote-monitoring provider. It reads `HealthCheckFacade` for the current process and displays only its sanitized model.

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
    monica.AddHealthCheck();
    monica.AddUIShell();
    monica.AddHealthCheckUI(options =>
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

The policy protects the dashboard, not the platform probes. Keep authentication middleware, HTTPS, network isolation, and least-privilege policy requirements in place. Health descriptions and bounded error messages may still reveal internal component names even though credential-like data is redacted.
