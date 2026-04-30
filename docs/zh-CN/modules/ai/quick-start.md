---
title: Quick Start
description: 安装并注册 AI 模块，配置第一个 Provider。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.AI
```

## 最小注册

```csharp
using Monica.AI.Models;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddAI()
    .AddOpenAIProvider(options =>
    {
        options.ProviderId = "openai";
        options.DisplayName = "OpenAI";
        options.ApiKey = builder.Configuration["OpenAI:ApiKey"]!;
        options.SupportedModels = ["gpt-4o-mini"];
        options.IsDefault = true;
    });

builder.UseMonica();

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

## 添加自定义模型元数据

Provider 的 `SupportedModels` 决定运行时允许选择哪些模型。若要让 UI 和诊断页显示更完整的信息，可以额外把模型元数据加入模型目录：

```csharp
Mo.AddAI()
    .AddModel(new LLMModelInfo
    {
        ModelName = "my-chat-model",
        Description = "Internal OpenAI-compatible chat model.",
        SupportsReasoning = true,
        ContextWindow = 128000
    })
    .AddOpenAIProvider(options =>
    {
        options.ProviderId = "internal-openai";
        options.DisplayName = "Internal OpenAI";
        options.ApiKey = builder.Configuration["InternalOpenAI:ApiKey"]!;
        options.BaseUrl = builder.Configuration["InternalOpenAI:BaseUrl"];
        options.SupportedModels = ["my-chat-model"];
        options.IsDefault = true;
    });
```

## 组合 UI

如果要直接使用聊天、Provider 管理和能力管理页面，同时注册 `AI UI`：

```csharp
Mo.AddAI()
    .AddOpenAIProvider(options =>
    {
        options.ApiKey = builder.Configuration["OpenAI:ApiKey"]!;
        options.SupportedModels = ["gpt-4o-mini"];
        options.IsDefault = true;
    });

Mo.AddAIUI();
```

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [AI UI](../ai-ui/index.md)
