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

## Date and time contract

Monica uses one lossless, timezone-free wire representation for `DateTime` in query strings, route placeholders, and JSON bodies:

```text
yyyy-MM-dd'T'HH:mm:ss.FFFFFFF
```

The uppercase `F` specifiers remove trailing zeroes, so a whole-second value is written as `2026-07-28T14:30:00`, while fractional ticks are retained only when they exist. This is shorter than the fixed-width `"O"` format without losing the sub-second precision that the `"s"` format would discard.

`DateTime` is a wall-clock contract. Its `Kind` is not transported and no time-zone conversion occurs. With Monica's default HTTP pipeline, ASP.NET Core query binding and the canonical JSON converter both produce `DateTimeKind.Unspecified`. A host that deliberately replaces the `DateTime` JSON converter owns the resulting body semantics. Use `DateTimeOffset` for an instant or explicit UTC offset; it continues to use the round-trip `"O"` format.

Generated body-bound HTTP RPC clients create JSON content with the owning host's `IJsonSerializerOptionsProvider`. The default Monica converters therefore use the same `DateTime` format for body and query requests, while also honoring the host's property naming and other JSON options.

## CRUD controller options

`ApiEndpoint` configures explicit `ApplicationService` requests. Conventional CRUD services still use the second `AddAutoControllers` callback:

| Property | Default | Purpose |
|---|---|---|
| `RoutePath` | `"api/v1/[controller]"` | Default route template for generated CRUD controllers. |
| `CrudControllerPostfix` | `"CrudService"` | Suffix removed when deriving the CRUD controller name. |
| `Pagination` | Host-owned defaults | Default and maximum page sizes. |
| `HttpMethods` | Conventional mappings | Maps CRUD action-name prefixes to HTTP methods. |
