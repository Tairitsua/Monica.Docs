---
title: Guide and Providers
description: AutoModel 的 Guide 方法、Provider 选择与依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

这个模块没有额外公开的 Guide 方法，通常直接通过 `Mo.AddAutoModel()` 进入即可。

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| 默认数据库过滤 Provider | 内置注册，无需额外 Guide | 大多数 `IQueryable<T>` 动态过滤场景。 |
| 默认内存过滤 Provider | 内置注册，无需额外 Guide | 对内存集合进行同语法过滤时。 |
| 快照工厂 | 内置 `IAutoModelSnapshotFactory` | 需要读取当前实体公开字段快照时。 |

## Module dependencies

- 默认会声明异常处理模块依赖；如果设置 `DisableExceptionHandling = true`，则不再自动声明。
- 常与 `AutoControllers`、仓储查询和通用列表页面组合使用。
