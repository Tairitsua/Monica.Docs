---
title: StateStore
description: Store typed state through one in-memory or distributed provider boundary.
sidebar_position: 1
---

`Monica.StateStore` defines typed key-value operations, TTLs, bulk operations, key scanning, and optimistic concurrency through ETags. Its default `IStateStore` is host-local memory, so the smallest setup is explicit and has no external dependency.

```bash
dotnet add package Monica.StateStore --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.StateStore.Abstractions;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddStateStore();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

public sealed class DraftStore(IStateStore stateStore)
{
    public Task SaveAsync(Guid id, string value, CancellationToken token) =>
        stateStore.SaveStateAsync(
            $"draft:{id}",
            value,
            token,
            TimeSpan.FromHours(1));
}
```

Use `SetCommonDistributedStateStoreProvider<TProvider>()` to register the shared distributed provider, then set `UseDistributedProviderAsDefault = true` or register keyed stores with `AddKeyedCommonStateStore(key, useDistributed: true)`. `AddKeyedStateStore<TProvider>(key)` is available when one subsystem needs a dedicated implementation.

The Stable `Monica.StateStore` package does not include a durable backend. `Monica.StateStore.StackExchange` and Dapr adapters are **Integrations**. Configure one before selecting distributed storage; Monica fails startup if a distributed common provider is required but absent.

Memory state is process-local and is lost at restart. It is appropriate for caches, local coordination, and development—not shared locks or recoverable workflow state.
