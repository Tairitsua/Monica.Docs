---
title: Configuration
description: 配置 Dashboard 暴露、Polling、过期证据与当前宿主生命周期。
sidebar_position: 3
---

## 模块选项

| Property | Default | Purpose |
|---|---:|---|
| `EnableOutsideDevelopment` | `false` | 允许页面在非 Development 环境进入访问判断。 |
| `AuthorizationPolicy` | `null` | 非 Development 环境中，对当前 Blazor Circuit 评估的宿主策略名。 |

在任何环境中，只要设置 `EnableOutsideDevelopment` 却没有提供非空策略名，模块校验都会失败。非 Development 环境中，命名策略还必须已经注册，并由当前用户满足。

| Environment | Enable flag | Valid policy | Result |
|---|---:|---:|---|
| Development | `false`（默认） | 不需要 | 可用。 |
| Development | `true` | 校验要求非空名称 | 可用；策略执行从非 Development 环境开始。 |
| 非 Development | `false` | 任意 | 关闭。 |
| 非 Development | `true` | 缺失或未通过 | 拒绝访问；不会调用 Facade。 |
| 非 Development | `true` | 已注册且满足 | 可用。 |

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
