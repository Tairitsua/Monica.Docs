---
title: AutoModel
description: 为实体提供动态过滤、字段快照与内存/数据库双栈查询能力，常用于自动 CRUD 和通用查询场景。
sidebar_position: 1
---

# AutoModel

为实体提供动态过滤、字段快照与内存/数据库双栈查询能力，常用于自动 CRUD 和通用查询场景。

## 何时使用这个模块

- 你需要把用户输入的筛选表达式安全地作用到 `IQueryable<T>` 或 `IEnumerable<T>` 上。
- 你希望通过注解显式描述哪些实体字段可以参与筛选与展示。
- 你正在为 `AutoControllers`、通用列表查询或后台检索能力提供底层过滤支持。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.AutoModel` |
| 注册入口 | `Mo.AddAutoModel()` |
| 相关 UI 模块 | 无 |

## 公开使用面

- `IAutoModelDbOperator<TModel>`：把过滤表达式应用到数据库查询。
- `IAutoModelMemoryOperator<TModel>`：把同一套过滤规则应用到内存集合。
- `IAutoModelSnapshot<TModel>` / `IAutoModelSnapshotFactory`：读取并预热实体的 AutoModel 快照。
- `AutoTableAttribute`、`AutoFieldAttribute`：声明表级与字段级的公开筛选元数据。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
