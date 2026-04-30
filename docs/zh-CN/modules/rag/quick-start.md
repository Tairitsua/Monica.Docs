---
title: Quick Start
description: 安装并注册 RAG 模块，跑通本地向量索引。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.AI
```

## 开发环境最小注册

```csharp
using Monica.Modules;

Mo.AddAI();

Mo.AddRAG()
    .UseVectorStoreInMemoryProvider()
    .AddFakeEmbeddingsModel();
```

`UseVectorStoreInMemoryProvider()` 适合本地开发和演示；进程重启后向量数据不会保留。`AddFakeEmbeddingsModel()` 会通过统一 AI Provider 管线注册一个 Fake Embedding 模型，方便不接真实模型也能跑通流程。

## Qdrant 注册

```csharp
Mo.AddAI()
    .AddOpenAIProvider(options =>
    {
        options.ProviderId = "openai";
        options.ApiKey = builder.Configuration["OpenAI:ApiKey"]!;
        options.SupportedModels = ["text-embedding-3-small"];
    });

Mo.AddRAG()
    .UseVectorStoreQdrantProvider(options =>
    {
        options.Host = "localhost";
        options.Port = 6334;
        options.Https = false;
    });
```

索引前，需要在知识库上绑定可用的 Embedding 模型。可以通过 `EmbeddingModelFacade` 或 `RAG UI` 完成。

## 搜索知识库

```csharp
using Monica.AI.RAG.Facades;

public sealed class KnowledgeSearchService(RAGFacade rag)
{
    public async Task SearchAsync()
    {
        var result = await rag.SearchAsync(
            query: "How is delay flight handled?",
            kbIds: ["flight-ops"],
            topK: 5);

        if (result.IsFailed(out var error, out var matches))
        {
            throw new InvalidOperationException(error.Message);
        }

        foreach (var match in matches)
        {
            Console.WriteLine(match.Text);
        }
    }
}
```

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [RAG UI](../rag-ui/index.md)
