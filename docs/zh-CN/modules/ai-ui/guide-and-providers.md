---
title: Guide and Providers
description: AI UI 的 Guide、页面注册和模块依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `Mo.AddAIUI(Action<ModuleAIUIOption>?)` | 注册 AI Chat、Provider 管理和能力管理页面 | 否 | 需要内置 AI 管理 UI 时。 |

`ModuleAIUIGuide` 当前没有额外 Guide 方法，主要通过 `ModuleAIUIOption` 控制页面和聊天行为。

## Module dependencies

| Dependency | When it is registered | Why it is used |
|---|---|---|
| `Mo.AddAI()` | 总是 | Provider、聊天和能力 Facade。 |
| `Mo.AddKnowledgeBase()` | `DisableAIChatPage == false` | 聊天页知识库选择。 |
| `Mo.AddLocalization()` | 至少一个页面启用时 | AI UI 本地化资源。 |
| `Mo.AddUIShell()` | 对应页面启用时 | 注册导航和 Blazor 页面。 |

## Navigation behavior

所有页面注册到 Shell UI 的 `AI` 分类下。禁用某个页面只影响该页面和导航项，不会禁用后端 AI 模块本身。
