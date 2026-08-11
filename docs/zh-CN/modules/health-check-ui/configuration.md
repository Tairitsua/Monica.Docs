---
title: Configuration
description: 配置 Dashboard 暴露方式，并理解它的刷新生命周期。
sidebar_position: 3
---

## 访问选项

| Property | Type | Default | Required | Purpose |
|---|---|---:|---:|---|
| `ModuleShellUIOption.OperationalPageAccess.AuthorizationPolicy` | `string?` | `null` | 否 | 设置 Monica 运维页面在非 Development 环境继承的策略。 |
| `ModuleShellUIOption.OperationalPageAccess.DebugMode` | `bool` | `false` | 否 | 在所有环境绕过运维页面授权。 |
| `ModuleHealthCheckUIOption.AuthorizationPolicyOverride` | `string?` | `null` | 否 | 覆盖 `/health-checks` 的全局策略；空白值继续继承全局策略。 |

访问优先级依次为：全局 Debug 模式、Development 自动访问、页面策略覆盖、全局策略。非 Development 环境中，有效策略缺失、授权服务缺失、策略未注册、评估异常或用户未通过都会 Fail Closed，且不会调用 Facade。

| Environment | Debug mode | Effective policy | Result |
|---|---:|---|---|
| Development | `false` | 任意 | 不评估策略即可访问。 |
| 任意环境 | `true` | 忽略 | 不评估策略即可访问。 |
| 非 Development | `false` | 缺失、未知或未通过 | 拒绝访问；不会调用 Facade。 |
| 非 Development | `false` | 已注册且满足 | 可用。 |

`OperationalPageAccess.DebugMode` 与 `ModuleShellUIOption.EnableDebug` 相互独立：前者绕过授权，后者暴露 Blazor 与 SignalR 详细错误。除非宿主已被刻意隔离且明确接受信息披露风险，否则不要在生产可达宿主上启用二者。

## 刷新行为

- 第一次请求使用独立 Loading 或 Failure 状态。
- 页面拥有的 Timer 每 10 秒刷新一次 `All` 快照。
- 手动刷新与 Timer 刷新会合并到同一个进行中请求。
- 刷新失败时保留上一份快照。
- 每次 Facade 调用前都会重新检查授权。
- 离开页面会取消 Timer，并确定性等待自身工作结束。

Dashboard 不提供多实例聚合或持久时间线。每次刷新都会在承载当前 Blazor Circuit 的宿主上执行检查。
