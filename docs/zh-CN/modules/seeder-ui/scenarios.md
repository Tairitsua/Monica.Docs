---
title: Scenarios
description: 在不改变一次性运行生命周期的前提下阅读 Seeder 进度与失败证据。
sidebar_position: 5
---

## 场景 1 — 观察启动进度

宿主启动时打开 `/seeders`。Overview 同时展示就绪与运行状态，表格显示哪些节点正在 Pending、Running 或已完成。运行到达终态后，Polling 会自动停止。

## 场景 2 — 解释 Seeder 为什么没有运行

筛选 `Blocked` 或 `Cancelled`，打开详情抽屉，查看直接依赖与最终诊断。Blocked 节点记录失败的依赖证据；FailFast 期间，无关 Pending 节点会被 Cancelled。

## 场景 3 — 审计有效策略

详情抽屉同时展示执行模式、关键性、失败行为、最大尝试次数，以及 `ModuleDefault` 或 `SeederOverride`。这样可以区分宿主默认值与单个 Seeder 上的刻意 Annotation。

## 场景 4 — 调查 Retry

尝试时间线记录从 1 开始的尝试编号、状态、开始与完成时间、耗时和有界错误详情。完整 Stack Trace 与结构化最终失败 Metadata 应从日志查看。

## 场景 5 — 处理已中止运行

`Aborting` 或 `Aborted` 无论触发者关键性如何都属于 Unhealthy。因为 FailFast 只中止 Seeder 执行而不停止宿主，页面仍可使用。重启或部署修复前，应检查触发者、被取消的运行中工作、被阻塞的依赖链与日志。

## Common mistakes

- 寻找重新运行按钮；页面刻意只读。
- 把 `CompletedWithFailures` 当成固定就绪状态；Required 与 Optional 结果不同。
- 出现刷新 Warning 后仍把旧快照当成当前状态。
- 期待上一进程的尝试继续保留。
