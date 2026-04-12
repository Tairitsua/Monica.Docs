---
title: JobScheduler
description: 扫描定时作业与触发式作业定义，提供控制面、执行面、元数据存储和监控查询 Facade。
sidebar_position: 1
---

# JobScheduler

扫描定时作业与触发式作业定义，提供控制面、执行面、元数据存储和监控查询 Facade。

## 何时使用这个模块

- 你需要统一管理定时作业与触发式作业，而不是自己维护零散 `HostedService`。
- 你希望作业定义、元数据持久化、调度范围和执行 Provider 都在模块层统一收口。
- 你需要 Dashboard、监控、查询和统计能力。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.JobScheduler` |
| 注册入口 | `Mo.AddJobScheduler()` |
| 相关 UI 模块 | `Mo.AddJobSchedulerUI()` |

## 公开使用面

- `IRecurringJob`、`ITriggeredJob<TArgs>`：作业定义契约。
- `ITriggeredJobManager`：代码触发作业的宿主入口。
- `IJobMetadataRepository`：作业元数据持久化抽象。
- `JobSchedulerFacade`、`JobSchedulerDashboardFacade`、`JobSchedulerMonitorFacade`、`JobSchedulerQueryFacade`、`JobSchedulerAnalyticsFacade`。
- `JobConfigAttribute`：覆盖单个作业的并发、重试、超时、Cron 等配置。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
