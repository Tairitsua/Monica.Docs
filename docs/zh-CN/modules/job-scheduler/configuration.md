---
title: Configuration
description: JobScheduler 的公开选项、默认值与必需设置。
sidebar_position: 4
---

所有选项都在 `ModuleJobSchedulerOption` 上。身份类选项通过注册扩展写入，其余可以直接在 `AddJobScheduler(options => ...)` 里配置。

## 身份与目录

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `SchedulerScopeKey` | `string` | `string.Empty` | 是 | 始终需要配置 | 只能通过 `UseSchedulerScope(...)` 设置，隔离不同环境或逻辑调度安装。 |
| `CatalogReleaseId` | `string` | `string.Empty` | 是 | 每次部署发布变化时 | 只能通过 `UseCatalogRelease(...)` 设置；同一发布的所有宿主必须字节一致。 |
| `DeploymentGeneration` | `long` | — | 是 | 每次部署递增 | 单调递增，用于排序期望发布；只能经 `UseCatalogRelease(...)` 写入。 |
| `CatalogOwners` | `List<JobCatalogOwnerManifest>` | 空 | 是 | 每次部署发布变化时 | 完整的 owner→worker revision 清单；移除某个 owner 会在激活时下线其作业。 |
| `ProjectName` | `string?` | 入口程序集名称 | 否 | 你要覆盖默认本地 owner 身份时 | Worker 宿主未显式指定 `LocalOwnerId` 时用它解析本地 owner。 |
| `LocalOwnerId` | `string?` | `null` | 否 | 部署归属与项目身份刻意不同时 | 通过 `UseLocalWorkerIdentity(...)` 设置。 |
| `LocalWorkerRevisionId` | `string?` | `null` | 否 | 同上 | 必须与清单中对应 owner 的 revision 一致。 |
| `Role` | `JobSchedulerRole` | `Worker` | 否 | 你要拆分控制面与工作面部署时 | `ControlPlane` / `Worker` / `Standalone`，通常用 `AsControlPlane()` / `AsWorker()` / `AsStandalone()` 设置。 |
| `WorkerInstanceId` | `string` | `HOSTNAME` 环境变量，否则 `机器名:进程号` | 否 | 你要自定义围栏身份时 | 用于能力租约与执行租约的进程围栏。 |
| `CronTimeZone` | `TimeZoneInfo` | `TimeZoneInfo.Local` | 否 | 你要统一跨主机的定时解释时 | 持久化的出现时间都会换算为 UTC。 |
| `RecurringJobDebugMode` | `bool` | `false` | 否 | 你想抑制自动定时物化、只手动触发时 | 以显式调试原因暂停重复游标；不影响触发式作业，也不阻止 run-now。 |

## 轮询与租约

| Property | Type | Default | When to change | Notes |
|---|---|---|---|---|
| `ControlPlanePollInterval` | `TimeSpan` | `1s` | 调整控制面收敛节奏时 | 检查目录激活、重复游标与过期租约；副本间由存储级 CAS 协调。 |
| `WorkerPollInterval` | `TimeSpan` | `250ms` | 调整 worker 认领频率时 | 有空闲执行容量时的轮询间隔。 |
| `WorkerCapabilityLeaseDuration` | `TimeSpan` | `30s` | 放宽或收紧能力租约时 | 必须大于 `WorkerCapabilityRenewInterval`。 |
| `WorkerCapabilityRenewInterval` | `TimeSpan` | `10s` | 同上 | 从上次成功注册或续约起本地计时。 |
| `ExecutionLeaseDuration` | `TimeSpan` | `30s` | 放宽或收紧执行租约时 | 必须大于 `ExecutionLeaseRenewInterval`。 |
| `ExecutionLeaseRenewInterval` | `TimeSpan` | `10s` | 同上 | 续约同时观察持久化取消请求。 |
| `ExecutionRetryDelay` | `TimeSpan` | `5s` | 调整失败重试间隔时 | 失败尝试重新可认领前的存储侧延迟。 |
| `ExecutionCancellationGracePeriod` | `TimeSpan` | `15s` | 调整卡死代码的宽限时 | 宽限后宿主请求关闭进程，由外部监督者终止。 |
| `WorkerShutdownGracePeriod` | `TimeSpan` | `15s` | 调整优雅关闭窗口时 | 之后仍存活的租约会过期并由控制面回收。 |

## 执行容量

| Property | Type | Default | When to change | Notes |
|---|---|---|---|---|
| `MaxWorkerExecutionThreads` | `int` | `4` | 限制或放大单实例并发执行数时 | 必须大于 0。 |
| `MaxClaimBatchSize` | `int` | `16` | 调整单轮认领批量时 | 1–256；生效值不超过当前空闲执行槽位。 |
| `MaxRecurringMaterializationsPerCycle` | `int` | `100` | 调整重复出现物化预算时 | 单个控制面收敛周期内所有游标共享的预算。 |
| `MaxExpiredLeaseRecoveriesPerCycle` | `int` | `100` | 调整过期租约回收批量时 | 每个控制面周期的上限。 |

## 历史与保留

| Property | Type | Default | When to change | Notes |
|---|---|---|---|---|
| `MaxExecutionHistoryEntriesPerExecution` | `int` | `1000` | 调整单次执行历史上限时 | 状态迁移、作业日志与取消审计共用上限，超限时原子淘汰最旧条目。 |
| `MaxExecutionHistoryMessageLength` | `int` | `4096` | 调整历史消息长度上限时 | 超长消息会被截断并加省略号。 |
| `EnableHistoryCleanup` | `bool` | `true` | 你不希望自动清理终态历史时 | 清理依据当前生效的作业保留策略。 |
| `HistoryCleanupInterval` | `TimeSpan` | `1h` | 调整清理周期时 | 部分清理后续批次在之后的控制面轮询继续。 |
| `MaxHistoryDeletionsPerCycle` | `int` | `5000` | 限制单轮清理删除量时 | 必须大于 0。 |
| `MaxRetainedOrphanedExecutions` | `int` | `10` | 调整孤儿执行保留量时 | 作业不在激活目录中时保留的最新终态执行数；`0` 关闭按条数清理。 |

## 序列化

| Property | Type | Default | When to change | Notes |
|---|---|---|---|---|
| `JobArgsSerializerOptions` | `JsonSerializerOptions` | 启用 `UnsafeRelaxedJsonEscaping` | 你需要自定义作业参数序列化时 | 默认保留非 ASCII 文本。 |

这些选项控制目录收敛、租约与维护节奏，不会改变事务所有权。作业尝试始终使用 `ExecutionTransactionMode.None`，数据库分块仍由作业实现显式控制。

## Required setup

| Requirement | Satisfied by | Notes |
|---|---|---|
| 统一存储 | `UseInMemoryStore()`、`UseStore<TStore>()` 或 `UseEfCoreStore(...)` | 三选一；`UseEfCoreStore(...)` 来自 `Monica.JobScheduler.EfCore`。 |
| 调度作用域 | `UseSchedulerScope(string scopeKey)` | 必须显式设置，隔离不同环境与宿主组。 |
| 目录发布 | `UseCatalogRelease(releaseId, deploymentGeneration, owners)` | Worker 与 Standalone 宿主的清单必须包含本地 owner；ControlPlane 可以用空清单下线所有作业。 |
