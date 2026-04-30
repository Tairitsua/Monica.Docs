---
title: AI UI
description: 提供 AI Chat、Provider 管理和 Skill / MCP 能力管理页面。
sidebar_position: 1
---

# AI UI

`AI UI` 模块提供 Monica AI 的 Blazor 管理界面，包括聊天页、Provider 管理页、Skill / MCP 能力管理页，以及聊天输入中的知识库选择和斜杠能力引用。

## 何时使用这个模块

- 你要给应用提供内置 AI Chat 页面。
- 你需要在 UI 中查看 Provider、测试模型、管理系统提示词。
- 你希望可视化启用或禁用 Skill / MCP，并在聊天中显式引用能力。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.AI.UI` |
| 注册入口 | `Mo.AddAIUI()` |
| 相关基础模块 | `Mo.AddAI()` |

## 页面

| Page | Route | Navigation |
|---|---|---|
| AI Chat | `/ai-chat` | `AI` 分类，顺序 `1` |
| AI Provider 管理 | `/ai-providers` | `AI` 分类，顺序 `2` |
| AI 能力 | `/ai/capabilities` | `AI` 分类，顺序 `3` |

## 公开使用面

- `ModuleAIUIOption`：控制页面开关、聊天显示选项、默认知识库和请求超时。
- `ChatPageState`：聊天页状态协调服务。
- `ChatSessionStore`：UI 层会话存储。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [AI](../ai/index.md)
- [KnowledgeBase UI](../knowledge-base-ui/index.md)
- [RAG UI](../rag-ui/index.md)
