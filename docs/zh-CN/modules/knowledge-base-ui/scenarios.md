---
title: Scenarios
description: KnowledgeBase UI 的常见使用场景。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 让运营人员管理知识库

默认注册 `Mo.AddKnowledgeBaseUI()` 后，用户可以通过 `/ai/knowledge-bases` 创建知识库、导入 Markdown 文档、上传文本、查看文档状态和预览内容。

## 场景 2 — 与 RAG UI 配合完成索引

KnowledgeBase UI 负责知识库和文档清单；RAG UI 负责索引、向量库诊断、切块器和搜索调试。真实项目通常同时注册两者。

## 场景 3 — 聊天页只使用知识库选择

如果不希望用户直接管理知识库页面，但聊天页仍需要选择知识库，可以禁用管理页，仅保留基础模块和可复用 UI 依赖。

## Common mistakes

- 以为禁用管理页会禁用后端 `KnowledgeBase`；它只影响 UI 页面。
- 没有配置 RAG 向量库，却希望管理页完成索引；RAG 仍需要 `UseVectorStore...` 配置。
- 把知识库管理和 RAG 调试混为一个页面；两者在导航上是独立职责。
