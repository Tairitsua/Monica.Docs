---
title: Quick Start
description: 安装并注册 KnowledgeBase 模块。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.AI
```

## 最小注册

```csharp
using Monica.Modules;

Mo.AddKnowledgeBase();
```

模块会注册文件型状态存储、源文档存储、知识库服务和 `KnowledgeBaseFacade`。默认数据写入应用运行目录下的 `monica_data/rag/...`。

## 创建知识库

```csharp
using Monica.AI.KnowledgeBase.Facades;

public sealed class KnowledgeBaseBootstrapper(KnowledgeBaseFacade facade)
{
    public async Task EnsureAsync()
    {
        var result = await facade.CreateAsync(
            id: "flight-ops",
            name: "Flight Operations",
            description: "Operational documents for flight services.");

        if (result.IsFailed(out var error))
        {
            throw new InvalidOperationException(error.Message);
        }
    }
}
```

知识库 ID 会被向量库、状态存储和源文档存储使用。建议使用小写 kebab-case，并保持稳定。

## 组合 RAG

如果要索引和搜索知识库，需要再注册 [RAG](../rag/index.md)：

```csharp
Mo.AddKnowledgeBase();

Mo.AddRAG()
    .UseVectorStoreInMemoryProvider()
    .AddFakeEmbeddingsModel();
```

## 接下来读什么

- [Configuration](./configuration.md)
- [RAG](../rag/index.md)
- [KnowledgeBase UI](../knowledge-base-ui/index.md)
