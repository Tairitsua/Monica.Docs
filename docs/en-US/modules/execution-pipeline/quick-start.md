---
title: Quick Start
description: Register a typed execution behavior for Monica-owned boundaries.
sidebar_position: 2
---

# Quick Start

## Install the package

```bash
dotnet add package Monica.Core --prerelease
```

## Create a behavior

This open generic behavior measures any compatible execution selected by the host:

```csharp
using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Monica.Core.Execution;

public sealed class ExecutionTimingBehavior<TInput, TResult>(
    ILogger<ExecutionTimingBehavior<TInput, TResult>> logger)
    : IExecutionBehavior<TInput, TResult>
{
    public async Task<TResult> ExecuteAsync(
        ExecutionContext<TInput> context,
        ExecutionDelegate<TResult> next)
    {
        var started = Stopwatch.GetTimestamp();

        try
        {
            return await next();
        }
        finally
        {
            logger.LogInformation(
                "Execution {OperationName} completed in {Elapsed}.",
                context.Descriptor.OperationName,
                Stopwatch.GetElapsedTime(started));
        }
    }
}
```

A behavior may return without calling `next` to short-circuit. If it continues, it may call `next` at most once.

## Register it

```csharp
using Monica.Core.Execution;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddExecutionPipeline()
        .AddBehavior(
            typeof(ExecutionTimingBehavior<,>),
            ExecutionBehaviorOrder.Diagnostics + 200,
            descriptor => descriptor.IsBusinessOperation);

    monica.AddMediator();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`AddBehavior(...)` owns the behavior's dependency-injection registration. Do not also call `builder.Services.AddTransient(...)` for the same implementation type.

The descriptor predicate runs when Monica first builds the immutable plan for a boundary. It must depend only on descriptor metadata, not request or user state.

## What to read next

- [Configuration](./configuration.md) explains ordering, filtering, and lifetimes.
- [Guide and Adapters](./guide-and-providers.md) lists the native boundaries.
- [Scenarios](./scenarios.md) covers point-specific behavior and explicit job transactions.
