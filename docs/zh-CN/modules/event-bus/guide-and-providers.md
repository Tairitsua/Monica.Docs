---
title: Guide and Providers
description: EventBus 的 Guide 方法、Provider 选择与依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `UseDistributedEventBus<TProvider>()` | 注册默认分布式事件总线 Provider | 否 | 你已经有真实分布式事件总线实现时。 |
| `UseNoOpDistributedEventBus()` | 注册空操作分布式事件总线 | 否 | 本地开发或暂时不发布分布式事件时。 |
| `AddKeyedEventBus(string key, bool useDistributed = false)` | 为指定 service key 注册 `IEventBus` | 否 | 某个模块要绑定独立的本地/分布式总线实例时。 |
| `AddKeyedLocalEventBus(string key)` | 为指定 service key 注册本地事件总线 | 否 | 你只需要 keyed local bus，而不是统一 `IEventBus` 映射时。 |

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| 本地事件总线 | 模块默认注册 | 同进程内的领域事件和模块内协作。 |
| No-Op 分布式 Provider | `UseNoOpDistributedEventBus()` | 开发环境或不需要真正外发消息时。 |
| 自定义分布式 Provider | `UseDistributedEventBus<TProvider>()` | 接入真实消息基础设施时。 |

## Subscription registry

`IEventSubscriptionRegistry` 是高级订阅管理边界，所有修改 API 都接受 `CancellationToken`：

- `SubscribeAsync(...)` 创建一个活动订阅。
- `SubscribeBatchAsync(...)` 会逐项创建；后续项失败时，会先回滚本次调用已创建的条目再传播错误。创建期间的观察者通知不会被原子隐藏。
- `UnsubscribeAsync(...)` 移除一个订阅。
- `UnsubscribeBatchAsync(...)` 会尝试所有请求的 ID，再统一报告失败。
- 按谓词、事件类型、处理器类型与 service key 移除的 API 也遵循同一可取消契约。

Registry 继续通过 `IObservable<EventSubscriptionChange>` 提供现有通知契约。Provider shutdown 仍负责最终外部资源清理；应用不应只根据内存 Registry 通知推断外部 Broker 状态。

## Module dependencies

- EventBus 依赖 [Execution Pipeline](../execution-pipeline/index.md)，处理器通过 EventBus 自己的 Adapter 进入管线，避免重复应用 DynamicProxy bridge。
- 模块拥有的自动发现 lifecycle 会在 Generic Host 启动期间以受回滚保护的批次创建订阅；失败或取消会清理本次调用已创建的条目。
- 如果需要事件订阅可视化与测试能力，可接入 `monica.AddEventBusUI()`。
