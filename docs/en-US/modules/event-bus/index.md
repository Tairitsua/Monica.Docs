---
title: EventBus
description: Publish local events now and add a distributed provider when deployment requires one.
sidebar_position: 1
---

# EventBus

`Monica.EventBus` supplies a host-local `ILocalEventBus`, handler discovery, subscriptions, and a provider boundary for distributed events. Start local; add an Integration such as `Monica.EventBus.Kafka` only when events must cross processes.

```bash
dotnet add package Monica.EventBus --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.EventBus.Abstractions;
using Monica.EventBus.Abstractions.Handlers;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddTransient<OrderApprovedHandler>();

builder.AddMonica(monica =>
{
    monica.AddEventBus();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

public sealed record OrderApproved(Guid OrderId);

public class OrderApprovedHandler : ILocalEventHandler<OrderApproved>
{
    public Task HandleEventAsync(
        OrderApproved eventData,
        CancellationToken cancellationToken) => Task.CompletedTask;
}

public sealed class ApprovalPublisher(ILocalEventBus eventBus)
{
    public Task PublishAsync(Guid id) =>
        eventBus.PublishAsync(new OrderApproved(id));
}
```

Automatic discovery is enabled by default for concrete `ILocalEventHandler<T>` and `IDistributedEventHandler<T>` implementations. Dispatch uses the **exact published event type and topic**; a handler for a base type is not a catch-all for derived events.

| Guide method | Use |
|---|---|
| `UseDistributedEventBus<TProvider>()` | Registers the default distributed provider. |
| `UseNoOpDistributedEventBus()` | Makes an intentionally non-delivering distributed boundary explicit in tests or local hosts. |
| `AddKeyedEventBus(key, useDistributed)` | Exposes a keyed `IEventBus` for a module or subsystem. |
| `AddKeyedLocalEventBus(key)` | Creates a keyed local bus instance. |

Set `DisableAutoDiscovery = true` only when the host will manage subscriptions itself.

Handlers may be sealed when they are not class-proxied. Keep a concrete handler inheritable when a DynamicProxy interceptor selects it. See [handler and delivery scenarios](./scenarios.md).
