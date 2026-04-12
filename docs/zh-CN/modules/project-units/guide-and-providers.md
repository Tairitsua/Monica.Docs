---
title: Guide and Providers
description: ProjectUnits 的 Guide 方法、Provider 选择与依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

这个模块没有额外公开的 Guide 方法，通常直接通过 `Mo.AddProjectUnits()` 进入即可。

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| XML 文档细节解析 | `ParseUnitDetails = true`（默认） | 你希望单元详情包含更多文档信息时。 |
| 请求过滤能力 | `EnableRequestFilter = true` | 你需要通过模块管理请求过滤状态时。 |
| 运维 UI | `Mo.AddProjectUnitsUI()` | 需要可视化查看项目单元与枚举信息时。 |

## Module dependencies

- `ParseUnitDetails = true` 时会自动声明 XML Documentation 模块依赖。
- 模块始终会依赖 EventBus，以支持领域事件相关能力。
