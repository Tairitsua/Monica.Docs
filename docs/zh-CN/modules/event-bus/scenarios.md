---
title: Scenarios
description: 组合本地与分布式处理器、类代理拦截和投递故障排查。
sidebar_position: 5
---

# Scenarios

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

## 场景 3 — 可选地为处理器应用自定义 DynamicProxy 拦截器

EventBus 处理器已经通过 EventBus 适配器进入统一执行管线。授权、UnitOfWork、诊断、路由和应用行为都不需要 DynamicProxy；管线桥接还会明确排除已经由适配器拥有的处理器，避免重复执行。

EventBus 可以发现具体的 `ILocalEventHandler<TEvent>` 和 `IDistributedEventHandler<TEvent>` 实现，无论它们是否声明为 `sealed`。只有当宿主配置了自定义 DynamicProxy 拦截器，并且谓词选中了以具体类型注册的处理器时，才会增加类代理约束。

Castle 会通过继承处理器来实现类代理。因此处理器类必须可继承，`HandleEventAsync` 也必须保持虚方法语义。继承 Monica 抽象处理器基类的实现已经 `override` 了抽象方法；应用类代理拦截器时，还应让具体处理器保持非 `sealed`。

EventBus 自动发现会按具体处理器类型解析处理器，因此被选中的处理器会使用类代理，并且必须保持可继承。如果处理器不需要自定义拦截，应收窄拦截器谓词。`InterfaceProxy` 仍适用于通过接口暴露并解析的普通服务，但不能直接替代 EventBus 默认自动发现路径中的类代理。完整决策规则见 [DynamicProxy 场景](../dynamic-proxy/scenarios.md)。

## 场景 4 — 组合自动订阅与手动订阅

宿主启动后，可以通过 `IEventSubscriptionRegistry` 创建由应用拥有的手动订阅。EventBus 会单独记录自动发现生命周期创建的 ID，因此关闭宿主时只会按创建顺序的逆序移除这些生命周期订阅，不会移除手动订阅。

一组订阅需要回滚保护时使用 `SubscribeBatchAsync(...)`。条目及观察者通知会逐项产生；后续项失败或启动被取消时，本次调用已经创建的订阅会在错误传播前被移除。清理多个订阅时使用 `UnsubscribeBatchAsync(...)`；它会尝试所有请求的 ID，再统一报告失败。

## 故障排查 — Dapr 在处理器执行前反复投递

下面的错误特征说明问题发生在处理器激活阶段，而不是事件发布或下游 SignalR 客户端：

```text
System.TypeLoadException: Could not load type 'Castle.Proxies.SomeHandlerProxy' ...
because the parent type is sealed.
```

此时消息已经到达订阅应用，但依赖注入无法创建处理器代理。处理器方法根本没有开始执行，因此它自己的日志、状态修改或 SignalR 调用都会缺失。订阅端返回 `RETRY` 后，Dapr 会根据部署环境的 resiliency 和死信配置重新投递。对于 Kafka 这类有序 Broker，尚未确认的记录可能阻止消费者推进当前分区，使该分区后续事件看起来也像丢失了。

应按顺序检查整条链路：

1. 确认发布方已经向预期 Topic 发布事件。
2. 确认 Dapr sidecar 已将 Topic 投递到订阅应用。
3. 在进入 `HandleEventAsync` 内部排查前，先检查应用日志中是否存在处理器激活或代理生成失败。
4. 如果同一个已认证 SignalR 连接仍能收到其他调用，在出现相反证据前，应认为账号、WebSocket 路由、Hub 和 backplane 正常。
5. 修正代理契约并重新部署；不要把反复投递当作 SignalR 重连问题。

重试间隔和最终处理结果由部署的 Dapr 组件与 resiliency policy 决定，不属于 EventBus 处理器发现规则。

## 验证生产组合

原始 `ProjectUnitFixture<TUnit>` 会刻意跳过模块发现、统一执行管线、DynamicProxy 和 Hosted lifecycle。它可以验证处理器逻辑，但不能证明运行时行为组合或自定义代理后的处理器激活。

代理相关回归测试应构建使用生产模块组合的完整 Monica 测试宿主，解析或分发到目标处理器，并验证预期拦截链路。参见[测试 Monica 应用](../../guides/testing-monica-applications.md)。

## Common mistakes

- 设置 `DisableAutoDiscovery = true` 后，仍然期待处理器会自动订阅。
- 调用 `AddKeyedEventBus(key, useDistributed: true)` 却没有先配置分布式 Provider。
- 误以为所有 `sealed` 事件处理器都无效，即使没有任何类代理拦截器选中它。
- 订阅应用已经记录激活失败后，仍然只排查 SignalR 客户端代码。
