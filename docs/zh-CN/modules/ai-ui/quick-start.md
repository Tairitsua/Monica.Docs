---
title: Quick Start
description: 安装并注册 AI UI 页面。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.AI.UI
```

## 最小注册

```csharp
using Monica.Modules;

Mo.AddAI()
    .AddOpenAIProvider(options =>
    {
        options.ApiKey = builder.Configuration["OpenAI:ApiKey"]!;
        options.SupportedModels = ["gpt-4o-mini"];
        options.IsDefault = true;
    });

Mo.AddAIUI();
```

`Mo.AddAIUI()` 会依赖 `Mo.AddAI()`。启用聊天页时，它还会依赖 `Mo.AddKnowledgeBase()`，用于聊天中的知识库选择。

## 只启用管理页

```csharp
Mo.AddAIUI(options =>
{
    options.DisableAIChatPage = true;
    options.DisableAIProviderPage = false;
    options.DisableAICapabilityPage = false;
});
```

## 使用斜杠能力引用

聊天输入框输入 `/` 后，会列出当前 Skill 和 MCP 候选。继续输入部分名称可模糊过滤，按 `Tab` 可补全成 Badge。发送消息时，这些引用会显式传给 AI 运行时。

## 接下来读什么

- [Configuration](./configuration.md)
- [AI](../ai/index.md)
- [AI Skill System](../ai-skill-system/index.md)
- [MCP](../mcp/index.md)
