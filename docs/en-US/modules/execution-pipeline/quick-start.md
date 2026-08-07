---
title: Quick Start
description: Register a typed execution behavior and inspect its observed runtime plans.
sidebar_position: 2
---

## Install the package

```bash
dotnet add package Monica.Core --prerelease
dotnet add package Monica.Framework.UI --prerelease
```

`Monica.Framework.UI` is optional. Install it only when the host should expose the built-in catalog page.

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
                context.Descriptor.DisplayName,
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
    monica.AddExecutionPipelineUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`AddBehavior(...)` owns the behavior's dependency-injection registration. Do not also call `builder.Services.AddTransient(...)` for the same implementation type.

The descriptor predicate runs when Monica first builds the immutable plan for a boundary. It must depend only on descriptor metadata, not request or user state.

## Open the runtime catalog

Start the application and open:

```text
/execution-pipeline
```

The page always shows the host's behavior registrations. Its plan list initially can be empty: an exact plan appears only after that descriptor executes or application code explicitly calls `IExecutionPipelineCatalog.InspectPlan(descriptor)`. Use **Refresh** to read the latest in-memory snapshot; the page does not poll or execute operations on your behalf.

## What to read next

- [Configuration](./configuration.md) explains ordering, filtering, and lifetimes.
- [Registration Extensions and Adapters](./guide-and-providers.md) lists the native boundaries and catalog APIs.
- [Scenarios](./scenarios.md) covers point-specific behavior and explicit job transactions.
