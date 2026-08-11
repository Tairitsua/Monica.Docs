---
title: Configuration
description: 配置 Dashboard 暴露、Polling、过期证据与当前宿主生命周期。
sidebar_position: 3
---

## 访问选项

| Property | Type | Default | Required | Purpose |
|---|---|---:|---:|---|
| `ModuleShellUIOption.OperationalPageAccess.AuthorizationPolicy` | `string?` | `null` | 否 | 设置 Monica 运维页面在非 Development 环境继承的策略。 |
| `ModuleShellUIOption.OperationalPageAccess.DebugMode` | `bool` | `false` | 否 | 在所有环境绕过运维页面授权。 |
| `ModuleSeederUIOption.AuthorizationPolicyOverride` | `string?` | `null` | 否 | 覆盖 `/seeders` 的全局策略；空白值继续继承全局策略。 |

访问优先级依次为：全局 Debug 模式、Development 自动访问、页面策略覆盖、全局策略。非 Development 环境中，有效策略缺失、授权服务缺失、策略未注册、评估异常或用户未通过都会 Fail Closed，且不会调用 Facade。

| Environment | Debug mode | Effective policy | Result |
|---|---:|---|---|
| Development | `false` | 任意 | 不评估策略即可访问。 |
| 任意环境 | `true` | 忽略 | 不评估策略即可访问。 |
| 非 Development | `false` | 缺失、未知或未通过 | 拒绝访问；不会调用 Facade。 |
| 非 Development | `false` | 已注册且满足 | 可用。 |

`OperationalPageAccess.DebugMode` 与 `ModuleShellUIOption.EnableDebug` 相互独立：前者绕过授权，后者暴露 Blazor 与 SignalR 详细错误。除非宿主已被刻意隔离且明确接受信息披露风险，否则不要在生产可达宿主上启用二者。

## Session 行为

- 首次加载和手动刷新会调用 `SeederFacade.GetSnapshotAsync(...)`。
- 活动状态（`Waiting`、`Running`、`Aborting`）每秒 Poll。
- 终态会停止自动 Polling。
- 并发调用者加入当前刷新，不会重复发送 Facade 请求。
- 刷新失败时保留最后一份成功快照，并提示证据已经过期。
- 每次 Facade 边界前都会重新评估授权。
- 刷新不可变 Row 后，选择状态通过稳定完整类型名保持。
- 离开页面会确定性取消 Timer、活动请求与页面拥有的 UI 工作。

页面不会配置 Scheduler。执行行为应通过运行时模块的 `ModuleSeederOption` 与 `[SeederPolicy]` 设置。
