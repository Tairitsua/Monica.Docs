---
title: Service Discovery
description: Register service instances and coordinate a registry through a chosen state store.
sidebar_position: 1
---

`Monica.ServiceDiscovery` manages instance metadata, registration state, health, registry leader election, and service queries. It requires an explicit state-store mode so a local host cannot accidentally pretend to be distributed.

```bash
dotnet add package Monica.ServiceDiscovery --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.DomainName = "Ordering";
        options.AppId = "orders-api";
        options.AppName = "Orders API";
    });

    monica.AddServiceDiscovery(options =>
        {
            options.EnableMinimalApi = true;
            options.MetadataEnvironmentVariables.Add("REGION");
        })
        .UseInMemoryStateStore();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`UseInMemoryStateStore()` selects single-instance mode and marks that instance as the registry server. For multi-instance deployment, configure a common distributed `IStateStore` first and call `UseDistributedStateStore()`; call `SetAsRegistryServer()` on the service that owns the catalog. `UseCustomKeyedStateStore(key)` reuses a previously registered keyed store.

Listening addresses are included in metadata by default. Identity and version fields fall back to `ConfigureApplication(...)`. Isolation defaults to `ContinueRunning`; registration wait timeout defaults to five minutes.

Minimal API endpoints expose registry and election status only when Minimal APIs are enabled. Treat leader release and other management operations as privileged endpoints. The optional `AddServiceDiscoveryUI()` module ships in `Monica.ServiceDiscovery`; register it separately when the host needs the operational page.
