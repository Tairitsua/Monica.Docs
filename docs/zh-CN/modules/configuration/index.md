---
title: Configuration
description: 自动发现带 `[Configuration]` 的配置类型，绑定到 `IOptions*`，并提供配置查看、更新、回滚与 Provider 诊断能力。
sidebar_position: 1
---

# Configuration

自动发现带 `[Configuration]` 的配置类型，绑定到 `IOptions*`，并提供配置查看、更新、回滚与 Provider 诊断能力。

## 何时使用这个模块

- 你希望用 Monica 的注解方式注册强类型配置，而不是逐个手写 `Bind`。
- 你需要配置历史、回滚或 Dashboard 管理能力。
- 你要把 ASP.NET Core `Configuration` 与 Monica 的配置元数据模型结合起来。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.Configuration` |
| 注册入口 | `Mo.AddConfiguration()` |
| 相关 UI 模块 | `Mo.AddConfigurationUI()` |

## 公开使用面

- `ConfigurationFacade`：供 Minimal API 与 UI 使用的配置管理入口。
- `ConfigurationAttribute`、`OptionSettingAttribute`：描述配置类型与配置项元数据。
- `IConfigurationHistoryStore`：配置历史存储抽象。
- `ConfigurationUpdateRequest`、`ConfigurationRollbackRequest`、`ConfigurationRoutes` 等模型与路由常量。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
