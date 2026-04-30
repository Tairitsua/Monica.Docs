---
title: Guide and Providers
description: RAG UI 的 Guide 方法、页面职责和依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `Mo.AddRAGUI(Action<ModuleRAGUIOption>?)` | 注册 RAG 管理、调试和切块器页面 | 否 | 需要内置 RAG 运维和调试 UI 时。 |

`ModuleRAGUIGuide` 当前没有额外 Guide 方法。

## Page responsibilities

| Page | Main responsibility |
|---|---|
| RAG 管理 | 知识库 RAG 支持、Embedding 绑定、向量库诊断、索引队列和批量索引。 |
| RAG Debug | 按知识库执行检索调试，查看得分、来源和匹配 Chunk。 |
| RAG Chunkers | 查看可用切块器，预览扩展名路由变更，测试切块输出。 |

## Module dependencies

| Dependency | Why it is used |
|---|---|
| `Mo.AddRAG()` | 后端索引、搜索、Embedding、向量库和切块器 Facade。 |
| `Mo.AddKnowledgeBaseUI()` | 组合知识库管理入口和知识库选择能力。 |
| `Mo.AddLocalization()` | AI UI 本地化资源。 |
| `Mo.AddUIShell()` | 注册导航和页面。 |
