---
title: Execution Timing
description: 在 Web Host 或 Generic Host 中测量 Monica 业务执行与应用自定义作用域。
sidebar_position: 1
---

# Execution Timing

Execution Timing 为 Monica 业务执行和应用自定义作用域记录运行中操作，并聚合耗时统计。它同时支持 ASP.NET Core 与 Generic Host：Web 应用可以选择公开诊断端点，Worker 则保留完全相同的记录、聚合和查询 API，而不会增加 HTTP 接口。

## 何时使用此模块

- 测量 Execution Pipeline 中标记为业务操作的全部 Monica 执行描述符。
- 测量没有进入 Monica 原生 Adapter 的应用自定义工作。
- 在 Web 应用或 Worker 中查询运行中操作与已完成统计。
- 通过后台批处理把高频样本的聚合工作移出调用线程。

Execution Timing 是进程内诊断能力。统计数据只属于当前宿主，进程重启后会清空。

## 包与注册

| 项目 | 值 |
|---|---|
| 包 | `Monica.Profiling` |
| 成熟度 | Labs |
| 注册入口 | `monica.AddExecutionTiming()` |
| 相关 UI 注册入口 | `monica.AddExecutionTimingUI()` |
| UI 路由 | `/execution-timing` |

`Monica.Profiling` 属于 Labs 包，在晋级前仍可能发生变化。`AddExecutionTiming()` 会自动组合 Execution Pipeline；后台模式还会组合 HostedService 模块。

## 公开使用面

| API | 用途 |
|---|---|
| `IExecutionTimingFactory` | 创建可复用 Recorder、自动启动的 Scope，以及带显式稳定身份的 Invocation Scope。 |
| `IExecutionTimingRecorder` | 启动、停止计时样本，并可选择记录日志。 |
| `IExecutionTimingQuery` | 读取已完成统计与运行中操作，或重置一项已完成统计。 |
| `ExecutionTimingFacade` | 为 API 和 UI 以 Monica `Res<T>` 返回已排序的统计与运行中操作。 |
| `ExecutionTimingStatistics` | 描述一个操作键的次数、平均与最近耗时、时间戳及可选分配量字段。 |
| `RunningExecutionTimingInfo` | 描述一个活动 Invocation 及其当前耗时。 |
| `ExecutionTimingAggregationMode` | 选择内联或后台批量聚合。 |

`IExecutionTimingRecorder.EnableMemoryTracking` 已过时。它依赖线程本地分配计数器，无法可靠覆盖异步延续。

## 宿主行为

| 宿主 | 采集与查询 | 聚合 | HTTP 端点 |
|---|---|---|---|
| Generic Host | 可用 | 内联或后台批处理 | 永不映射 |
| ASP.NET Core Web Host | 可用 | 内联或后台批处理 | 只由 `EnableMinimalApi` 控制 |

模块会自动为 `IsBusinessOperation` 为 `true` 的描述符添加 Execution Behavior。手工 Recorder 使用同一个 Collector，因此自动测量和应用自定义测量可以一起查询。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide 与运行时 API](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Execution Pipeline](../execution-pipeline/index.md)
