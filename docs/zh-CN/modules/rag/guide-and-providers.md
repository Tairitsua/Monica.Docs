---
title: Guide and Providers
description: RAG 的 Guide 方法、向量库 Provider、切块器和依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `UseVectorStoreInMemoryProvider()` | 注册内存向量库 | 是，三选一 | 本地开发、测试、演示。 |
| `UseVectorStoreProvider<TVectorStore>()` | 注册自定义 `VectorStore` | 是，三选一 | 使用 Microsoft.Extensions.VectorData 兼容的自定义向量库。 |
| `UseVectorStoreQdrantProvider(...)` | 注册 Qdrant 向量库 | 是，三选一 | 生产或持久化向量数据。 |
| `UseDocumentIndexStateStore<TStore>()` | 通过 KnowledgeBase 替换文档索引状态存储 | 否 | 分布式或数据库存储。 |
| `UseKnowledgeDocumentSourceStore<TStore>()` | 通过 KnowledgeBase 替换源文档内容存储 | 否 | 文档正文存放到外部系统。 |
| `UseChunkerRoutingStore<TStore>()` | 替换切块器路由存储 | 否 | 扩展名路由需要集中管理。 |
| `UseChunkerRoutingFileProvider()` | 使用文件型切块器路由存储 | 否 | 单机默认实现。 |
| `AddFakeEmbeddingsModel(...)` | 注册 Fake Embedding Provider 和模型 | 否 | 本地跑通 RAG 流程。 |
| `AddChunker<TChunker>()` | 注册自定义文档切块器 | 否 | 处理自定义格式或切块策略。 |
| `AddBuiltInChunker(...)` / `AddBuiltInChunkers(...)` | 注册内置切块器 | 否 | 显式控制内置 Markdown 切块器集合。 |

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| In-Memory | `UseVectorStoreInMemoryProvider()` | 开发、测试、无持久化需求。 |
| Qdrant | `UseVectorStoreQdrantProvider(...)` | 需要持久化、独立向量库和可观测连接配置。 |
| Custom VectorStore | `UseVectorStoreProvider<TVectorStore>()` | 使用其他兼容 Microsoft.Extensions.VectorData 的向量库。 |

## Built-in chunkers

| Chunker | How to enable it | Typical use |
|---|---|---|
| `ProductionMarkdown` | 默认注册或 `AddBuiltInChunker(RAGBuiltInChunkerType.ProductionMarkdown)` | 面向真实 Markdown 文档的标题和段落感知切块。 |
| `SimpleMarkdown` | 默认注册或 `AddBuiltInChunker(RAGBuiltInChunkerType.SimpleMarkdown)` | 简单 Markdown 文档或测试场景。 |

## Module dependencies

- `Mo.AddKnowledgeBase()`：提供知识库、文档库存和源文档内容。
- `Mo.AddMarkdown()`：支持 Markdown 文档解析和导入。
- `Mo.AddAI()`：提供 Embedding Provider 和 Agent 集成。
