---
title: Guide and Providers
description: AI Skill System 的 Guide 方法、依赖与扩展点。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `Mo.AddAISkillSystem()` | 启用 Skill 类型发现和 Agent Skill 适配 | 否 | 需要单独启用 Skill 发现时。 |

## Module dependencies

| Dependency | Why it is used |
|---|---|
| `Mo.AddXmlDocumentation()` | 从 XML 文档中读取工具和参数说明，补充 `[SkillTool]` 元数据。 |
| `Mo.AddAI()` | 组合聊天、Provider 和能力启用状态；常规应用通常直接使用它。 |
| `Mo.AddAIUI()` | 提供 Skill / MCP 管理页和聊天斜杠引用。 |

## Public authoring contract

Skill 作者只需要依赖 `Monica.Core` 的基类和注解：

- `Skill<TSelf>` 保存框架无关的 Skill 定义。
- `[SkillTool]` 标记可调用工具。
- `[SkillResource]` 暴露静态或动态资源。

Agent Framework 相关对象由 Monica AI 模块内部适配，Skill 作者不需要继承 `AgentSkill`。
