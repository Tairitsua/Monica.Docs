---
title: Configuration
description: AI 模块选项、Provider 选项和默认值。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `DefaultSystemPrompt` | `string?` | `null` | 否 | 需要给聊天会话设置默认系统提示词时 | Provider 也可以设置自己的 `SystemPrompt`。 |
| `MaxContextMessages` | `int` | `0` | 否 | 需要限制历史上下文长度时 | `0` 表示不限制。 |
| `EnableRequestLogging` | `bool` | `false` | 否 | 排查请求链路时 | 不建议在包含敏感内容的生产环境随意打开。 |
| `CapabilityStateStoreFilePath` | `string` | `"monica_data/ai/capabilities_state.json"` | 否 | 多个 Host 需要隔离 Skill / MCP 启用状态时 | 路径相对应用运行目录解析。 |

## Provider options

`OpenAIProviderOptions` 与 `AnthropicProviderOptions` 都继承自 `AIProviderOptions`：

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `ProviderId` | `string?` | Provider 类型名 | 否 | 同类型注册多个 Provider 时 | 作为运行时选择和 UI 管理的稳定 ID。 |
| `DisplayName` | `string?` | Provider ID 或类型名 | 否 | 需要更友好的 UI 名称时 | 只影响显示。 |
| `ApiKey` | `string` | 无 | 是 | 接入真实 Provider 时 | 空值会让 Provider 以禁用状态注册，并在管理页显示配置错误。 |
| `SystemPrompt` | `string?` | `null` | 否 | Provider 需要默认系统提示词时 | 可被聊天会话参数覆盖。 |
| `SupportedModels` | `IList<string>?` | `[]` | 是 | 声明此 Provider 可用模型时 | 为空时 Provider 被视为配置不完整。 |
| `BaseUrl` | `string?` | `null` | 否 | 接入 OpenAI-compatible 网关或私有端点时 | 对 OpenAI-compatible Provider 最常用。 |
| `IsDefault` | `bool` | `false` | 否 | 希望作为默认 Provider 时 | 多个 Provider 均设置时由注册顺序决定最终默认行为。 |
| `TimeoutSeconds` | `int` | `120` | 否 | 调整请求超时时间时 | 影响 Provider 客户端调用。 |
| `Organization` | `string?` | `null` | 否 | OpenAI 组织隔离时 | 仅 `OpenAIProviderOptions`。 |
| `Project` | `string?` | `null` | 否 | OpenAI 项目隔离时 | 仅 `OpenAIProviderOptions`。 |
| `MaxTokens` | `int` | `4096` | 否 | Anthropic 默认输出上限不同于默认值时 | 仅 `AnthropicProviderOptions`。 |
| `DefaultDimensions` | `int` | `384` | 否 | Fake Provider 的 Embedding 维度需要调整时 | 仅 `FakeProviderOptions`。 |

## Required setup

`AI` 模块本身没有 `GetRequestedConfigMethodKeys()` 强制要求。实际可用性取决于 Provider 配置：至少需要一个带非空 `ApiKey` 和非空 `SupportedModels` 的 Provider，聊天功能才有可选模型。
