---
title: Scenarios
description: ProjectUnits 的常见接入方式与使用陷阱。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 把项目结构元数据暴露给运维或开发诊断

对于大型宿主或模块化系统，ProjectUnits 可以作为“运行时结构目录”。它适合回答“当前项目暴露了哪些单元、有哪些领域事件、有哪些枚举”这类问题。

## 场景 2 — 用 Warning 模式逐步收紧命名治理

如果团队想统一应用服务、领域事件、仓储等命名规则，建议先打开 `EnableNameConvention` 并保持 `Warning`，先观察现有代码偏差，再决定是否切到 `Strict`。

## Common mistakes

- 一开始就启用 `Strict` 模式，导致历史项目接入成本过高。
- 关闭 `ParseUnitDetails` 后仍然期望看到完整的单元细节和文档信息。
