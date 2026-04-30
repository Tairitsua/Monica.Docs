---
title: Quick Start
description: 安装并注册 KnowledgeBase UI。
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

Mo.AddKnowledgeBase();

Mo.AddRAG()
    .UseVectorStoreInMemoryProvider()
    .AddFakeEmbeddingsModel();

Mo.AddKnowledgeBaseUI();
```

启用知识库管理页时，模块会依赖 `Mo.AddRAG()`。这是因为管理页需要展示和处理 RAG 相关状态，例如 Embedding 绑定、索引状态或向量清理入口。

## 只保留可复用组件

```csharp
Mo.AddKnowledgeBaseUI(options =>
{
    options.DisableKnowledgeBaseManagePage = true;
});
```

禁用页面后，管理页和导航项不会注册，但基础依赖 `Mo.AddKnowledgeBase()` 仍会声明。

## 接下来读什么

- [Configuration](./configuration.md)
- [KnowledgeBase](../knowledge-base/index.md)
- [RAG UI](../rag-ui/index.md)
