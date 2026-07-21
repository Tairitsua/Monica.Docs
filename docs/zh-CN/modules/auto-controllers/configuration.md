---
title: Configuration
description: 配置请求端点、RPC Target 与约定式 CRUD Controller。
sidebar_position: 3
---

# Configuration

## `WebApiGenerationConfig`

每个拥有生成请求或 Handler 的程序集应用一份程序集级配置：

```csharp
using Monica.WebApi.Annotations;

[assembly: WebApiGenerationConfig(
    "api/v1",
    DomainName = "Ordering")]
```

| 设置 | 用途 |
|---|---|
| 构造函数路由前缀 | 提供 `api/v1` 这样的共享前缀。 |
| `DomainName` | 为本地请求提供 Domain；发布请求从 `PublishedLanguages.Domain{Domain}` 推导。 |
| `RpcClientTargets` | 选择生成 `Http`、`Local` 或两者；默认不生成 RPC 传输实现。 |
| `HttpClientBaseType` | 项目拥有自定义 `HttpRpcApi` 基类时使用。 |
| `LocalClientBaseType` | 项目拥有自定义 `LocalRpcApi` 基类时使用。 |

协议程序集示例：

```csharp
[assembly: WebApiGenerationConfig(
    "api/v1",
    RpcClientTargets = RpcClientGenerationTargets.Http
        | RpcClientGenerationTargets.Local)]
```

## `ApiEndpoint`

```csharp
[ApiEndpoint(
    ApiHttpMethod.Post,
    "orders/approve",
    Binding = ApiRequestBinding.Body)]
public sealed record CommandApproveOrder(long OrderId) : IResultRequest;
```

- Route 是相对于程序集前缀和 Domain 的路径。
- `Binding` 可以省略；`Auto` 对 GET / DELETE 使用 Query，其余方法使用 Body。
- `Form` 只适用于本地 HTTP 请求；发布 RPC 请求不能使用表单绑定。
- `OperationName` 可以覆盖生成的 RPC 方法名；未配置时会移除 `Command` 或 `Query` 前缀。
- 请求上的 XML 文档会进入生成的 Controller 与 RPC API。
- 请求必须暴露唯一、明确的 `IRequest<TResult>` 结果契约。
- 发布 RPC 的结果必须是实现 `IRemoteResultEnvelope<TSelf>` 的具体引用类型。内置的 `Res`、`Res<T>` 与 `ResPaged<T>` 已满足该契约；自定义 Envelope 需通过正常构造函数实现 `CreateRemoteFailure`，避免传输失败路径绕过自身不变量。

## CRUD Controller 选项

`ApiEndpoint` 配置显式 `ApplicationService` 请求；约定式 CRUD 服务继续使用 `AddAutoControllers` 的第二个回调：

| Property | Default | Purpose |
|---|---|---|
| `RoutePath` | `"api/v1/[controller]"` | 生成 CRUD Controller 的默认路由模板。 |
| `CrudControllerPostfix` | `"CrudService"` | 推导 CRUD Controller 名称时移除的后缀。 |
| `Pagination` | 宿主级默认值 | 默认页大小与安全上限。 |
| `HttpMethods` | 约定映射 | 把 CRUD 方法名前缀映射为 HTTP 方法。 |
