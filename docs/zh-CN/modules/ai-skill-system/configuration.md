---
title: Configuration
description: AI Skill System 的选项、发现规则与启用状态。
sidebar_position: 3
---

# Configuration

## Module options

`ModuleSkillSystemOption` 当前没有公开配置属性。模块启用后会扫描 Monica 模块加载范围内的非抽象 `Skill` 类型。

## Discovery rules

| Rule | Behavior |
|---|---|
| 基类 | 具体 Skill 应继承 `Skill<TSelf>`。 |
| 工具方法 | 带 `[SkillTool]` 且未设置 `Disabled = true` 的实例或静态方法会被发现。 |
| 工具名称 | 未显式设置 `Name` 时，会从方法名派生工具名。 |
| 参数描述 | 参数上的 `[SkillTool(Description = ...)]` 或 XML 注释会进入工具参数说明。 |
| 重名处理 | 同一个 Skill 内工具名重复会在目录构建时抛出异常。 |
| 可用性 | `IsEnabled` 为 `false` 或 `RequiredModules` 未加载时，该 Skill 会在目录中显示为不可用。 |

## Runtime enablement

Skill 的运行时启用状态不在 `ModuleSkillSystemOption` 中，而是由 [AI](../ai/index.md) 模块的 `AgentCapabilityFacade` 和 `CapabilityStateStoreFilePath` 管理：

- 全局 Skill Catalog 可以启用或禁用。
- 每个 Skill Entry 可以单独启用或禁用。
- 禁用状态会影响 AI Chat 可用工具，但管理页仍能展示目录信息。

## Required setup

本模块没有必需 Guide 配置。要让 Skill 真正参与聊天，需要同时启用 `Mo.AddAI()`，并配置至少一个可用聊天 Provider。
