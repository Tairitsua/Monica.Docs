---
title: Configuration
description: Configure request-owned endpoints, RPC targets, and conventional CRUD controllers.
sidebar_position: 3
---

# Configuration

## `WebApiGenerationConfig`

Apply one assembly-level configuration to every assembly that owns generated requests or handlers:

```csharp
using Monica.WebApi.Annotations;

[assembly: WebApiGenerationConfig(
    "api/v1",
    DomainName = "Ordering")]
```

| Setting | Purpose |
|---|---|
| Constructor route prefix | Provides the shared prefix, such as `api/v1`. |
| `DomainName` | Supplies the domain for local requests. Published requests derive it from `PublishedLanguages.Domain{Domain}`. |
| `RpcClientTargets` | Selects `Http`, `Local`, or both generated RPC implementations. The default is no RPC client implementation. |
| `HttpClientBaseType` | Selects a custom `HttpRpcApi` base when the project owns one. |
| `LocalClientBaseType` | Selects a custom `LocalRpcApi` base when the project owns one. |

Example protocol configuration:

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

- The route is relative to the configured prefix and domain.
- `Binding` may be omitted. `Auto` maps GET and DELETE to query binding and other verbs to body binding.
- `Form` is valid only for local HTTP requests; published RPC requests cannot use form binding.
- `OperationName` may override the generated RPC method name; otherwise Monica removes the `Command` or `Query` prefix.
- XML documentation on the request becomes generated controller and RPC API documentation.
- The request must expose one unambiguous `IRequest<TResult>` result contract.
- A published RPC result must be a concrete reference type implementing `IRemoteResultEnvelope<TSelf>`. The built-in `Res`, `Res<T>`, and `ResPaged<T>` types already satisfy this contract; a custom envelope supplies `CreateRemoteFailure` through a normal constructor so transport failures cannot bypass its invariants.

## CRUD controller options

`ApiEndpoint` configures explicit `ApplicationService` requests. Conventional CRUD services still use the second `AddAutoControllers` callback:

| Property | Default | Purpose |
|---|---|---|
| `RoutePath` | `"api/v1/[controller]"` | Default route template for generated CRUD controllers. |
| `CrudControllerPostfix` | `"CrudService"` | Suffix removed when deriving the CRUD controller name. |
| `Pagination` | Host-owned defaults | Default and maximum page sizes. |
| `HttpMethods` | Conventional mappings | Maps CRUD action-name prefixes to HTTP methods. |
