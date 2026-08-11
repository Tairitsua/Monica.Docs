---
title: Quick start
description: Define idempotent seeders, dependencies, retries, and failure behavior.
sidebar_position: 2
---

## Install

```bash
dotnet add package Monica.Framework --prerelease
```

## Register the module

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Framework.Seeder.Models;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddSeeder(options =>
    {
        options.MaxConcurrency = 4;
        options.DefaultFailureBehavior = SeederFailureBehavior.ContinueAndRecord;
    });
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

## Define the graph

```csharp
using Monica.Framework.Seeder.Abstractions;
using Monica.Framework.Seeder.Annotations;
using Monica.Framework.Seeder.Models;

public sealed class ReferenceDataSeeder(ILogger<ReferenceDataSeeder> logger) : ISeeder
{
    public Task SeedAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Ensuring reference data exists.");
        return Task.CompletedTask;
    }
}

[SeederDependsOn<ReferenceDataSeeder>]
[SeederPolicy(
    MaxAttempts = 3,
    FailureBehavior = SeederFailureBehavior.FailFast)]
public sealed class SearchIndexSeeder(ILogger<SearchIndexSeeder> logger) : ISeeder
{
    public Task SeedAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Building the initial search index.");
        return Task.CompletedTask;
    }
}
```

Concrete `ISeeder` classes are discovered automatically. `SearchIndexSeeder` cannot start until `ReferenceDataSeeder` succeeds. It can retry up to three attempts; only its terminal failure activates `FailFast`.

Do not assume that cancellation always means the host is stopping. The scheduler also cancels in-flight work cooperatively when another seeder triggers `FailFast`.
