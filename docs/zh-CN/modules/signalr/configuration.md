---
title: Configuration
description: SignalR 的公开选项、默认值与必需设置。
sidebar_position: 3
---

# Configuration

## Module options

这个模块没有需要优先调整的公开 `ModuleOption` 字段；大多数使用方式集中在额外选项或 Guide 方法上。

## Required setup

| Requirement | Satisfied by | Notes |
|---|---|---|
| SignalR 基础注册 | `AddSignalR<TIHubOperator, THubOperator, TContract, TUser>()` | 模块通过 `GetRequestedConfigMethodKeys()` 显式要求这一步。 |
| Hub 路由映射 | `MapSignalRHub<THub>(pattern)` | 虽然不是模块校验键，但没有这一步就没有可访问的 Hub 路由。 |
