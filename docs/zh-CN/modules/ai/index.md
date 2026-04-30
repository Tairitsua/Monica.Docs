---
title: AI
description: 注册 AI Provider、模型目录、聊天 Facade 与面向 Agent 的能力状态管理。
sidebar_position: 1
---

# AI

`AI` 模块是 Monica 的 AI 基础设施入口。它统一注册 Provider、模型元数据、聊天会话、流式响应，以及 Skill / MCP 能力的全局启用状态；UI、RAG、Skill System 与 MCP 都围绕这个运行时能力层组合。

## 何时使用这个模块

- 你要在 Monica 应用中接入 OpenAI、Anthropic 或 OpenAI-compatible Provider。
- 你要使用 `ChatFacade`、`ProviderFacade` 或 `AgentCapabilityFacade`。
- 你要让 RAG、Skill、MCP 能力参与 AI Chat。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.AI` |
| 注册入口 | `Mo.AddAI()` |
| 相关 UI 模块 | `Mo.AddAIUI()` |

## 公开使用面

- `ChatFacade`：创建聊天会话、发送流式消息、编辑消息、重试消息。
- `ProviderFacade`：查看 Provider、测试 Provider / 模型、拉取远端模型、探测 Embedding 维度。
- `AgentCapabilityFacade`：查看和启停 Skill / MCP 能力，并测试 MCP 连通性。
- `IAIProvider`、`IAIProviderFactory`、`IAIChatAgentFactory`、`IAIChatAgentDecorator`：自定义 Provider 与 Agent 创建链的扩展点。
- `AIProviderInfo`、`AIModelInfo`、`ChatSession`、`AIChatMessage`：Host 与 UI 共享的运行时模型。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [AI UI](../ai-ui/index.md)
- [RAG](../rag/index.md)
- [AI Skill System](../ai-skill-system/index.md)
- [MCP](../mcp/index.md)
