---
title: RAG
description: 在 KnowledgeBase 基础上提供文档切块、Embedding、向量索引、搜索和 Agent 知识工具。
sidebar_position: 1
---

# RAG

`RAG` 模块在 `KnowledgeBase` 的文档清单和源内容之上，增加文档切块、Embedding 模型绑定、向量集合管理、批量索引和文本检索。它也注册内置知识工具，让 AI Chat 可以按知识库进行检索增强。

## 何时使用这个模块

- 你要为知识库文档建立向量索引。
- 你需要在业务代码或 AI Chat 中执行知识库搜索。
- 你要管理切块器、Embedding 模型、向量库连接和索引队列。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.AI` |
| 注册入口 | `Mo.AddRAG()` |
| 相关 UI 模块 | `Mo.AddRAGUI()` |

## 公开使用面

- `RAGFacade`：搜索、向量库诊断、索引队列、批量索引和文档 Chunk 查看。
- `EmbeddingModelFacade`：列出 Embedding 模型、测试连接、绑定知识库 Embedding 模型。
- `ChunkerFacade`：查看切块器、预览和应用扩展名路由、测试切块效果。
- `IDocumentChunker`、`IChunkerRoutingStore`：自定义切块器和路由存储扩展点。
- `TextSearchResult`、`IndexingProgress`、`VectorStoreDiagnosticInfo`、`ChunkerManagementState`：RAG 管理和搜索模型。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [KnowledgeBase](../knowledge-base/index.md)
- [RAG UI](../rag-ui/index.md)
