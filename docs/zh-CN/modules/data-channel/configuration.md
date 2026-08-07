---
title: Configuration
description: DataChannel 的公开选项、默认值与必需设置。
sidebar_position: 3
---

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `RecentExceptionToKeep` | `int` | `10` | 否 | 你希望保留更多最近异常记录时 | 影响单个 DataChannel 最近异常历史池大小。 |
| `InitThreadCount` | `int` | `10` | 否 | 你要调整通道初始化并行度时 | 通道较多时可根据宿主资源调优。 |

## Required setup

| Requirement | Satisfied by | Notes |
|---|---|---|
| `IDataChannelSetup` 实现 | `UseSetup<TSetup>()` | 模块把当前宿主的 `IDataChannelRegistrar` 传给该入口；缺少它会被视为必需 Guide 未满足。 |
