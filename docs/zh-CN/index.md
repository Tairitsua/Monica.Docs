---
title: Monica 文档
description: Monica 的 zh-CN 重构版文档入口。
sidebar_position: 1
---

# Monica 文档

Monica 是一个模块化的 .NET 基础设施库。每个模块都遵循统一的 `Mo.Add*()` 注册模式，并围绕 `ModuleOption`、`ModuleGuide` 和公开契约组织功能。

本轮 zh-CN 重构版文档优先覆盖：

- 快速开始与主机接入模式
- Monica 统一模块模式与结果模型
- 当前已整理的核心模块文档包
- 面向主机集成的典型场景

## 推荐阅读顺序

1. [快速开始](./getting-started/index.md)
2. [核心概念](./concepts/index.md)
3. [模块文档](./modules/index.md)
4. [场景指南](./scenarios/index.md)

## 当前已整理模块

- [AutoModel](./modules/auto-model/index.md)
- [AutoControllers](./modules/auto-controllers/index.md)
- [Configuration](./modules/configuration/index.md)
- [DataChannel](./modules/data-channel/index.md)
- [DependencyInjection](./modules/dependency-injection/index.md)
- [EventBus](./modules/event-bus/index.md)
- [JobScheduler](./modules/job-scheduler/index.md)
- [ProjectUnits](./modules/project-units/index.md)
- [Repository](./modules/repository/index.md)
- [SignalR](./modules/signalr/index.md)
- [UnitOfWork](./modules/unit-of-work/index.md)

## 推荐场景

- [无需工具的 RPC 客户端生成与 Local RPC](./scenarios/build-integrated-rpc.md)
