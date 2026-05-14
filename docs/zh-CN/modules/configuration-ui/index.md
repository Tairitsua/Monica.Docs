---
title: Configuration UI
description: Configuration 的 Blazor 操作台，用于查看 schema、编辑配置、保存变更组、查看历史和诊断 provider。
sidebar_position: 1
---

# Configuration UI

`Monica.Configuration.UI` 是 `Monica.Configuration` 的操作台模块。它通过 `ConfigurationFacade` 读取配置定义、来源链路、有效值和历史，并把用户的修改暂存在 UI 状态中，最后作为一个 mutation group 保存。

## 何时使用这个模块

- 需要给运维或开发人员提供可视化配置管理入口。
- 需要查看某个值来自 Json、环境变量、内存、数据库、Redis 或 Dapr。
- 需要在保存前暂存多个配置修改，并以一个审计组提交。
- 需要查看配置历史、回滚历史行或回滚整组变更。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.Configuration.UI` |
| 注册入口 | `Mo.AddConfigurationUI()` |
| 相关基础模块 | [`Mo.AddConfiguration()`](../configuration/index.md) |

## 页面

| Page | Route | Navigation |
|---|---|---|
| 配置状态 | `/configuration/state` | `Configuration` 分类，顺序 `10` |
| 配置历史 | `/configuration/history` | `Configuration` 分类，顺序 `20` |
| 配置 Debug | `/configuration/debug` | `Configuration` 分类，顺序 `30` |
| Provider 状态 | `/configuration/providers` | `Configuration` 分类，顺序 `40` |

## 公开使用面

- `Mo.AddConfigurationUI()`：注册 UI 模块。
- `ModuleConfigurationUIOption`：当前没有公开属性。
- `ConfigurationStateStore`：页面级暂存状态服务。

UI 模块不直接操作存储 provider。所有读取、mutation、history、rollback 都通过 `ConfigurationFacade` 完成。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Configuration](../configuration/index.md)
