---
title: Scenarios
description: 在常见部署中正确使用存活、就绪与脱敏诊断。
sidebar_position: 5
---

## 场景 1 — Kubernetes 或其他编排平台

把平台存活探针指向 `/alive`，就绪探针指向 `/health`。存活决定进程是否应重启，就绪决定当前实例是否接收流量。Degraded 仍返回 HTTP 200；平台必须摘除实例时应返回 `Unhealthy`。

## 场景 2 — 让就绪独立于调试服务

在公共组合路径注册 `monica.AddHealthCheck()` 和应用所需检查。Development 可以额外调用 `builder.AddServiceDefaults()` 接入 Aspire，但这些注册项只是补充。生产环境不能因为不存在调试专用 Aspire 服务而丢失数据库、Seeder、Scheduler 或其他模块就绪检查。

## 场景 3 — 查看单个宿主而不暴露原始异常

使用 `HealthCheckFacade.GetSnapshotAsync(HealthCheckScope.All, ...)` 或受保护 Dashboard。快照保留名称、标签、耗时、有界诊断数据和有界错误摘要，同时省略 Stack Trace，并脱敏凭据类 Value。

## 场景 4 — 正确分类依赖

服务请求所必需的数据库属于就绪检查。某个后台集成故障只会降低能力、不会阻断所有流量时，可以返回 `Degraded`。远程依赖通常不属于存活检查：重启健康进程很少能修复远程系统。

## Common mistakes

- 只在 Development 或 Aspire 条件中注册 Health Check。
- 给存活与就绪使用相同路径。
- 把 `Degraded` 误认为 HTTP 503；Monica 刻意映射为 200。
- 用无法体现敏感性的 Key 返回 Secret。
- 把当前宿主 Facade 当成持久或全实例监控存储。
