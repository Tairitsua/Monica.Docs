---
title: Configuration
description: AI UI 的页面开关和聊天显示选项。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `DisableAIChatPage` | `bool` | `false` | 否 | 不希望注册 `/ai-chat` 时 | 同时会避免聊天页依赖 KnowledgeBase。 |
| `DisableAIProviderPage` | `bool` | `false` | 否 | 不需要 Provider 管理页时 | `/ai-providers` 不加入导航。 |
| `DisableAICapabilityPage` | `bool` | `false` | 否 | 不需要 Skill / MCP 管理页时 | `/ai/capabilities` 不加入导航。 |
| `EnableMarkdown` | `bool` | `true` | 否 | 保留给聊天 Markdown 行为配置 | 当前聊天页启用时会通过 Shell UI 注册 Markdown 支持。 |
| `ShowProviderSelector` | `bool` | `true` | 否 | 需要固定 Provider，不允许 UI 切换时 | 控制聊天页 Provider 选择器显示。 |
| `ShowSessionList` | `bool` | `true` | 否 | 需要更简化的聊天 UI 时 | 控制最近会话侧栏。 |
| `DefaultSystemPrompt` | `string?` | `null` | 否 | UI 层要覆盖后端默认提示词时 | 仅影响 UI 创建会话时的默认值。 |
| `MessageMaxWidth` | `string` | `"80%"` | 否 | 聊天气泡宽度需要调整时 | CSS 长度字符串。 |
| `RequestTimeoutMs` | `int` | `60000` | 否 | 聊天请求超时需要调整时 | `0` 表示不超时。 |
| `ShowConnectionStatus` | `bool` | `false` | 否 | 需要显示连接状态时 | 默认为隐藏。 |
| `EnableAutoScroll` | `bool` | `true` | 否 | 不希望新消息自动滚到底部时 | 影响聊天消息列表。 |
| `DefaultKnowledgeBaseIds` | `List<string>` | `[]` | 否 | 聊天页默认预选知识库时 | 只影响 UI 初始选择。 |
| `ShowKnowledgeBaseSelector` | `bool` | `true` | 否 | 不允许用户选择知识库时 | 控制聊天输入区的知识库选择器。 |

## Required setup

本模块没有必需 Guide 配置。若启用任意页面，会自动注册本模块自己的本地化资源；页面显示依赖 Shell UI。
