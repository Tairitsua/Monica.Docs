---
title: Seeder UI
description: 查看启动进度、策略来源、依赖、尝试与有界失败证据。
sidebar_position: 1
---

`Monica.Framework.UI` 在 `/seeders` 增加只读 Seeder 运维页面。它渲染当前进程的 [Seeder](../seeder/index.md) 诊断，并且刻意不提供重新运行或手动执行控制。

全宽页面包含：

- 整体就绪、运行状态、时间、进度、计数与 FailFast 触发者；
- 有效模块并发、执行、关键性、重试与失败默认值；
- 搜索，以及状态、关键性与失败策略筛选；
- 展示状态、策略、尝试、依赖与耗时的紧凑表格；
- 展示策略来源、时间戳、依赖证据、每次尝试时间线与有界错误的详情抽屉。

运行状态为 `Waiting`、`Running` 或 `Aborting` 时，页面每秒 Poll；到达终态后停止。仍可手动刷新。并发刷新会合并为一个请求，失败时旧快照继续显示，每次 Facade 调用前重新检查授权，页面释放时取消并等待自身工作结束。

Dashboard 在 Development 中默认可用。非 Development 环境需要显式启用并提供有效的命名授权策略。

## 接下来阅读

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [注册与访问边界](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [诊断与运维页面](../../scenarios/diagnostics-and-ops.md)
