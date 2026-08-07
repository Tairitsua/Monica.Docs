---
title: Quick Start
description: Register Hosted Service observability in a .NET Generic Host and query its runtime catalog.
sidebar_position: 2
---

## Install the package

```bash
dotnet add package Monica.Core --prerelease
```

## Register a Generic Host

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Monica.Core.HostedService.Abstractions;
using Monica.Core.Modularity.Extensions;
using Monica.Core.ObservableInstance.Abstractions;
using Monica.Modules;

var builder = Host.CreateApplicationBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddHostedService();
});

// QueueConsumer derives from MoBackgroundService, or otherwise implements
// both IHostedService and IMoHostedService.
builder.Services.AddHostedService<QueueConsumer>();

using var host = builder.Build();
await host.StartAsync();

var registry = host.Services.GetRequiredService<IMoHostedServiceRegistry>();
var consumers = registry.GetServices<QueueConsumer>();

foreach (var consumer in consumers)
{
    Console.WriteLine($"{consumer.InstanceId}: {consumer.CurrentState}");
}

await host.StopAsync();

public sealed class QueueConsumer(
    IObservableInstanceRegistry observableInstances,
    IOptions<ModuleHostedServiceOption> options,
    IServiceScopeFactory scopeFactory,
    ILogger<QueueConsumer> logger)
    : MoBackgroundService(observableInstances, options, scopeFactory, logger)
{
    protected override Task ExecuteBackgroundAsync(CancellationToken stoppingToken) =>
        Task.Delay(Timeout.InfiniteTimeSpan, stoppingToken);
}
```

`monica.AddHostedService()` is the Monica module registration. `builder.Services.AddHostedService<TService>()` is the standard Generic Host registration for an application service. The application service must implement `IMoHostedService` to appear in the Monica registry; deriving from `MoHostedService` or `MoBackgroundService` supplies that contract.

## Runtime behavior

- Every `IHostedService` descriptor must be singleton. The standard `AddHostedService<TService>()` registration satisfies this rule.
- The registry is published before application hosted services enter `StartAsync`.
- Distinct objects of the same concrete type are allowed and receive different `InstanceId` values.
- Registering the same object more than once is rejected before that service starts.
- After `host.StopAsync()`, the registry retains final stopped runtime snapshots until `host.Dispose()`.

## What to read next

- [Configuration](./configuration.md) explains history, heartbeat, and startup-error defaults.
- [Registration and Runtime APIs](./guide-and-providers.md) covers identity, registry queries, and checkpoints.
- [Scenarios](./scenarios.md) shows multiple instances and dependency coordination.
