---
title: Guide and Providers
description: KnowledgeBase UI 的 Guide 方法和依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `Mo.AddKnowledgeBaseUI(Action<ModuleKnowledgeBaseUIOption>?)` | 注册知识库 UI 组件和管理页面 | 否 | 需要内置知识库管理界面时。 |

`ModuleKnowledgeBaseUIGuide` 当前没有额外 Guide 方法。

## Module dependencies

| Dependency | When it is registered | Why it is used |
|---|---|---|
| `Mo.AddKnowledgeBase()` | 总是 | 后端知识库 Facade 和存储。 |
| `Mo.AddRAG()` | 管理页启用时 | 页面需要 RAG 状态、索引和向量清理能力。 |
| `Mo.AddLocalization()` | 管理页启用时 | AI UI 本地化资源。 |
| `Mo.AddUIShell()` | 管理页启用时 | 注册导航和页面。 |

## Navigation behavior

知识库管理页加入 `KnowledgeRetrieval` 分类，排序在 RAG 管理和调试页之前，方便先管理知识库和文档，再进入索引与调试。
