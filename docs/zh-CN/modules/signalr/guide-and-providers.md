---
title: Guide and Providers
description: SignalR 的 Guide 方法、Provider 选择与依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `AddSignalR<TIHubOperator, THubOperator, TContract, TUser>(...)` | 注册 Hub Operator、SignalR 服务和 JSON 协议配置 | 是 | 所有 SignalR 模块接入的起点。 |
| `AddSignalRSwagger(Action<SignalRSwaggerGenOptions>)` | 把 Hub 元数据接入 Swagger 生成 | 否 | 你希望在文档中展示 SignalR 契约时。 |
| `MapSignalRHub<THub>(pattern)` | 映射 Hub 路由并记录元数据 | 否，但通常必需 | 真正对外暴露 Hub 入口时。 |

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| 当前用户投影 Operator | `CurrentUserSignalRHubOperator<TContract, THub>` | 你的用户模型直接使用 `ICurrentUser` 时。 |
| 自定义用户投影 Operator | 继承 `SignalRHubOperator<TContract, THub, TUser>` | 你要把 Claims 投影到自定义用户模型时。 |
| 调试 UI | `Mo.AddSignalRUI()` | 你需要浏览器内调试与连接检查时。 |

## Module dependencies

- 如果 `TUser` 选择 `ICurrentUser`，通常会与 Monica 的身份模块一起使用。
- Hub 元数据与连接信息可通过 `SignalRFacade` 和 UI 调试页读取。
