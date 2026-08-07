---
title: 托管服务
description: 观测 Generic Host 服务、按实例查询运行状态，并协调就绪检查点。
sidebar_position: 1
---

托管服务模块为通过标准 .NET Generic Host 注册的 Monica 服务建立可观测运行目录。它独立跟踪每个 `IMoHostedService` 实例，提供状态与健康查询，并通过命名检查点协调实例间依赖，而不会替代 `IHostedService` 或 Generic Host 生命周期。

## 适用场景

- 观测后台工作器的启动、运行、降级、故障和停止状态。
- 保留同一具体类型的多个不同实例，包括通过 `ServiceKey` 区分的实例。
- 让一个托管服务等待另一个精确实例产生的就绪检查点。
- 在 `StopAsync` 后检查最终停止快照；运行快照会保留到宿主释放。

## 包与注册

| 项目 | 值 |
|---|---|
| 包 | `Monica.Core` |
| Monica 注册 | `monica.AddHostedService()` |
| 宿主服务注册 | 标准 `builder.Services.AddHostedService<TService>()` 或单例 `IHostedService` 描述符 |
| 相关 UI 模块 | 无 |

## 公开使用面

- `IMoHostedService` 定义可观测身份与运行信息；`ServiceKey` 用于区分同类型实例。
- `MoHostedService` 与 `MoBackgroundService` 分别为有限托管服务和长时间运行工作器提供可观测基类。
- `HostedServiceRuntimeInfo.InstanceId` 是当前宿主中单个实例的精确身份。
- `IMoHostedServiceRegistry` 提供类型、名称、键、状态和健康度的复数查询，以及精确实例查询。
- `IMoHostedServiceCheckpointCoordinator` 等待并发出实例感知的检查点。

模块会在 `IHostedLifecycleService.StartingAsync` 中发布目录快照，早于任意托管服务的 `StartAsync`。因此，服务可以在自己的启动代码中查询自身或依赖项。

## 后续阅读

- [快速开始](./quick-start.md)
- [配置](./configuration.md)
- [Guide 与运行时 API](./guide-and-providers.md)
- [使用场景](./scenarios.md)
