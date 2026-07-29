---
title: Quick Start
description: 安装并注册 EventBus。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.EventBus --prerelease
```

## 最小注册

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Monica.EventBus.Abstractions.Handlers;
using Monica.EventBus.Events;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddTransient<UserCreatedHandler>();

builder.AddMonica(monica =>
{
    monica.AddEventBus()
        .UseNoOpDistributedEventBus();
});

using var host = builder.Build();
await host.RunAsync();

public sealed class UserCreatedEvent : DomainEvent
{
    public string UserId { get; init; } = string.Empty;
}

public class UserCreatedHandler : ILocalEventHandler<UserCreatedEvent>
{
    public Task HandleEventAsync(
        UserCreatedEvent eventData,
        CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
```

只构建 ServiceProvider 不会激活自动发现的处理器。`RunAsync()` 会启动 Generic Host，使 EventBus 在 Provider 的 `StartAsync` 之前创建自动发现订阅。Web 应用使用相同模块注册，但需要在启动前对构建出的 `WebApplication` 依次调用 `UseMonica()` 和 `MapMonica()`。

## 第一个有价值的配置

如果你还没有接好真实的分布式消息基础设施，但宿主或其他模块已经需要 `IDistributedEventBus`，最简单的起步方式就是 `UseNoOpDistributedEventBus()`。

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
