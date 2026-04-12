---
title: Scenarios
description: EventBus 的常见接入方式与使用陷阱。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 使用本地事件驱动模块内部协作

如果事件只在当前进程内消费，那么注册 `Mo.AddEventBus()` 就足够了。处理器会在启动时自动发现并订阅，本地发布方只需要注入 `IEventBus` 调用泛型 `PublishAsync<TEvent>()`。

```csharp
public sealed class UserService(IEventBus eventBus)
{
    public Task PublishAsync(string userId)
    {
        return eventBus.PublishAsync(new UserCreatedEvent
        {
            UserId = userId,
        });
    }
}
```

## 场景 2 — 给其他模块提供 keyed event bus

当某个模块需要绑定自己专属的事件总线 service key 时，推荐通过 `AddKeyedEventBus(...)` 或 `AddKeyedLocalEventBus(...)` 组合，而不是让模块自行绕过 EventBus 注册新容器。

## Common mistakes

- 设置 `DisableAutoDiscovery = true` 后，仍然期待处理器会自动订阅。
- 调用 `AddKeyedEventBus(key, useDistributed: true)` 却没有先配置分布式 Provider。
