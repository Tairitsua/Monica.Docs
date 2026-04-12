---
title: Guide and Providers
description: Configuration 的 Guide 方法、Provider 选择与依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `ConfigCustomStore<TStore>()` | 替换配置历史存储实现 | 否 | 你要把配置更新/回滚记录持久化到自定义存储时。 |

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| 默认历史存储 | 不额外配置 | 本地开发或不要求持久化历史时，使用内置内存实现。 |
| 自定义历史存储 | `ConfigCustomStore<TStore>()` | 你要把配置变更历史写入数据库或外部存储时。 |
| 附加配置源 | `SetOtherSourceAction` | 需要额外追加 JSON、环境变量或其他 `ConfigurationProvider` 时。 |

## Module dependencies

- 模块直接建立在 ASP.NET Core Configuration / Options 模式之上。
- 如果你要 UI 管理入口，可额外组合 `Mo.AddConfigurationUI()`。
