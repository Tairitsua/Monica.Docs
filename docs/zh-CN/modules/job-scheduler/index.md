---
title: JobScheduler
description: 扫描定时作业与触发式作业定义，提供控制面、执行面、元数据存储和监控查询 Facade。
sidebar_position: 1
---

扫描定时作业与触发式作业定义，提供控制面、执行面、元数据存储和监控查询 Facade。

每次定时或触发式作业尝试都会进入统一 [Execution Pipeline](../execution-pipeline/index.md)，但描述符使用 `ExecutionTransactionMode.None`。JobScheduler Adapter 因此不会自动创建作业级外层 UnitOfWork；有数据库写入的作业必须通过 `IUnitOfWorkManager.RunAsync(...)` 划分业务粒度或有界批次。

## 何时使用这个模块

- 你需要统一管理定时作业与触发式作业，而不是自己维护零散 `HostedService`。
- 你希望作业定义、元数据持久化、调度范围和执行 Provider 都在模块层统一收口。
- 你需要 Dashboard、监控、查询和统计能力。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.JobScheduler` |
| 注册入口 | `monica.AddJobScheduler()` |
| 相关 UI 模块 | `monica.AddJobSchedulerUI()` |

## 公开使用面

- `IRecurringJob`、`ITriggeredJob<TArgs>`：作业定义契约。
- `ITriggeredJobManager`：代码触发作业的宿主入口。
- `IJobMetadataRepository`：作业元数据持久化抽象。
- `JobSchedulerFacade`、`JobSchedulerDashboardFacade`、`JobSchedulerMonitorFacade`、`JobSchedulerQueryFacade`、`JobSchedulerAnalyticsFacade`。
- `JobConfigAttribute`：覆盖单个作业的并发、重试、超时、Cron 等配置。
- `JobExecutionFeature`：执行管线中当前作业尝试的类型化上下文。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
