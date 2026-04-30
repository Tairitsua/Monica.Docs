---
title: Guide and Providers
description: KnowledgeBase 的 Guide 方法、存储 Provider 和模块依赖。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `UseDocumentIndexStateStore<TStore>()` | 使用自定义统一状态存储 | 否 | 把知识库、文档状态和索引元数据保存到数据库或外部存储。 |
| `UseDocumentIndexStateFileProvider()` | 使用内置文件状态存储 | 否 | 回到默认文件实现，适合单机开发。 |
| `UseKnowledgeDocumentSourceStore<TStore>()` | 使用自定义源文档内容存储 | 否 | 源文档正文需要放到对象存储、数据库或远端服务。 |
| `UseKnowledgeDocumentSourceFileProvider()` | 使用内置文件源文档存储 | 否 | 回到默认文件实现。 |

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| File state store | 默认或 `UseDocumentIndexStateFileProvider()` | 单机开发、演示或轻量部署。 |
| Custom state store | `UseDocumentIndexStateStore<TStore>()` | 多实例共享状态或需要数据库治理。 |
| File source store | 默认或 `UseKnowledgeDocumentSourceFileProvider()` | 上传内容写入本地运行目录。 |
| Custom source store | `UseKnowledgeDocumentSourceStore<TStore>()` | 文档正文需要持久化到外部系统。 |

## Module dependencies

- `Mo.AddAISkillSystem()`：注册内置知识库查询 Skill 所需的基础能力。
- `Mo.AddMarkdown()`：支持从 Markdown 文档组导入知识库文档。
- `Mo.AddRAG()`：在知识库基础上提供向量索引、搜索和清理。
