---
title: Guide and Providers
description: AutoControllers 的 Guide 方法、Provider 选择与依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

这个模块没有额外公开的 Guide 方法，通常直接通过 `Mo.AddAutoControllers(...)` 进入即可。

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| 自动 CRUD 发现 | 通过实现 `ICrudApplicationService` 并满足命名约定 | 需要统一生成 CRUD 路由时。 |
| 普通 Controller 发现 | 直接定义 `ControllerBase` 派生类 | 你仍然需要保留手写控制器时。 |

## Module dependencies

- 模块会自动声明 `AutoModel` 依赖，用于 CRUD 查询侧的动态筛选能力。
- 模块内部会接入 MVC / Controller 管线与 API Explorer。
