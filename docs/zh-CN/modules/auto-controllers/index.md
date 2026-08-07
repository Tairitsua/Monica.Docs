---
title: AutoControllers
description: 根据请求拥有的端点契约生成 HTTP Controller 与 RPC 客户端。
sidebar_position: 1
---

AutoControllers 把 Monica `ApplicationService` 暴露为生成式 ASP.NET Core Controller。HTTP 方法、相对路由、绑定方式和 API 文档都由请求类型拥有，Handler 只负责用例编排。

## 何时使用

- 你需要把显式 Command / Query Handler 暴露为 HTTP API。
- 你希望发布请求自动生成强类型 HTTP 或 Local RPC 客户端。
- 你使用 `ICrudApplicationService` 提供约定式资源 CRUD。
- 你仍需让手写 `ControllerBase` 与生成端点共存。

## 包与注册入口

| 关注点 | 公开入口 |
|---|---|
| HTTP 运行时模块 | `Monica.WebApi` 与 `monica.AddAutoControllers(...)` |
| 源生成 | `Monica.Generators.AutoController` |
| 请求端点 | `[ApiEndpoint(...)]` |
| 程序集默认值 | `[assembly: WebApiGenerationConfig(...)]` |

## 请求拥有端点契约

```csharp
using Monica.WebApi.Abstractions;
using Monica.WebApi.Annotations;

/// <summary>
/// 返回指定文档语言的导航树。
/// </summary>
[ApiEndpoint(ApiHttpMethod.Get, "tree", Binding = ApiRequestBinding.Query)]
public sealed record QueryGetDocTree(string Locale = "en-US")
    : IResultRequest<IReadOnlyList<DocTreeItemDto>>;
```

生成器会解析 `ApplicationService<TRequest, ...>` 使用的请求符号。不要再把 `[HttpGet]`、`[HttpPost]`、路由片段或端点 XML 文档放到 Handler 上。

每个生成式 `ApplicationService` 端点都必须声明 `[ApiEndpoint]`；缺失声明会得到编译期诊断，而不是回退到隐式路由约定。

生成式 ApplicationService 端点通过 Mediator 进入统一 [Execution Pipeline](../execution-pipeline/index.md)，生成器还会添加 `[MediatedController]`，让 MVC 适配器跳过这些 Action。直接 MVC 与生成式 CRUD Action 使用 MVC 适配器。手写 Controller 如果调用 `IMediator`，必须显式添加 `[MediatedController]`，否则会形成嵌套的 MVC 与 Mediator 边界。

## 发布位置决定 RPC 暴露

| 请求位置 | HTTP Controller | 生成 RPC API |
|---|---|---|
| `Platform.Protocol.PublishedLanguages.Domain{Domain}.Requests` | 是 | 协议程序集启用 RPC Target 时生成 |
| 所属领域 Handler 本地 | 是 | 否 |

只有其他领域或进程确实需要依赖时，才发布请求。二进制下载、multipart 上传和领域私有端点应保持本地，除非已经定义了明确的强类型 RPC 传输契约。

生成的 RPC 接口按意图拆分为 `I{Domain}CommandApi` 与 `I{Domain}QueryApi`。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [请求拥有的 RPC](../../scenarios/request-owned-rpc.md)
