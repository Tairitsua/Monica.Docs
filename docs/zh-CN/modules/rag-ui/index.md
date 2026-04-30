---
title: RAG UI
description: 提供 RAG 管理、搜索调试和切块器管理页面。
sidebar_position: 1
---

# RAG UI

`RAG UI` 模块提供 RAG 的 Blazor 管理界面，包括索引与队列管理、检索调试、向量库诊断、Embedding 模型绑定和切块器路由管理。它依赖后端 RAG 模块，并默认组合 KnowledgeBase UI。

## 何时使用这个模块

- 你要在 UI 中管理知识库索引队列和批量索引。
- 你需要调试检索结果、查看 Chunk 和向量库诊断。
- 你要可视化管理文档扩展名到切块器的路由。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.AI.UI` |
| 注册入口 | `Mo.AddRAGUI()` |
| 相关基础模块 | `Mo.AddRAG()` |

## 页面

| Page | Route | Navigation |
|---|---|---|
| RAG 管理 | `/ai/rag/manage` | `KnowledgeRetrieval` 分类，顺序 `4` |
| RAG Debug | `/ai/rag/debug` | `KnowledgeRetrieval` 分类，顺序 `5` |
| RAG Chunkers | `/ai/rag/chunkers` | `KnowledgeRetrieval` 分类，顺序 `6` |

## 公开使用面

- `ModuleRAGUIOption`：控制三个 RAG 页面是否注册。
- `RAGManagePageState`：RAG 管理页状态协调服务。
- `RAGQueuePollingState`：索引队列轮询状态服务。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [RAG](../rag/index.md)
- [KnowledgeBase UI](../knowledge-base-ui/index.md)
