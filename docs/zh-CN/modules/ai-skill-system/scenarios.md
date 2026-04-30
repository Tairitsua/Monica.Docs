---
title: Scenarios
description: AI Skill System 的常见使用场景和注意事项。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 为业务模块提供 Agent 工具

业务模块可以把稳定、边界清晰的查询或操作封装为 Skill 工具。Skill 中通过 `RequiredModules` 声明依赖，只有相关模块加载后才可用。

## 场景 2 — 用 XML 注释补全工具说明

如果不想把长说明写在 Attribute 中，可以给方法和参数写 XML 注释。Skill System 依赖 `XmlDocumentation` 模块，会把注释转换为 Agent 工具说明。

## 场景 3 — 在 UI 中按需启用 Skill

`AI UI` 的能力管理页会列出所有发现到的 Skill，包括不可用原因、工具数量、参数和资源。可以在不改代码的情况下临时禁用某个 Skill，降低 Agent 可调用面。

## Common mistakes

- 只定义了 `Skill<TSelf>`，但宿主没有启用 `Mo.AddAISkillSystem()` 或 `Mo.AddAI()`。
- Skill 名称没有保持稳定，导致管理状态文件中的单项启用配置失效。
- 两个方法派生出同一个工具名；应使用 `[SkillTool(Name = "...")]` 明确区分。
