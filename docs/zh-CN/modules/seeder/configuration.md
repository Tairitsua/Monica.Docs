---
title: Configuration
description: 配置模块默认值，并解析每个 Seeder 的执行、就绪、重试与失败策略。
sidebar_position: 3
---

## 模块选项

| Property | Default | Purpose |
|---|---:|---|
| `MaxConcurrency` | `Environment.ProcessorCount` | 最大并发 Seeder 数；Exclusive Seeder 仍单独运行。 |
| `DefaultExecutionMode` | `Concurrent` | 无覆盖项时继承的执行模式。 |
| `DefaultCriticality` | `Required` | 无覆盖项时继承的就绪关键性。 |
| `DefaultFailureBehavior` | `ContinueAndRecord` | 无覆盖项时继承的最终失败行为。 |
| `DefaultMaxAttempts` | `1` | 无覆盖项时继承的最大尝试数；1 表示不重试。 |
| `RetryBaseDelay` | 200 ms | 指数增长与有界 Jitter 之前的初始 Retry Delay。 |
| `RetryMaxDelay` | 2 s | 单次 Retry Delay 上限。 |

`MaxConcurrency` 与 `DefaultMaxAttempts` 必须为正数；模块默认值不能使用 `Inherit`；`RetryBaseDelay` 必须为正，并且 `RetryMaxDelay` 不能小于它。

## 单个 Seeder 策略

`[SeederPolicy]` 会独立解析每个属性：

| Property | Inherit value | Explicit choices |
|---|---:|---|
| `ExecutionMode` | `Inherit` | `Concurrent`、`Exclusive` |
| `Criticality` | `Inherit` | `Required`、`Optional` |
| `FailureBehavior` | `Inherit` | `ContinueAndRecord`、`FailFast` |
| `MaxAttempts` | `0` | 正数尝试次数；`1` 表示不重试。 |

诊断快照会报告每个有效值，以及它来自 `ModuleDefault` 还是 `SeederOverride`。

## 策略含义

- `Concurrent` 允许与其他已就绪的并发 Seeder 重叠，受 `MaxConcurrency` 限制。
- `Exclusive` 会关闭当前并发波次，等待运行中工作结束，然后单独运行。
- `Required` 在成功前贡献 Unhealthy 就绪状态。
- 普通失败的 `Optional` Seeder 贡献 Degraded 就绪状态。
- `ContinueAndRecord` 记录最终失败、阻塞其依赖链，并继续独立工作。
- `FailFast` 只在所有尝试用尽后激活；它停止新调度、取消并等待运行中工作结束，让宿主继续存活但保持 Unready。

失败行为与关键性刻意相互独立。一个显式配置为 `FailFast` 的 Optional Seeder 仍会中止本轮运行，并让就绪状态变为 Unhealthy。

Retry Delay 从 `RetryBaseDelay` 开始指数增长，带有有界 Jitter，且不会超过 `RetryMaxDelay`。每次尝试都会获得新的异步 Scope，避免失败事务与 Scoped Service 泄漏到下一次尝试。
