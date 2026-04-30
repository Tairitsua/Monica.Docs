---
title: KnowledgeBase UI
description: 提供知识库管理页面和可复用知识库选择 UI 能力。
sidebar_position: 1
---

# KnowledgeBase UI

`KnowledgeBase UI` 模块为 `KnowledgeBase` 提供 Blazor 管理页面，并为 AI Chat 等页面提供知识库选择能力。它负责页面注册和 UI 状态服务，不改变后端知识库和 RAG 的存储行为。

## 何时使用这个模块

- 你要在 Shell 导航中提供知识库管理页面。
- 你要让用户创建知识库、导入或上传文档、预览源内容。
- 你需要聊天页或其他 UI 使用知识库选择组件。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.AI.UI` |
| 注册入口 | `Mo.AddKnowledgeBaseUI()` |
| 相关基础模块 | `Mo.AddKnowledgeBase()` |

## 页面

| Page | Route | Navigation |
|---|---|---|
| Knowledge Base 管理 | `/ai/knowledge-bases` | `KnowledgeRetrieval` 分类，顺序 `3` |

## 公开使用面

- `ModuleKnowledgeBaseUIOption`：控制知识库管理页是否注册。
- `KnowledgeBaseManagePageState`：知识库管理页状态协调服务。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [KnowledgeBase](../knowledge-base/index.md)
- [RAG](../rag/index.md)
