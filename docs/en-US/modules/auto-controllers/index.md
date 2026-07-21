---
title: AutoControllers
description: Generate HTTP endpoints and RPC clients from request-owned application contracts.
sidebar_position: 1
---

# AutoControllers

AutoControllers exposes Monica `ApplicationService` handlers through generated ASP.NET Core controllers. The request owns its HTTP verb, relative route, binding, and API documentation, while the handler owns only use-case orchestration.

## When to use it

- You expose explicit command or query handlers over HTTP.
- You want published requests to generate typed HTTP or local RPC clients.
- You use `ICrudApplicationService` for conventional resource CRUD.
- You still need ordinary handwritten `ControllerBase` classes beside generated endpoints.

## Package and registration

| Concern | Public entry point |
|---|---|
| Runtime HTTP module | `Monica.WebApi` and `monica.AddAutoControllers(...)` |
| Source generation | `Monica.Generators.AutoController` |
| Request endpoint | `[ApiEndpoint(...)]` |
| Assembly defaults | `[assembly: WebApiGenerationConfig(...)]` |

## Request-owned endpoint contract

```csharp
using Monica.WebApi.Abstractions;
using Monica.WebApi.Annotations;

/// <summary>
/// Returns the navigation tree for one documentation locale.
/// </summary>
[ApiEndpoint(ApiHttpMethod.Get, "tree", Binding = ApiRequestBinding.Query)]
public sealed record QueryGetDocTree(string Locale = "en-US")
    : IResultRequest<IReadOnlyList<DocTreeItemDto>>;
```

The generator reads the request symbol used by `ApplicationService<TRequest, ...>`. Do not put `[HttpGet]`, `[HttpPost]`, route fragments, or endpoint XML documentation on the handler.

Every generated `ApplicationService` endpoint requires `[ApiEndpoint]`; a missing declaration is a compile-time diagnostic rather than an implicit route convention.

## Publication determines RPC exposure

| Request placement | HTTP controller | Generated RPC API |
|---|---|---|
| `Platform.Protocol.PublishedLanguages.Domain{Domain}.Requests` | Yes | Yes, when the protocol assembly enables an RPC target |
| Local to the owning domain handler | Yes | No |

Use a published request only when another domain or process needs the contract. Keep binary downloads, multipart uploads, and domain-private endpoints local unless they have a deliberate typed RPC design.

Generated RPC interfaces are split by intent: `I{Domain}CommandApi` and `I{Domain}QueryApi`.

## Related pages

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Request-owned RPC](../../scenarios/request-owned-rpc.md)
