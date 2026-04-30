---
title: Scenarios
description: AI UI 的常见页面组合和使用方式。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 完整 AI 工作台

注册 `Mo.AddAIUI()` 的默认配置即可获得聊天、Provider 管理和能力管理三类页面。适合开发、调试和内部管理。

## 场景 2 — 只开放 Provider 管理

如果业务系统已有自己的聊天入口，可以禁用聊天页，只保留 Provider 管理页和能力管理页。

## 场景 3 — 聊天中显式引用 Skill 或 MCP

在聊天框输入 `/` 后选择 Skill 或 MCP，UI 会生成 Badge。这个显式引用会让当前消息聚焦到相关能力，避免 Agent 在可用工具很多时盲目选择。

## Common mistakes

- 只注册 `Mo.AddAIUI()`，但没有配置可用 Provider，聊天页会加载但没有可用模型。
- 关闭 `DisableAICapabilityPage` 后仍期望在 UI 管理 Skill / MCP；该页面会完全不注册。
- 把 `DefaultKnowledgeBaseIds` 当作权限控制；它只是 UI 默认选择。
