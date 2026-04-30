---
title: Scenarios
description: AI 模块的常见接入方式与使用陷阱。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 注册多个 Provider

同一个应用可以注册多个 Provider，并通过 `ProviderId` 在 UI 或业务代码中选择。

```csharp
Mo.AddAI()
    .AddOpenAIProvider(options =>
    {
        options.ProviderId = "openai";
        options.ApiKey = builder.Configuration["OpenAI:ApiKey"]!;
        options.SupportedModels = ["gpt-4o-mini"];
        options.IsDefault = true;
    })
    .AddAnthropicProvider(options =>
    {
        options.ProviderId = "anthropic";
        options.ApiKey = builder.Configuration["Anthropic:ApiKey"]!;
        options.SupportedModels = ["claude-sonnet-4-20250514"];
    });
```

## 场景 2 — 在 UI 中管理 Skill 和 MCP

`AgentCapabilityFacade` 使用 `CapabilityStateStoreFilePath` 保存全局和单项启用状态。组合 `Mo.AddAIUI()` 后，用户可以在 `/ai/capabilities` 查看 Skill / MCP 描述、工具参数、资源信息，并启用或禁用它们。

## 场景 3 — RAG 需要 Embedding 模型

RAG 的搜索和索引依赖 Embedding 模型。你可以通过真实 Provider 暴露 `EmbeddingModelInfo`，也可以在开发环境使用 RAG Guide 的 `AddFakeEmbeddingsModel()` 快速跑通流程。

## Common mistakes

- 只注册 `Mo.AddAI()`，但没有配置任何可用 Provider，导致聊天页没有可选模型。
- `SupportedModels` 与 `AddModel(...)` 中的模型名不一致，导致 UI 元数据不完整。
- 把 `CapabilityStateStoreFilePath` 指向多个 Host 共享但没有并发策略的位置；多实例部署时应先设计状态存储。
