---
title: Quick Start
description: 定义幂等 Seeder、依赖关系、重试与失败行为。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.Framework --prerelease
```

## 注册模块

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

## 定义依赖图

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

具体 `ISeeder` 类会自动发现。`ReferenceDataSeeder` 成功前，`SearchIndexSeeder` 不会启动；后者最多尝试三次，只有最后一次失败才会激活 `FailFast`。

不要假设 Cancellation 一定表示宿主正在停止。当另一个 Seeder 触发 `FailFast` 时，Scheduler 也会协作式取消正在运行的工作。
