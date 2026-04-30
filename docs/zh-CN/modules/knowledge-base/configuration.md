---
title: Configuration
description: KnowledgeBase 的存储选项和默认值。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `DocumentIndexStateStoreFilePath` | `string` | `"monica_data/rag/document_index_state.json"` | 否 | 需要调整知识库和文档索引状态文件位置时 | 路径相对应用运行目录解析。 |
| `UploadedDocumentSourceRootPath` | `string` | `"monica_data/rag/document_sources"` | 否 | 上传文档内容需要放到指定目录时 | 存放源文档正文，不是向量数据。 |

## ID policy

知识库 ID 使用 `KnowledgeBaseIdPolicy` 规则：

| Rule | Value |
|---|---|
| 最大长度 | `64` |
| 字符 | 小写字母、数字、连字符 |
| 格式 | `^[a-z0-9]+(?:-[a-z0-9]+)*$` |

UI 和业务代码应把显示名与 ID 分开。显示名可以变更，ID 应保持稳定。

## Required setup

`KnowledgeBase` 模块没有必需 Guide 配置。默认文件存储足以支持单机开发和轻量应用；需要数据库、对象存储或分布式共享时，应替换公开存储抽象。
