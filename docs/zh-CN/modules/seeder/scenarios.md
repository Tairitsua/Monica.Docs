---
title: Scenarios
description: 为启动工作选择并发、独占、失败行为与就绪语义。
sidebar_position: 5
---

## 场景 1 — 默认并行

让相互独立的 Seeder 保持 `Concurrent`。Scheduler 按完整类型名稳定排序启动 Ready 节点，最多允许 `MaxConcurrency` 个重叠。依赖关系仍会强制顺序，因此并行来自依赖图，而不是 Seeder 内部手工编排 Task。

## 场景 2 — 单独执行全局变更

某个 Seeder 不能与任何其他 Ready 工作重叠时，使用 `[SeederPolicy(ExecutionMode = SeederExecutionMode.Exclusive)]`。Scheduler 会等待当前并发波次结束，让 Exclusive 节点单独运行，并在它完成后才启动后续工作。

## 场景 3 — 失败后保留独立工作

某个失败只应阻塞自身依赖链时，使用 `ContinueAndRecord`。独立分支会继续运行。Required 分支失败会让就绪状态保持 Unhealthy；Optional 分支失败则报告 Degraded。

## 场景 4 — 中止本轮运行但保留诊断

某个最终失败使后续启动运行失去意义时，使用 `FailFast`。所有尝试用尽后，Scheduler 会：

1. 记录确定性触发者并进入 `Aborting`；
2. 停止调度新 Seeder；
3. 协作式取消并等待已经运行的 Seeder；
4. 阻塞触发者的依赖链，并取消无关的 Pending 节点；
5. 进入 `Aborted`，同时让宿主继续存活且就绪状态保持 Unhealthy。

该策略不会调用 `Environment.FailFast`，也不会停止宿主。运维人员仍可以查看 Dashboard 与日志。

## 场景 5 — 理解运行状态

`Waiting`、`Running` 与 `Aborting` 是活动状态；`Succeeded`、`CompletedWithFailures`、`Aborted` 与 `Cancelled` 是终态。单个 Seeder 使用 `Pending`、`Running`、`Succeeded`、`Failed`、`Blocked` 或 `Cancelled`；尝试历史拥有自己的 Running/Succeeded/Failed/Cancelled 状态。

## Common mistakes

- 编写非幂等 Seeder 后又启用 Retry。
- 启动生命周期超过 `SeedAsync` 的子 Task。
- 误以为 `Optional` 会覆盖显式 `FailFast` 策略。
- 让 Required Seeder 依赖 Optional Seeder。
- 把协作式取消当成宿主正在停止的证明。
- 期待诊断在进程重启后继续保留。
