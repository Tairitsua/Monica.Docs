---
title: Guide and Providers
description: Understand AutoControllers registration and RPC transport selection.
sidebar_position: 4
---

# Guide and Providers

## Runtime guide

`ModuleAutoControllersGuide` has no additional required Guide methods. Register the module through `monica.AddAutoControllers(...)`; it brings in MVC endpoint mapping, API Explorer, ordinary controller discovery, and CRUD controller discovery.

`ModuleAutoControllers` declares an `AutoModel` dependency for conventional CRUD filtering.

## Generator ownership

`Monica.Generators.AutoController` is a compile-time analyzer dependency. Reference it privately in each assembly that compiles endpoint requests or `ApplicationService` handlers. It does not write RPC snapshots into the project tree and does not require a producer-first build.

## RPC runtime providers

Generating both transports does not select the runtime transport. The host must make that choice:

```csharp
builder.AddMonica(monica =>
{
    monica.AddRpcClient()
        .ConfigDomainInfoProvider(new AppRpcClientDomainInfoProvider())
        .UseLocalTransport();
});
```

- Use `UseLocalTransport()` when caller and provider share one process.
- Use `UseHttpTransport()` with an HTTP registration provider when they run separately.
- The domain info provider determines which generated domain clients are registered for the host.
