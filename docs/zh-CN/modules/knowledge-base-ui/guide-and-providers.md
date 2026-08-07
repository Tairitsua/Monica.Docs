---
title: 注册与 Provider
description: KnowledgeBase UI 的注册和依赖说明。
sidebar_position: 4
---

## 模块注册

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `monica.AddKnowledgeBaseUI(Action<ModuleKnowledgeBaseUIOption>?)` | 注册知识库 UI 组件和管理页面 | 否 | 需要内置知识库管理界面时。 |

`AddKnowledgeBaseUI(...)` 返回 `ModuleRegistration<ModuleKnowledgeBaseUI, ModuleKnowledgeBaseUIOption>`，当前没有其他模块专用注册扩展。

## Module dependencies

| Dependency | When it is registered | Why it is used |
|---|---|---|
| `monica.AddKnowledgeBase()` | 总是 | 后端知识库 Facade 和存储。 |
| `monica.AddRAG()` | 管理页启用时 | 页面需要 RAG 状态、索引和向量清理能力。 |
| `monica.AddLocalization()` | 管理页启用时 | AI UI 本地化资源。 |
| `monica.AddUIShell()` | 管理页启用时 | 注册导航和页面。 |

## Navigation behavior

知识库管理页加入 `KnowledgeRetrieval` 分类，排序在 RAG 管理和调试页之前，方便先管理知识库和文档，再进入索引与调试。
