---
title: Scenarios
description: 在开发与运维阶段安全使用 Health Check Dashboard。
sidebar_position: 5
---

## 场景 1 — 诊断本地就绪状态

打开 `/health-checks`，先查看就绪 Banner，再用 `ready` 标签筛选。详情抽屉会显示选中注册项的描述、耗时、标签、有界 Data 与有界异常摘要。

## 场景 2 — 共享一个诊断策略

内部运维宿主可以让 Module System、Health Check 与 Seeder 页面复用同一个命名策略。仍需显式配置每个页面；启用一个页面不会隐式授权其他页面。

## 场景 3 — 临时故障时保留证据

刷新无法执行时，最后一份成功快照继续显示，页面会提示数据已经过期。它只是当前进程过去的证据，不代表旧状态仍然成立；应结合时间戳与刷新 Warning 解读。

## 场景 4 — 监控实例集群

使用匿名探针端点让编排平台做决策，并把健康状态导出到监控平台进行全实例保留。内置页面刻意只表示承载当前 Circuit 的宿主。

## Common mistakes

- 未注册授权策略就把 Dashboard 暴露到非 Development 环境。
- 误以为 Dashboard 授权也会保护 `/health` 或 `/alive`。
- 把页面当成持久事故历史。
- 期待 UI 自动注册应用专用检查。
