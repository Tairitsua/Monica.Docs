---
title: Quick Start
description: Register an interceptor for one interface-based application service.
sidebar_position: 2
---

# Quick Start

## Install the package

```bash
dotnet add package Monica.DependencyInjection --prerelease
```

## Define an interceptor

```csharp
using Microsoft.Extensions.Logging;
using Monica.DependencyInjection.DynamicProxy.Abstractions;

public sealed class InvocationLoggingInterceptor(
    ILogger<InvocationLoggingInterceptor> logger)
    : InvocationInterceptor
{
    public override async Task InterceptAsync(IMethodInvocation invocation)
    {
        logger.LogInformation(
            "Calling {ServiceType}.{Method}.",
            invocation.TargetObject.GetType().Name,
            invocation.Method.Name);

        await invocation.ProceedAsync();
    }
}
```

`ProceedAsync()` invokes the next interceptor or the target method. An interceptor may inspect arguments before proceeding and inspect or replace `ReturnValue` afterward.

## Select a service registration

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IOrderPricingService, OrderPricingService>();

builder.AddMonica(monica =>
{
    monica.AddDynamicProxy()
        .AddInterceptor<InvocationLoggingInterceptor>(
            context => context.ServiceType == typeof(IOrderPricingService));
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Because `IOrderPricingService` is an interface service type, Monica uses `InterfaceProxy` by default. `OrderPricingService` may remain sealed and its methods do not need to be virtual.

The predicate selects a service registration while Monica composes the host. It does not run per invocation. If only some methods need special treatment, inspect `invocation.Method` inside the interceptor.

## What to read next

- [Configuration](./configuration.md) explains the proxy-kind defaults and diagnostics option.
- [Guide and Proxy Kinds](./guide-and-providers.md) explains every Guide method.
- [Scenarios](./scenarios.md) covers class proxies and the Execution Pipeline bridge.
