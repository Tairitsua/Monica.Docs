---
title: Scenarios
description: KnowledgeBase 的常见知识库和文档管理场景。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 从 Markdown 文档组导入

如果应用已经注册 Markdown 文档目录，`KnowledgeBaseFacade` 可以列出文档组，并把选中的 Markdown 文档导入知识库文档清单。导入后文档处于待索引状态，真正的向量索引由 RAG 模块执行。

## 场景 2 — 上传独立文本

通过 `UploadDocumentAsync` 可以把文本内容写入知识库源文档存储，并加入文档库存。适合把用户上传的说明、FAQ 或业务文本纳入知识集合。

## 场景 3 — 删除知识库时联动 RAG 清理

当 Host 同时注册了 RAG 模块，`KnowledgeBaseFacade.DeleteAsync`、`RemoveDocumentAsync` 和 `ClearDocumentsAsync` 会优先调用 RAG 清理逻辑，以删除对应向量和索引元数据。

## Common mistakes

- 把 `KnowledgeBase` 当作向量搜索模块；它只管理知识库和文档库存，搜索能力在 RAG 中。
- 修改知识库 ID 后仍期望原有向量集合可复用；ID 是向量集合和状态存储的业务键。
- 多实例部署仍使用默认本地文件存储，导致不同实例看到的知识库状态不一致。
