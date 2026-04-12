---
title: SignalR
description: 为 Monica 提供强类型 SignalR Hub 注册、连接跟踪、Hub 元数据检查与可选调试界面。
sidebar_position: 1
---

# SignalR

为 Monica 提供强类型 SignalR Hub 注册、连接跟踪、Hub 元数据检查与可选调试界面。

## 何时使用这个模块

- 你要在 Monica 宿主中注册强类型 SignalR Hub。
- 你需要在服务端按用户或连接选择客户端推送目标。
- 你想把 Hub 元数据、已连接用户和 Swagger/调试能力一并纳入模块化配置。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.SignalR` |
| 注册入口 | `Mo.AddSignalR()` |
| 相关 UI 模块 | `Mo.AddSignalRUI()` |

## 公开使用面

- `SignalRFacade`：读取已注册 Hub 元数据与当前连接用户。
- `ISignalRHubContract`：强类型客户端契约标记接口。
- `SignalRHub<TContract>`：Monica Hub 基类。
- `ISignalRHubOperator<TContract, TUser>`、`CurrentUserSignalRHubOperator<TContract, THub>`：服务端推送抽象。
- `SignalRHubInfo`、`SignalRConnectedUserInfo` 等检查模型。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
