---
title: Quick Start
description: 安装并注册 EventBus。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.EventBus
```

## 最小注册

```csharp
using Monica.EventBus.Abstractions.Handlers;
using Monica.EventBus.Events;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddEventBus()
    .UseNoOpDistributedEventBus();

builder.UseMonica();

public sealed class UserCreatedEvent : DomainEvent
{
    public string UserId { get; init; } = string.Empty;
}

public sealed class UserCreatedHandler : ILocalEventHandler<UserCreatedEvent>
{
    public Task HandleEventAsync(UserCreatedEvent eventData)
    {
        return Task.CompletedTask;
    }
}
```

## 第一个有价值的配置

如果你还没有接好真实的分布式消息基础设施，但宿主或其他模块已经需要 `IDistributedEventBus`，最简单的起步方式就是 `UseNoOpDistributedEventBus()`。

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
