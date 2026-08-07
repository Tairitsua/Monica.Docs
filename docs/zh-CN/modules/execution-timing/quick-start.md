---
title: Quick Start
description: 注册 Execution Timing，并在 Generic Host 或 Web Host 中测量工作。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.Profiling --prerelease
```

## 在 Generic Host 中测量工作

默认的后台批处理模式可直接用于 `Host.CreateApplicationBuilder(...)`，无需 Web 应用或端点映射。

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.Profiling.ExecutionTiming.Abstractions;

var builder = Host.CreateApplicationBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddExecutionTiming();
});

using var host = builder.Build();
await host.StartAsync();

var timingFactory = host.Services.GetRequiredService<IExecutionTimingFactory>();
var timingQuery = host.Services.GetRequiredService<IExecutionTimingQuery>();

using (timingFactory.BeginScope("orders.import", "Import pending orders"))
{
    await Task.Delay(25);
}

var statistics = timingQuery.GetStatistics("orders.import");
Console.WriteLine(
    $"{statistics?.DisplayName}: {statistics?.ExecutionCount} samples, " +
    $"{statistics?.AverageDurationMs:0.##} ms average");

await host.StopAsync();
```

`BeginScope(...)` 会立即启动，并在释放时记录样本。后台模式下，公开统计查询会先排空待处理样本再返回，因此这次读取能够看到刚完成的作用域。

## 启用 Web 诊断端点

Web Host 使用同一个模块。将 `EnableMinimalApi` 设为 `true`，然后按正常顺序调用 `UseMonica()` 和 `MapMonica()` 完成 Monica Web 组合。

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddExecutionTiming(options =>
    {
        options.EnableMinimalApi = true;
    });
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

这会映射：

```text
GET /execution-timing/statistics
GET /execution-timing/running
```

第一条路由返回按平均耗时排序的已完成聚合，第二条返回按当前耗时排序的活动 Invocation。

## 自动测量业务操作

`AddExecutionTiming()` 还会向 [Execution Pipeline](../execution-pipeline/index.md) 贡献诊断 Behavior。原生 Monica Adapter 中所有标记为业务操作的描述符都会自动计时，无需再用手工作用域包裹。

## 接下来读什么

- [Configuration](./configuration.md) 说明聚合与端点默认值。
- [注册扩展与运行时 API](./guide-and-providers.md) 说明 Factory 和 Query 契约。
- [Scenarios](./scenarios.md) 展示可复用 Recorder 和运维诊断用法。
