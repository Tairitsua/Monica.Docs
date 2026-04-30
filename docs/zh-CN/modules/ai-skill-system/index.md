---
title: AI Skill System
description: 发现 Monica Skill 类型，并在 AI 模块启用时适配为 Agent Framework Skill。
sidebar_position: 1
---

# AI Skill System

`AI Skill System` 模块负责发现继承自 `Skill<TSelf>` 的 Monica Skill 类型，将 `[SkillTool]` 方法转换为 Agent 可调用工具，并把 Skill 的说明、资源、工具参数展示给管理 UI。Skill 定义本身位于 `Monica.Core`，只有启用本模块后才会参与自动发现和 Agent 运行时。

## 何时使用这个模块

- 你要在 Monica 项目中定义可被 AI Agent 调用的业务 Skill。
- 你希望 Skill 定义不依赖具体 Agent Framework 基类。
- 你需要在 AI 能力管理页查看 Skill、Tool、参数和资源信息。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.AI` |
| 注册入口 | `Mo.AddAISkillSystem()` |
| 相关 UI 模块 | `Mo.AddAIUI()` |

## 公开使用面

- `Skill<TSelf>`：推荐的 Skill 基类，位于 `Monica.Core.Skills`。
- `SkillDefinition`：Skill 的稳定名称、简短描述和完整 Instructions。
- `SkillToolAttribute`：把方法标记为 Agent 可调用工具，也可用于参数描述。
- `SkillResourceAttribute`：把属性或方法标记为 Skill Resource。
- `MonicaSkillCatalog`：运行时 Skill 目录，供 AI Chat 和能力管理使用。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [AI](../ai/index.md)
- [AI UI](../ai-ui/index.md)
