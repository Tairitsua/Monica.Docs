---
title: 模块文档
description: 按 Monica 模块组织的 zh-CN 文档目录。
sidebar_position: 3
---

# 模块文档

这一层按照**模块**而不是旧历史目录来组织。一个项目即使包含多个 Monica 模块，也会拆成多个独立文档包。

## 当前已整理模块

| 模块 | 包 | 注册入口 | 相关 UI 模块 |
|---|---|---|---|
| [AutoModel](./auto-model/index.md) | `Monica.AutoModel` | `Mo.AddAutoModel()` | 无 |
| [AutoControllers](./auto-controllers/index.md) | `Monica.WebApi` | `Mo.AddAutoControllers(...)` | 无 |
| [Configuration](./configuration/index.md) | `Monica.Configuration` | `Mo.AddConfiguration()` | `Mo.AddConfigurationUI()` |
| [DataChannel](./data-channel/index.md) | `Monica.DataChannel` | `Mo.AddDataChannel()` | `Mo.AddDataChannelUI()` |
| [DependencyInjection](./dependency-injection/index.md) | `Monica.DependencyInjection` | `Mo.AddDependencyInjection()` | `Mo.AddDependencyInjectionUI()` |
| [EventBus](./event-bus/index.md) | `Monica.EventBus` | `Mo.AddEventBus()` | `Mo.AddEventBusUI()` |
| [JobScheduler](./job-scheduler/index.md) | `Monica.JobScheduler` | `Mo.AddJobScheduler()` | `Mo.AddJobSchedulerUI()` |
| [ProjectUnits](./project-units/index.md) | `Monica.Framework` | `Mo.AddProjectUnits()` | `Mo.AddProjectUnitsUI()` |
| [Repository](./repository/index.md) | `Monica.Repository` | `Mo.AddRepository()` | 无 |
| [SignalR](./signalr/index.md) | `Monica.SignalR` | `Mo.AddSignalR()` | `Mo.AddSignalRUI()` |
| [UnitOfWork](./unit-of-work/index.md) | `Monica.Repository` | `Mo.AddUnitOfWork()` | 无 |

## 阅读建议

- 先看模块 `index.md` 了解定位与公开边界
- 再看 `quick-start.md` 跑通最小接入
- 然后阅读 `configuration.md` 与 `guide-and-providers.md`
- 如果你在做真实业务集成，再看 `scenarios.md`
