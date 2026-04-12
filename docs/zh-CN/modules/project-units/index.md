---
title: ProjectUnits
description: 扫描项目类型并提取项目单元、领域事件与枚举元数据，用于结构诊断、命名治理与可视化。
sidebar_position: 1
---

# ProjectUnits

扫描项目类型并提取项目单元、领域事件与枚举元数据，用于结构诊断、命名治理与可视化。

## 何时使用这个模块

- 你想在运行时查看当前项目有哪些应用服务、领域事件、枚举等结构单元。
- 你希望通过命名约定对项目结构做警告或严格校验。
- 你需要一个面向架构治理的运行时元数据面。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.Framework` |
| 注册入口 | `Mo.AddProjectUnits()` |
| 相关 UI 模块 | `Mo.AddProjectUnitsUI()` |

## 公开使用面

- `ProjectUnitsFacade`：读取项目单元、领域事件与枚举元数据。
- `ModuleProjectUnitsOption`：开启命名约定与请求过滤等能力。
- `ProjectUnitNamingOptions`、`ProjectUnitNamingRule`、`ENameConventionMode`：描述命名治理规则。
- `ProjectUnit` 及相关 DTO：表示发现到的项目结构单元。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
