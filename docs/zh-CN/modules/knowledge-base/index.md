---
title: KnowledgeBase
description: 管理知识库清单、文档来源和文档库存，为 RAG 与 AI Chat 提供可复用知识集合。
sidebar_position: 1
---

# KnowledgeBase

`KnowledgeBase` 模块负责知识库本体、文档库存和源文档内容存储。它不直接要求向量库；RAG 模块会在此基础上添加 Embedding、索引、搜索和向量清理能力。

## 何时使用这个模块

- 你要维护一组命名知识库和其文档清单。
- 你需要从 Markdown 文档组或上传文本导入知识库文档。
- 你要为 RAG 或 AI Chat 提供可选择的知识集合。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.AI` |
| 注册入口 | `Mo.AddKnowledgeBase()` |
| 相关 UI 模块 | `Mo.AddKnowledgeBaseUI()` |

## 公开使用面

- `KnowledgeBaseFacade`：创建、更新、删除知识库，导入 Markdown，上传、预览、移除和清空文档。
- `IKnowledgeBaseStore`、`IKnowledgeBaseLookupService`：知识库读取和 Agent 查询侧抽象。
- `IDocumentIndexStateStore`：统一文档索引状态存储抽象。
- `IKnowledgeDocumentSourceStore`：源文档内容存储抽象。
- `KnowledgeBase`、`DocumentQueueItem`、`KnowledgeBaseDocumentPreview`：管理页和 Host 使用的公开模型。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [KnowledgeBase UI](../knowledge-base-ui/index.md)
- [RAG](../rag/index.md)
