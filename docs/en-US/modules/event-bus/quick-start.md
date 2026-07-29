---
title: Quick Start
description: Register EventBus in a Generic Host and activate discovered handlers during startup.
sidebar_position: 2
---

# Quick Start

## Install the package

```bash
dotnet add package Monica.EventBus --prerelease
```

## Register and start the host

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Monica.Core.Modularity.Extensions;
using Monica.EventBus.Abstractions.Handlers;
using Monica.Modules;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddTransient<UserCreatedHandler>();

builder.AddMonica(monica =>
{
    monica.AddEventBus()
        .UseNoOpDistributedEventBus();
});

using var host = builder.Build();
await host.RunAsync();

public sealed record UserCreated(string UserId);

public sealed class UserCreatedHandler : ILocalEventHandler<UserCreated>
{
    public Task HandleEventAsync(
        UserCreated eventData,
        CancellationToken cancellationToken) => Task.CompletedTask;
}
```

Building the service provider is not enough to activate discovered handlers. `RunAsync()` starts the Generic Host, allowing EventBus to create its auto-discovered subscriptions before providers start.

Use a `WebApplicationBuilder` instead when the application also serves HTTP. Keep the same module registration, then call `UseMonica()` and `MapMonica()` on the built `WebApplication` before starting it.

## First useful provider choice

`UseNoOpDistributedEventBus()` makes a deliberately non-delivering distributed boundary explicit while local handlers remain active. Replace it with `UseDistributedEventBus<TProvider>()` when the host must publish outside the process.

## Next steps

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
