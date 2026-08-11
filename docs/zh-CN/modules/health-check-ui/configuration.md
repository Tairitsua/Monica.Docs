---
title: Configuration
description: 配置 Dashboard 暴露方式，并理解它的刷新生命周期。
sidebar_position: 3
---

## 模块选项

| Property | Default | Purpose |
|---|---:|---|
| `EnableOutsideDevelopment` | `false` | 允许页面在非 Development 环境进入访问判断。 |
| `AuthorizationPolicy` | `null` | 非 Development 环境中，对当前 Blazor Circuit 评估的宿主策略名。 |

在任何环境中，只要设置 `EnableOutsideDevelopment` 却没有提供非空策略名，模块校验都会失败。非 Development 环境中仅提供名称仍不够：宿主必须注册该策略，当前用户也必须满足它。

| Environment | Enable flag | Valid policy | Result |
|---|---:|---:|---|
| Development | `false`（默认） | 不需要 | 可用。 |
| Development | `true` | 校验要求非空名称 | 可用；策略执行从非 Development 环境开始。 |
| 非 Development | `false` | 任意 | 关闭。 |
| 非 Development | `true` | 缺失或未通过 | 拒绝访问；不会调用 Facade。 |
| 非 Development | `true` | 已注册且满足 | 可用。 |

## 刷新行为

- 第一次请求使用独立 Loading 或 Failure 状态。
- 页面拥有的 Timer 每 10 秒刷新一次 `All` 快照。
- 手动刷新与 Timer 刷新会合并到同一个进行中请求。
- 刷新失败时保留上一份快照。
- 每次 Facade 调用前都会重新检查授权。
- 离开页面会取消 Timer，并确定性等待自身工作结束。

Dashboard 不提供多实例聚合或持久时间线。每次刷新都会在承载当前 Blazor Circuit 的宿主上执行检查。
