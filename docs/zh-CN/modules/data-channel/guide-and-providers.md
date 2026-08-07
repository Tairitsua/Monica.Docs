---
title: 注册扩展与 Provider
description: DataChannel 的注册扩展、Provider 选择与依赖说明。
sidebar_position: 4
---

## 注册扩展

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `UseSetup<TSetup>()` | 注册 `IDataChannelSetup` 启动入口 | 是 | 所有 DataChannel pipeline 的宿主构建入口。 |

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| 通道构建入口 | `UseSetup<TSetup>()` | 把所有 pipeline 组装逻辑收敛到一个启动入口时。 |
| 运维 UI | `monica.AddDataChannelUI()` | 你要查看通道状态、异常和重初始化操作时。 |

## Module dependencies

- 模块会自动声明 `ObservableInstance` 依赖，用于状态与异常可观测能力。
- 如果需要可视化运维界面，可额外接入 `monica.AddDataChannelUI()`。
