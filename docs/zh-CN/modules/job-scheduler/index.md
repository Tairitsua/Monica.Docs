---
title: JobScheduler
description: 不可变作业目录控制面与版本感知的持久化执行工作面。
sidebar_position: 1
---

`Monica.JobScheduler` 发现 `RecurringJob` 与 `TriggeredJob<TArgs>` 类型，把它们发布为不可变的目录发布（catalog release），并通过持久化租约队列交给版本感知的 worker 执行。模块要求三个显式选择：**统一存储、调度作用域、不可变目录发布**。

每次定时或触发式作业尝试都会进入统一 [Execution Pipeline](../execution-pipeline/index.md)，但描述符使用 `ExecutionTransactionMode.None`。JobScheduler 因此不会自动创建作业级外层 UnitOfWork；有数据库写入的作业必须通过 `IUnitOfWorkManager.RunAsync(...)` 划分业务粒度或有界批次。

## 何时使用这个模块

- 你需要统一管理定时作业与触发式作业，而不是自己维护零散 `HostedService`。
- 你希望作业声明、运维策略、持久化队列与执行租约都在模块层统一收口。
- 你需要多实例协作：控制面与工作面可以独立部署，通过同一个持久化存储协调。
- 你需要总览、目录、执行历史、统计与策略编辑等运维能力。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.JobScheduler` |
| 注册入口 | `monica.AddJobScheduler()` |
| EF Core 持久化 | `Monica.JobScheduler.EfCore`（`UseEfCoreStore(...)`） |
| 运维 UI | `monica.AddJobSchedulerUI()` |

## 公开使用面

- `IRecurringJob`、`ITriggeredJob<TArgs>`：作业定义契约，配套基类 `RecurringJob`、`TriggeredJob<TArgs>`。
- `JobConfigAttribute`：声明单个作业的显示名、描述、并发、重试、超时、Cron 计划与生效边界。
- `ITriggeredJobManager`：代码内入队触发式作业、取消执行的宿主入口。
- `IJobSchedulerStore`：目录、策略、队列、租约、重复游标与统计的统一持久化正确性边界。
- `JobSchedulerFacade`：面向宿主 API 与运维 UI 的控制面门面（总览、目录、策略、触发、执行、统计、取消、发布回滚）。
- `JobExecutionFeature`：执行管线中当前作业尝试的类型化上下文。

## 相关页面

- [Quick Start](./quick-start.md)
- [目录发布与生命周期](./catalog-lifecycle.md)
- [Configuration](./configuration.md)
- [注册扩展与角色](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [运维 UI 工作台](./ui-workspace.md)
