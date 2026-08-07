---
title: Scenarios
description: 组合本地与分布式处理器、管理订阅并验证生产生命周期行为。
sidebar_position: 5
---

## 场景 1 — 使用本地事件驱动模块内部协作

如果事件只在当前进程内消费，那么注册 `monica.AddEventBus()` 就足够了。处理器会在组合阶段被发现，并在 Generic Host 启动期间、Provider 的 `StartAsync` 之前完成订阅。本地发布方只需要注入 `ILocalEventBus` 调用泛型 `PublishAsync<TEvent>()`。

```csharp
public sealed class UserService(ILocalEventBus eventBus)
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

## 场景 3 — 组合自动订阅与手动订阅

宿主启动后，可以通过 `IEventSubscriptionRegistry` 创建由应用拥有的手动订阅。EventBus 会单独记录自动发现生命周期创建的 ID，因此关闭宿主时只会按创建顺序的逆序移除这些生命周期订阅，不会移除手动订阅。

一组订阅需要回滚保护时使用 `SubscribeBatchAsync(...)`。条目及观察者通知会逐项产生；后续项失败或启动被取消时，本次调用已经创建的订阅会在错误传播前被移除。清理多个订阅时使用 `UnsubscribeBatchAsync(...)`；它会尝试所有请求的 ID，再统一报告失败。

## 验证生产组合

原始 `ProjectUnitFixture<TUnit>` 会刻意跳过模块发现、统一执行管线、约定注册和 Hosted lifecycle。它可以验证处理器逻辑，但不能证明运行时订阅、行为组合或容器拥有的处理器激活。

激活或投递回归测试应构建使用生产模块组合的完整 Monica 测试宿主，发布或分发到目标处理器，并验证预期生命周期与行为链路。参见[测试 Monica 应用](../../guides/testing-monica-applications.md)。

## Common mistakes

- 设置 `DisableAutoDiscovery = true` 后，仍然期待处理器会自动订阅。
- 调用 `AddKeyedEventBus(key, useDistributed: true)` 却没有先配置分布式 Provider。
- 只通过原始处理器 Fixture 验证自动订阅行为。
