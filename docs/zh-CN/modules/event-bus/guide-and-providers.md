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

## Module dependencies

- 很多高级模块会基于 EventBus 再构建更具体的运行时能力，例如 JobScheduler。
- 如果需要事件订阅可视化与测试能力，可接入 `Mo.AddEventBusUI()`。
