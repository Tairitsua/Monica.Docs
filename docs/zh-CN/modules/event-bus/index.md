---
title: EventBus
description: 提供统一的本地/分布式事件总线抽象、自动发现事件处理器，以及 keyed event bus 组合能力。
sidebar_position: 1
---

# EventBus

提供统一的本地/分布式事件总线抽象、自动发现事件处理器，以及 keyed event bus 组合能力。

## 何时使用这个模块

- 你要在 Monica 模块之间或宿主内部发布/订阅事件。
- 你需要本地事件与分布式事件统一的发布接口。
- 其他模块需要为某个特定 service key 绑定独立事件总线实例。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.EventBus` |
| 注册入口 | `monica.AddEventBus()` |
| 相关 UI 模块 | `monica.AddEventBusUI()` |

## 公开使用面

- `IEventBus`、`ILocalEventBus`、`IDistributedEventBus`：统一事件发布接口。
- `ILocalEventHandler<TEvent>`、`IDistributedEventHandler<TEvent>`：处理器契约。
- `DomainEvent`：领域事件基类。
- `IEventSubscriptionRegistry`：高级订阅管理入口。

本地与分布式处理器会通过 EventBus 自己的适配器进入统一 [Execution Pipeline](../execution-pipeline/index.md)。跨领域行为无需代理，可选 DynamicProxy 管线桥接也会排除这些处理器，避免同一次消费被包装两次。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [DynamicProxy（仅在需要自定义方法拦截时）](../dynamic-proxy/index.md)
