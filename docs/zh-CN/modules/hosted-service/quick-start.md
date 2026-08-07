---
title: 快速开始
description: 在 .NET Generic Host 中注册托管服务观测，并查询运行目录。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.Core --prerelease
```

## 注册 Generic Host

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Monica.Core.HostedService.Abstractions;
using Monica.Core.Modularity.Extensions;
using Monica.Core.ObservableInstance.Abstractions;
using Monica.Modules;

var builder = Host.CreateApplicationBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddHostedService();
});

// QueueConsumer 继承 MoBackgroundService，或同时实现
// IHostedService 与 IMoHostedService。
builder.Services.AddHostedService<QueueConsumer>();

using var host = builder.Build();
await host.StartAsync();

var registry = host.Services.GetRequiredService<IMoHostedServiceRegistry>();
var consumers = registry.GetServices<QueueConsumer>();

foreach (var consumer in consumers)
{
    Console.WriteLine($"{consumer.InstanceId}: {consumer.CurrentState}");
}

await host.StopAsync();

public sealed class QueueConsumer(
    IObservableInstanceRegistry observableInstances,
    IOptions<ModuleHostedServiceOption> options,
    IServiceScopeFactory scopeFactory,
    ILogger<QueueConsumer> logger)
    : MoBackgroundService(observableInstances, options, scopeFactory, logger)
{
    protected override Task ExecuteBackgroundAsync(CancellationToken stoppingToken) =>
        Task.Delay(Timeout.InfiniteTimeSpan, stoppingToken);
}
```

`monica.AddHostedService()` 用于注册 Monica 模块；`builder.Services.AddHostedService<TService>()` 则是标准 Generic Host 的应用服务注册。应用服务必须实现 `IMoHostedService` 才会出现在 Monica 目录中；继承 `MoHostedService` 或 `MoBackgroundService` 即可获得该契约。

## 运行行为

- 每个 `IHostedService` 描述符都必须是单例；标准 `AddHostedService<TService>()` 满足此规则。
- 目录会在应用托管服务进入 `StartAsync` 前发布。
- 同一具体类型的不同对象是允许的，并会获得不同的 `InstanceId`。
- 同一对象被重复注册会在该服务启动前被拒绝。
- `host.StopAsync()` 之后，目录会保留最终停止快照，直到 `host.Dispose()`。

## 后续阅读

- [配置](./configuration.md)说明历史记录、心跳和启动错误的默认值。
- [Guide 与运行时 API](./guide-and-providers.md)介绍身份、目录查询和检查点。
- [使用场景](./scenarios.md)展示多实例和依赖协调方式。
