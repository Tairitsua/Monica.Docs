---
title: Configuration
description: JobScheduler 的公开选项、默认值与必需设置。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `SchedulerScopeKey` | `string` | `string.Empty` | 是 | 始终需要配置 | 必须通过 `UseSchedulerScope(...)` 设置，用于隔离不同环境/集群。 |
| `ProjectName` | `string` | 入口程序集名称 | 否 | 你需要覆盖默认项目名时 | 用于作业识别与对账。 |
| `RecurringJobDebugMode` | `bool` | `false` | 否 | 你想禁用自动定时触发、只手动触发时 | 定时作业仍会注册，但不会自动运行。 |
| `TriggeredJobDebugMode` | `bool` | `false` | 否 | 你想禁用触发式作业的自动发布时 | 适合调试事件链路。 |
| `MaxWorkerExecutionThreads` | `int?` | `null` | 否 | 你想限制单实例并发执行线程数时 | `null` 表示不限制。 |
| `EnableZombieDetection` | `bool` | `true` | 否 | 你不希望扫描僵尸作业时 | 默认会定期扫描 Processing / Enqueued 异常状态。 |
| `ZombieDetectionInterval` | `TimeSpan` | `00:02:00` | 否 | 你要调整僵尸检测频率时 | 默认 2 分钟。 |
| `ProcessingTimeoutMultiplier` | `double` | `2.0` | 否 | 你要放宽或收紧 Processing 状态超时判定时 | 实际超时 = 作业超时 × 倍数。 |
| `EnqueuedStateTimeout` | `TimeSpan` | `00:10:00` | 否 | 你要调整 Enqueued 超时阈值时 | 默认 10 分钟。 |
| `CheckWorkerHealthBeforeZombieDetection` | `bool` | `true` | 否 | 你要改变僵尸判定前的健康检查策略时 | 默认先看 worker 健康。 |
| `EnableLongIntervalScheduler` | `bool` | `true` | 否 | 你不需要超长间隔作业支持时 | 关闭后，超长间隔作业可能失效。 |
| `LongIntervalScanInterval` | `TimeSpan` | `8.00:00:00` | 否 | 你要调整长间隔扫描频率时 | 默认 8 天。 |
| `TimerSafetyThresholdDays` | `int` | `24` | 否 | 你要调整切换到 Scheduled 模式的阈值时 | 与 .NET Timer 上限有关。 |
| `EnableHistoryCleanup` | `bool` | `true` | 否 | 你不希望自动清理历史时 | 默认开启。 |
| `HistoryCleanupInterval` | `TimeSpan` | `01:00:00` | 否 | 你要调整历史清理周期时 | 默认 1 小时。 |
| `MaxDeletionsPerJobPerCycle` | `int` | `5000` | 否 | 你要限制单轮清理删除量时 | `0` 表示不限制。 |
| `MaxRetainedOrphanedInstances` | `int` | `10` | 否 | 你要调整孤儿实例保留数量时 | `0` 表示不限制。 |
| `JobArgsSerializerOptions` | `JsonSerializerOptions?` | 默认启用 `UnsafeRelaxedJsonEscaping` | 否 | 你需要自定义作业参数序列化策略时 | 默认更适合包含非 ASCII 字符的参数。 |

## Required setup

| Requirement | Satisfied by | Notes |
|---|---|---|
| 元数据存储 | `UseCustomMetadataRepository<TRepository>()` 或 `UseInMemoryMetadataRepository()` | 二选一。 |
| 调度 Provider | `UseDistributeProvider()` 或 `UseInMemoryProvider()` | 二选一。 |
| 调度 Scope | `UseSchedulerScope(string scopeKey)` | 必须显式设置，用于隔离不同环境和实例组。 |
