---
title: Configuration
description: EventBus 的公开选项、默认值与必需设置。
sidebar_position: 3
---

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `DisableAutoDiscovery` | `bool` | `false` | 否 | 你想完全手动控制处理器订阅时 | 默认会扫描并自动收集实现 `IEventHandler` 的处理器。 |

## 启动与关闭所有权

当自动发现启用时，EventBus 会在 Generic Host 的 `StartingAsync` 阶段创建一个受回滚保护的订阅批次。启动失败或取消时，会先移除该调用已经创建的订阅，再传播错误。关闭宿主时，模块只按逆序移除自己创建的订阅 ID；通过 `IEventSubscriptionRegistry` 手动创建的订阅仍归调用方所有。

Registry 修改方法都接受 `CancellationToken`。批量取消订阅会尝试所有请求的 ID，再统一报告失败或取消，因此清理不会因为第一项异常而提前停止。

批量创建会逐项执行，Registry 观察者会在每一项创建时收到通知；其保证是最终 Registry 结果能够回滚，而不是让中间通知原子地不可见。
