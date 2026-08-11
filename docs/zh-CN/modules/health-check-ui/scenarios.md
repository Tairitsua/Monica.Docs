---
title: Scenarios
description: 在开发与运维阶段安全使用 Health Check Dashboard。
sidebar_position: 5
---

## 场景 1 — 诊断本地就绪状态

打开 `/health-checks`，先查看就绪 Banner，再用 `ready` 标签筛选。详情抽屉会显示选中注册项的描述、耗时、标签、有界 Data 与有界异常摘要。

## 场景 2 — 共享一个诊断策略

内部运维宿主可以通过 `ModuleShellUIOption.OperationalPageAccess.AuthorizationPolicy` 配置一次策略。Module System、Health Check、Seeder 与受保护的 Provider Option 诊断都会继承它；只有某个页面需要不同策略时才配置 `AuthorizationPolicyOverride`。

## 场景 3 — 临时故障时保留证据

刷新无法执行时，最后一份成功快照继续显示，页面会提示数据已经过期。它只是当前进程过去的证据，不代表旧状态仍然成立；应结合时间戳与刷新 Warning 解读。

## 场景 4 — 监控实例集群

使用匿名探针端点让编排平台做决策，并把健康状态导出到监控平台进行全实例保留。内置页面刻意只表示承载当前 Circuit 的宿主。

## Common mistakes

- 在生产可达宿主上启用运维 Debug 模式，却仍假设认证会保护 Dashboard。
- 只配置策略名，却没有注册并满足对应的 ASP.NET Core 策略。
- 误以为 Dashboard 授权也会保护 `/health` 或 `/alive`。
- 把页面当成持久事故历史。
- 期待 UI 自动注册应用专用检查。
