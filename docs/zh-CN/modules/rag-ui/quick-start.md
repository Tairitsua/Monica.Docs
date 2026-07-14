---
title: Quick Start
description: 安装并注册 RAG UI 页面。
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

builder.AddMonica(monica =>
{
    monica.AddAI();

    monica.AddRAG()
        .UseVectorStoreInMemoryProvider()
        .AddFakeEmbeddingsModel();

    monica.AddRAGUI();
});
```

`monica.AddRAGUI()` 会依赖 `monica.AddRAG()` 和 `monica.AddKnowledgeBaseUI()`。如果 RAG 后端缺少向量库配置，UI 可以注册，但索引和搜索操作会失败。

## 只启用 RAG 管理页

```csharp
builder.AddMonica(monica =>
{
    monica.AddRAGUI(options =>
    {
        options.DisableRAGManagePage = false;
        options.DisableRAGDebugPage = true;
        options.DisableRAGChunkersPage = true;
    });
});
```

## 接下来读什么

- [Configuration](./configuration.md)
- [RAG](../rag/index.md)
- [KnowledgeBase UI](../knowledge-base-ui/index.md)
