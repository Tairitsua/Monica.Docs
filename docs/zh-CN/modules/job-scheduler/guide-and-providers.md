---
title: Guide and Providers
description: JobScheduler 的 Guide 方法、Provider 选择与依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `UseCustomMetadataRepository<TRepository>()` | 替换作业元数据持久化实现 | 是（二选一） | 你要把作业定义、实例、历史写入自定义存储时。 |
| `UseInMemoryMetadataRepository()` | 使用内存元数据仓储 | 是（二选一） | 本地开发或快速验证时。 |
| `UseSchedulerScope(string scopeKey)` | 设置调度作用域 | 是 | 隔离不同环境、租户或集群。 |
| `UseDistributeProvider()` | 使用分布式事件总线 + 分布式取消管理 | 是（二选一） | 多实例或分布式部署时。 |
| `UseInMemoryProvider()` | 使用内存事件总线 + 内存状态能力 | 是（二选一） | 单实例、本地开发或 Demo 时。 |

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| 内存元数据仓储 | `UseInMemoryMetadataRepository()` | 本地开发最快起步。 |
| 自定义元数据仓储 | `UseCustomMetadataRepository<TRepository>()` | 需要持久化和跨重启保留调度状态时。 |
| EF Core 元数据仓储扩展 | 安装 `Monica.JobScheduler.EfCore` 后调用 `UseEfCoreMetadataRepository(...)` | 真实项目里最常见的持久化组合之一。 |
| 内存 Provider | `UseInMemoryProvider()` | 单实例或开发环境。 |
| 分布式 Provider | `UseDistributeProvider()` | 需要跨实例分发作业、取消信号与状态时。 |

## Module dependencies

- 模块会自动依赖 HostedService 能力。
- Provider 选择会继续引入 EventBus、CancellationManager 和 ServiceDiscovery 相关依赖。
- 如果需要可视化控制面，额外接入 `Mo.AddJobSchedulerUI()`。
