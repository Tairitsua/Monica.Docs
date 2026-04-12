---
title: Configuration
description: EventBus 的公开选项、默认值与必需设置。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `DisableAutoDiscovery` | `bool` | `false` | 否 | 你想完全手动控制处理器订阅时 | 默认会扫描并自动收集实现 `IEventHandler` 的处理器。 |
