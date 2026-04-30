---
title: Configuration
description: RAG UI 的页面开关和默认行为。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `DisableRAGManagePage` | `bool` | `false` | 否 | 不需要 `/ai/rag/manage` 时 | 关闭 RAG 管理页和导航项。 |
| `DisableRAGDebugPage` | `bool` | `false` | 否 | 不需要 `/ai/rag/debug` 时 | 关闭检索调试页和导航项。 |
| `DisableRAGChunkersPage` | `bool` | `false` | 否 | 不需要 `/ai/rag/chunkers` 时 | 关闭切块器管理页和导航项。 |

## Required setup

本模块没有额外 Guide 必需配置；但它依赖的 [RAG](../rag/index.md) 模块要求配置向量库。生产或集成环境应先完成 `UseVectorStore...` 和 Embedding Provider 配置。
