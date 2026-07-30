---
title: EventBus
description: 提供统一的本地/分布式事件总线抽象、自动发现事件处理器，以及 keyed event bus 组合能力。
sidebar_position: 1
---

# EventBus

提供统一的本地/分布式事件总线抽象、自动发现事件处理器，以及 keyed event bus 组合能力。EventBus 是 Generic Host 模块，不要求 Web Host；Web 应用只是在相同注册基础上额外完成 `UseMonica()` 与 `MapMonica()`。

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

自动发现订阅会在 Generic Host 启动期间、Provider 的 `StartAsync` 之前以受回滚保护的批次创建。启动失败或取消时，EventBus 会先删除该批次已经创建的条目，再传播启动错误；关闭宿主时只会按逆序移除生命周期拥有的订阅 ID，不会删除应用手动创建的订阅。

本地与分布式处理器会通过 EventBus 自己的适配器进入统一 [Execution Pipeline](../execution-pipeline/index.md)，让每次投递只有一个明确的执行边界。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
