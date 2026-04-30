---
title: Configuration
description: RAG 模块选项、Qdrant 选项和必需设置。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `CollectionNamePrefix` | `string` | `"monica_rag_"` | 否 | 多个应用共享向量库时需要区分集合前缀 | 知识库向量集合会使用此前缀。 |
| `DefaultTopK` | `int` | `5` | 否 | 默认检索数量需要变化时 | Facade 搜索调用仍可传入 `topK` 覆盖。 |
| `ChunkerRoutingStoreFilePath` | `string` | `"monica_data/rag/chunker_routing.json"` | 否 | 需要调整扩展名到切块器路由文件位置时 | 路径相对应用运行目录解析。 |
| `ProductionChunkerTargetChars` | `int` | `1200` | 否 | Markdown 生产切块器目标大小需要调整时 | 与 max/min/overlap 共同影响切块。 |
| `ProductionChunkerMaxChars` | `int` | `1800` | 否 | 控制单块最大字符数时 | 过大可能降低检索精度。 |
| `ProductionChunkerMinChars` | `int` | `200` | 否 | 控制单块最小字符数时 | 过小会增加碎片。 |
| `ProductionChunkerOverlapChars` | `int` | `120` | 否 | 需要更多上下文重叠时 | 重叠越大，索引体积越大。 |
| `SearchProviderOptions` | `TextSearchProviderOptions?` | `null` | 否 | 需要调整 Agent 搜索行为时 | 控制 Agent 集成的搜索策略和格式。 |

## Extra options

`UseVectorStoreQdrantProvider(...)` 使用 `ModuleRAGQdrantOption`：

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `Host` | `string` | `"localhost"` | 否 | Qdrant 不在本机或需要固定 IPv4 地址时 | 非 HTTPS 且为 `localhost` 时会规范化为 `127.0.0.1`。 |
| `Port` | `int` | `6334` | 否 | Qdrant gRPC 端口不同于默认值时 | 这里是 gRPC 端口，不是 HTTP 6333。 |
| `Https` | `bool` | `false` | 否 | Qdrant 使用 HTTPS/TLS 时 | 同时影响 Host 规范化。 |
| `ApiKey` | `string?` | `null` | 否 | Qdrant 开启 API Key 时 | 管理诊断中只显示是否已配置。 |

## Required setup

`RAG` 模块要求配置向量存储：

| Requirement | Satisfied by | Notes |
|---|---|---|
| `CONFIG_VECTOR_STORE` | `UseVectorStoreInMemoryProvider()`、`UseVectorStoreProvider<TVectorStore>()`、`UseVectorStoreQdrantProvider(...)` | 没有向量存储时，模块无法完成索引和搜索。 |

Embedding 模型不是 Guide 的启动期必需项，但知识库要索引时必须绑定一个可用 Embedding 模型。
