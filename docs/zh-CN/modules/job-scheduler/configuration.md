---
title: Configuration
description: JobScheduler 的身份、轮询、租约、容量与留存选项。
sidebar_position: 4
---

所有选项都在 `ModuleJobSchedulerOption` 上。身份类选项通过注册扩展写入，其余可以直接在 `AddJobScheduler(options => ...)` 里配置。

## 身份

| 属性 | 类型 | 默认值 | 必需 | 何时调整 | 说明 |
|---|---|---|---|---|---|
| `SchedulerScopeKey` | `string` | `string.Empty` | 是 | 始终必需 | 只能通过 `UseSchedulerScope(...)` 设置；隔离环境或逻辑调度安装。 |
| `ProjectName` | `string?` | 应用级项目名，否则入口程序集名 | 否 | 覆盖默认所有者身份 | 每个宿主调度与执行所用的所有者键；同一服务的副本必须解析出相同值。 |
| `WorkerInstanceId` | `string` | `HOSTNAME` 环境变量，否则 `machine:pid` | 否 | 自定义 fencing 身份 | 按进程隔离执行租约。 |
| `CronTimeZone` | `TimeZoneInfo` | `TimeZoneInfo.Local` | 否 | 统一各宿主的 Cron 解释 | 持久化的执行时点始终换算为 UTC。 |
| `RecurringJobDebugMode` | `bool` | `false` | 否 | 抑制自动周期物化 | 以显式调试原因挂起周期游标；不影响触发式作业，也不阻止立即执行。 |

## 调度与快照同步

| 属性 | 类型 | 默认值 | 何时调整 | 说明 |
|---|---|---|---|---|
| `SchedulingPollInterval` | `TimeSpan` | `1s` | 调整调度循环节奏 | 单个循环发布所有者快照、物化到期周期时点、恢复过期租约并执行历史清理。 |
| `SnapshotSyncInterval` | `TimeSpan` | `30s` | 调整快照发布频率 | 同时决定 UI 的所有者在线阈值（该间隔的 3 倍）。 |
| `MaxRecurringMaterializationsPerCycle` | `int` | `100` | 调整物化预算 | 一个调度周期内全部周期游标共享的预算。 |
| `MaxExpiredLeaseRecoveriesPerCycle` | `int` | `100` | 调整过期租约恢复批次 | 每个调度周期的上限。 |

## Worker 轮询与租约

| 属性 | 类型 | 默认值 | 何时调整 | 说明 |
|---|---|---|---|---|
| `WorkerPollInterval` | `TimeSpan` | `250ms` | 调整认领节奏 | worker 尚有空闲执行容量时使用。 |
| `MaxWorkerExecutionThreads` | `int` | `4` | 限制或提高单实例并发 | 必须大于零。 |
| `MaxClaimBatchSize` | `int` | `16` | 调整单次认领批次 | 1–256；有效值不会超过可用 worker 槽位。 |
| `ExecutionLeaseDuration` | `TimeSpan` | `30s` | 放宽或收紧执行租约 | 必须大于 `ExecutionLeaseRenewInterval`、`ExecutionCancellationGracePeriod` 与 `WorkerShutdownGracePeriod`。 |
| `ExecutionLeaseRenewInterval` | `TimeSpan` | `10s` | 同上 | 续租同时会观察持久化取消请求。 |
| `ExecutionRetryDelay` | `TimeSpan` | `5s` | 调整失败重试间隔 | 失败尝试重新可认领前的存储侧延迟。 |
| `ExecutionCancellationGracePeriod` | `TimeSpan` | `15s` | 调整卡死代码宽限 | 宽限期后宿主请求关闭，由监督者终止进程。 |
| `WorkerShutdownGracePeriod` | `TimeSpan` | `15s` | 调整优雅停机窗口 | 之后残留租约到期，由调度循环恢复。 |

## 历史与留存

| 属性 | 类型 | 默认值 | 何时调整 | 说明 |
|---|---|---|---|---|
| `MaxExecutionHistoryEntriesPerExecution` | `int` | `1000` | 调整单执行历史上限 | 状态迁移、作业日志与取消审计共享上限；最旧条目原子淘汰。 |
| `MaxExecutionHistoryMessageLength` | `int` | `4096` | 调整历史消息长度 | 超长消息以省略号截断。 |
| `EnableHistoryCleanup` | `bool` | `true` | 停止自动裁剪终态历史 | 清理遵循每个作业的生效留存策略。 |
| `HistoryCleanupInterval` | `TimeSpan` | `1h` | 调整清理节奏 | 未完成的分批在后续调度周期继续。 |
| `MaxHistoryDeletionsPerCycle` | `int` | `5000` | 限制单轮清理删除量 | 必须大于零。 |
| `MaxRetainedOrphanedExecutions` | `int` | `10` | 调整孤儿执行留存 | 为不在所有者快照中的作业保留的最新终态执行数；`0` 关闭按条数清理。 |

## 序列化

| 属性 | 类型 | 默认值 | 何时调整 | 说明 |
|---|---|---|---|---|
| `JobArgsSerializerOptions` | `JsonSerializerOptions` | 启用 `UnsafeRelaxedJsonEscaping` | 自定义作业参数序列化 | 默认值保留非 ASCII 文本。 |

所有 `TimeSpan` 选项必须为正。这些选项只控制轮询、租约与维护节奏，不改变事务归属。作业尝试始终使用 `ExecutionTransactionMode.None`，数据库分批仍是显式应用代码。

## 必需注册选择

| 要求 | 满足方式 | 说明 |
|---|---|---|
| 统一存储 | `UseInMemoryStore()`、`UseStore<TStore>()` 或 `UseEfCoreStore(...)` | 三选一；`UseEfCoreStore(...)` 来自 `Monica.JobScheduler.EfCore`。 |
| 调度作用域 | `UseSchedulerScope(string scopeKey)` | 每个环境与宿主组显式且稳定。 |
