---
title: Health Check UI
description: 在 Monica 共享运维 Shell 中查看就绪状态与脱敏健康证据。
sidebar_position: 1
---

`Monica.HealthCheck.UI` 在 `/health-checks` 增加只读 Dashboard。它消费当前宿主 [Health Check](../health-check/index.md) 的脱敏 Facade；不会替代 `/health` 或 `/alive`、不会保存历史，也不会改变检查注册项。

页面提供：

- 当前宿主标识、就绪状态、聚合计数、检查时间与耗时；
- 名称/描述搜索，以及状态和标签筛选；
- 展示状态、描述、耗时与标签的紧凑表格；
- 展示有界诊断数据与有界异常证据的详情抽屉。

页面每 10 秒刷新并支持手动刷新。并发刷新会合并为一个进行中的 Facade 请求；后续刷新失败时，旧快照仍保留并显示 Warning。每次 Facade 请求前都会重新评估授权，页面拥有的 Session 会在释放时取消并等待自身工作结束。

## 访问契约

Dashboard 在 Development 中默认可用。非 Development 环境默认关闭，只有宿主显式启用并提供有效的命名授权策略后才可访问。策略缺失、未注册或未通过时，导航和 Facade 访问都会被阻止。

## 接下来阅读

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [注册与访问边界](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [诊断与运维页面](../../scenarios/diagnostics-and-ops.md)
