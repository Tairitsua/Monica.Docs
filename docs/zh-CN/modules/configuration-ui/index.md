---
title: Configuration UI
description: Configuration 的 Blazor 操作台，用于查看运行时来源链路、编辑配置、导入导出参数、保存变更组、查看历史和诊断存储状态。
sidebar_position: 1
---

`Monica.Configuration.UI` 是 `Monica.Configuration` 的操作台模块。它通过 `ConfigurationFacade` 读取配置定义、运行时有效值、source chain、存储状态和历史，并把用户的修改暂存在 UI 状态中，最后作为一个 mutation group 保存。

UI 的核心原则是：**页面展示的是当前运行时真正生效的值；保存时写入当前生效且可写的目标 source。**

如果当前值来自 Monica effective store，修改会写 Monica store。如果当前值被一个可写 JSON file provider 覆盖，修改会写那个 JSON 文件。如果当前值来自环境变量、命令行或不支持写入的 provider，UI 会禁用编辑并说明原因。

## 何时使用这个模块

- 需要给运维或开发人员提供可视化配置管理入口。
- 需要查看一个配置值到底来自 Monica store、JSON 文件、环境变量还是其他 provider。
- 需要暂存多个配置修改，并以一个审计组保存。
- 需要导出当前环境参数、导入参数包，或通过 JSON 编辑某个配置定义/复杂节点。
- 需要查看配置历史、diff、source target、回滚历史行、回滚 grouped history 或回滚整组变更。
- 需要查看 runtime provider 列表、source inventory、JSON file view 和 store health。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.Configuration.UI` |
| 注册入口 | `monica.AddConfigurationUI()` |
| 相关基础模块 | [`monica.AddConfiguration()`](../configuration/index.md) |

## 页面

| Page | Route | Navigation | 主要能力 |
|---|---|---|---|
| 配置状态 | `/configuration/state` | `Configuration` 分类，顺序 `10` | 搜索定义/配置项、查看 runtime effective value、source chain、scalar/complex/JSON 编辑、导入导出、保存变更组。 |
| 配置历史 | `/configuration/history` | `Configuration` 分类，顺序 `20` | 查看单条 history、mutation group、外部 source 标记、diff timeline、回滚。 |
| 配置 Debug | `/configuration/debug` | `Configuration` 分类，顺序 `30` | 查看当前 Microsoft configuration debug view。 |
| 配置来源 | `/configuration/storage` | `Configuration` 分类，顺序 `40` | 查看 store bundle、provider order、source inventory、有效数量、JSON file view、unmanaged key。 |

## 公开使用面

- `monica.AddConfigurationUI()`：注册 UI 模块。
- `ModuleConfigurationUIOption`：当前没有公开属性。
- `ConfigurationStateStore`：页面级暂存状态服务。

UI 模块不直接操作 store。所有读取、mutation、history、rollback 和 source inspection 都通过 `ConfigurationFacade` 完成。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Stores](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Configuration 核心模块](../configuration/index.md)
