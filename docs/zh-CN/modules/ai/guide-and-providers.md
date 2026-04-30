---
title: Guide and Providers
description: AI 模块的 Guide 方法、Provider 选择与依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `AddOpenAIProvider(...)` | 注册 OpenAI 或 OpenAI-compatible Provider | 否 | 接入 OpenAI、Azure/OpenAI-compatible 网关或私有模型服务。 |
| `AddAnthropicProvider(...)` | 注册 Anthropic Claude Provider | 否 | 接入 Claude 模型。 |
| `AddFakeProvider(...)` | 注册 Fake Provider | 否 | 本地开发、测试 Embedding 或 RAG 流程。 |
| `AddModel(AIModelInfo)` | 向模型目录补充模型元数据 | 否 | UI 需要展示能力、上下文、成本或维度时。 |
| `AddProvider<TProvider>(...)` | 注册自定义 `IAIProvider` | 否 | 内部网关、私有模型平台或自定义鉴权流程。 |
| `MapAIEndpoints(string routePrefix = "/ai")` | 映射 AI Minimal API 端点 | 否 | 需要开放 `/ai/providers` 等基础端点时。 |

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| OpenAI | `AddOpenAIProvider(...)` | 需要 Chat、Embedding 或 OpenAI-compatible 端点时。 |
| Anthropic | `AddAnthropicProvider(...)` | 使用 Claude 模型作为聊天 Provider 时。 |
| Fake | `AddFakeProvider(...)` 或 RAG 的 `AddFakeEmbeddingsModel(...)` | 本地调试和演示，避免依赖真实 API。 |
| Custom | `AddProvider<TProvider>(...)` | Monica 内置 Provider 不能表达你的模型平台时。 |

## Module dependencies

`AI` 模块会声明依赖并注册：

- `Mo.AddAISkillSystem()`：发现 Monica Skill 并适配给 Agent Framework。
- `Mo.AddMcp()`：发现 Monica MCP Server、外部 MCP Client，并把可用工具接入 Agent。

这两个依赖会随 `Mo.AddAI()` 自动注册。你仍然可以显式调用它们来自定义各自选项。
