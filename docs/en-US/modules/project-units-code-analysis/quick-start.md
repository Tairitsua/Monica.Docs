---
title: Quick Start
description: Register source analysis and build a ProjectUnit catalog from selected C# projects.
sidebar_position: 2
---

# Quick Start

## Install the package

```bash
dotnet add package Monica.ProjectUnits.CodeAnalysis --prerelease
```

## Register the module

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddProjectUnitCodeAnalysis();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
```

## Analyze selected projects

```csharp
using Monica.ProjectUnits.CodeAnalysis.Abstractions;
using Monica.ProjectUnits.CodeAnalysis.Models;

var analyzer = app.Services.GetRequiredService<IProjectUnitSourceAnalyzer>();
var root = Path.GetFullPath(@"D:\Code\Ordering");
var projects = new[]
{
    Path.Combine(root, "src", "Ordering.Api", "Ordering.Api.csproj"),
    Path.Combine(root, "src", "Ordering.Domain", "Ordering.Domain.csproj")
};

var progress = new Progress<ProjectUnitSourceAnalysisProgress>(value =>
    Console.WriteLine($"{value.Stage}: {value.Completed}/{value.Total} {value.CurrentProject}"));

var catalog = await analyzer.AnalyzeAsync(
    new ProjectUnitSourceAnalysisRequest(root, projects),
    progress,
    CancellationToken.None);
```

`catalog.IsPartial` is `true` when any selected project could not be loaded or compiled. Preserve the diagnostics and do not present partial coverage as complete workspace coverage.
