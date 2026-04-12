---
title: Scenarios
description: DataChannel 的常见接入方式与使用陷阱。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 把多个外部连接集中到同一个 Setup 里

当系统需要同时连接多个外部系统时，推荐在一个 `IDataChannelSetup` 中集中完成管道注册。这样你可以把“通道定义”与“宿主启动过程”明确绑定起来。

## 场景 2 — 把通道异常纳入统一运维面

模块已经提供状态列表、异常摘要、异常清理与重初始化 Facade/端点，适合把通信异常处理从散落日志升级为可观察的运维流程。

## Common mistakes

- 注册了 `Mo.AddDataChannel()` 却没有调用 `SetChannelBuilder<T>()`。
- 把 channel 注册逻辑散落在宿主各处，而不是统一放到 `IDataChannelSetup` 中。
