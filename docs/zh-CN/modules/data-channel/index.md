---
title: DataChannel
description: 用 DataChannel pipeline 管理外部系统通信通道，并提供状态、异常与重初始化等宿主管理入口。
sidebar_position: 1
---

# DataChannel

用 DataChannel pipeline 管理外部系统通信通道，并提供状态、异常与重初始化等宿主管理入口。

## 何时使用这个模块

- 你要把 TCP、HTTP、文件、消息等外部通信抽象为统一的管道。
- 你需要把通道初始化、状态观察、异常统计与重初始化纳入统一运维面。
- 你希望把具体 channel 的构建集中到一个启动入口里。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.DataChannel` |
| 注册入口 | `Mo.AddDataChannel()` |
| 相关 UI 模块 | `Mo.AddDataChannelUI()` |

## 公开使用面

- `DataChannelFacade`：查询状态、异常摘要与重初始化通道。
- `IDataChannelManager`：读取已注册 DataChannel。
- `IDataChannelSetup`：宿主提供的通道构建入口。
- `ICommunicationEndpoint`、`IPipelineMiddleware` 等管道/通信抽象。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
