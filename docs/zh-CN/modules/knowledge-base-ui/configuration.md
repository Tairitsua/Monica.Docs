---
title: Configuration
description: KnowledgeBase UI 的页面开关和默认行为。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `DisableKnowledgeBaseManagePage` | `bool` | `false` | 否 | 不希望注册 `/ai/knowledge-bases` 页面时 | 关闭后不会注册页面状态服务和导航项。 |

## Required setup

本模块没有必需 Guide 配置。启用管理页时会自动注册 AI UI 本地化资源、Shell UI 导航项，并依赖 `Mo.AddRAG()`。
