---
title: Scenarios
description: RAG 的索引、搜索、切块和向量库管理场景。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 本地演示 RAG

组合内存向量库和 Fake Embedding 模型，可以在没有外部服务的情况下演示知识库创建、文档导入、索引和搜索。

```csharp
Mo.AddRAG()
    .UseVectorStoreInMemoryProvider()
    .AddFakeEmbeddingsModel(dimensions: 384);
```

## 场景 2 — 使用 Qdrant 持久化向量

生产或长期测试环境建议使用 Qdrant。注意 `ModuleRAGQdrantOption.Port` 默认是 gRPC 端口 `6334`。

## 场景 3 — 调整 Markdown 切块策略

当检索结果过短、过长或上下文重复过多时，优先调整 `ProductionChunkerTargetChars`、`ProductionChunkerMaxChars`、`ProductionChunkerMinChars` 和 `ProductionChunkerOverlapChars`。更复杂的格式可以实现 `IDocumentChunker` 并通过 `AddChunker<TChunker>()` 注册。

## 场景 4 — 在 AI Chat 中使用知识库

注册 `AI UI` 后，聊天输入区可以选择知识库。发送消息时，所选知识库会进入运行时上下文，RAG 知识工具会按知识库执行检索。

## Common mistakes

- 没有调用任何 `UseVectorStore...` 方法，导致 RAG 启动期缺少必需配置。
- 用 Qdrant HTTP 端口 `6333` 填到 `Port`；当前配置使用 gRPC 端口，默认 `6334`。
- 只导入文档但没有执行索引，搜索自然没有向量结果。
- 更换 Embedding 模型后没有清理或重建索引，导致向量维度或语义空间不一致。
