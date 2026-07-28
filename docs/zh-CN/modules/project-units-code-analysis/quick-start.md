---
title: 快速开始
description: 注册源码分析，并从选定 C# 项目生成项目单元目录。
sidebar_position: 2
---

# 快速开始

## 安装包

```bash
dotnet add package Monica.ProjectUnits.CodeAnalysis --prerelease
```

## 注册模块

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

## 分析选定项目

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

只要任一选定项目无法加载或编译，`catalog.IsPartial` 就会为 `true`。消费方应保留诊断，不能把部分结果展示为完整工作区覆盖率。
