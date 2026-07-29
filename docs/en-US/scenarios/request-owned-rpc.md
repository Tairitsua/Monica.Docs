---
title: Request-owned RPC clients and local RPC
description: Generate HTTP and local RPC clients directly from published requests without JSON snapshots or producer-first builds.
sidebar_position: 2
---

# Request-owned RPC clients and local RPC

`Monica.Generators.AutoController` reads `[ApiEndpoint]` directly from request symbols to generate HTTP controllers and RPC clients. RPC contracts no longer depend on handler build outputs or `*.rpc-metadata.json`, so a clean checkout can build in one pass from empty `bin` and `obj` directories.

## When to use it

- `Platform.Protocol` is the source of truth for synchronous cross-domain contracts.
- One request contract must support both cross-process HTTP and in-process local calls.
- Builds must not write snapshots into the source tree or require a provider-first build.
- Request placement should make RPC publication explicit.

## Roles

| Role | Typical project | Responsibility |
|---|---|---|
| Contract owner | `Platform.Protocol` | Owns published requests and responses and generates RPC APIs and transports. |
| Provider | `Domains.*` or `*Service.API` | Implements `ApplicationService` handlers and generates HTTP controllers. |
| Consumer | Another domain | Injects `I{Domain}CommandApi` or `I{Domain}QueryApi`. |
| Host | AppHost or API host | Registers `monica.AddRpcClient()` and chooses local or HTTP transport. |

```text
src/
  Domains/
    LocalRpcProvider/Application/HandlersQuery/
    Showcase/Application/HandlersQuery/
  Shared/
    Platform.Protocol/
      PublishedLanguages/
        DomainLocalRpcProvider/
          Requests/
          Models/
```

There is no `RpcMetadata` directory.

## 1. Configure the protocol assembly

Reference `Monica.Generators.AutoController` privately and select the generated transports once:

```csharp
using Monica.WebApi.Annotations;

[assembly: WebApiGenerationConfig(
    "api/v1",
    RpcClientTargets = RpcClientGenerationTargets.Http
        | RpcClientGenerationTargets.Local)]
```

`RpcClientTargets` selects compile-time outputs. It does not select the host's runtime transport.

## 2. Publish the request-owned endpoint

```csharp
using Monica.WebApi.Abstractions;
using Monica.WebApi.Annotations;

namespace Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Requests;

/// <summary>
/// Returns a greeting from the local RPC sample domain.
/// </summary>
[ApiEndpoint(ApiHttpMethod.Get, "greeting", Binding = ApiRequestBinding.Query)]
public sealed record QueryGetLocalRpcGreeting(string ConsumerName)
    : IResultRequest<LocalRpcGreetingDto>;
```

RPC publication requires both `[ApiEndpoint]` and the strict `PublishedLanguages.Domain{Domain}.Requests` namespace. The generator classifies `Query*` and `Command*` contracts and infers the response from the request's unique `IRequest<TResult>`. This request produces `ILocalRpcProviderQueryApi`.

## 3. Implement the provider handler

Configure the provider assembly:

```csharp
[assembly: WebApiGenerationConfig(
    "api/v1",
    DomainName = "LocalRpcProvider")]
```

The handler has no ASP.NET method attribute or endpoint documentation:

```csharp
public sealed class QueryHandlerGetLocalRpcGreeting
    : ApplicationService<QueryGetLocalRpcGreeting, LocalRpcGreetingDto>
{
    public override Task<Res<LocalRpcGreetingDto>> Handle(
        QueryGetLocalRpcGreeting request,
        CancellationToken cancellationToken)
    {
        return Task.FromResult<Res<LocalRpcGreetingDto>>(
            new LocalRpcGreetingDto(
                $"Hello {request.ConsumerName} from LocalRpcProvider.",
                DateTimeOffset.UtcNow));
    }
}
```

The request route and provider defaults compose into `GET api/v1/LocalRpcProvider/greeting`.

## 4. Inject the generated API

```csharp
public sealed class QueryHandlerGetLocalRpcSample(
    ILocalRpcProviderQueryApi localRpcProvider)
    : ApplicationService<QueryGetLocalRpcSample, LocalRpcSampleDto>
{
    public override async Task<Res<LocalRpcSampleDto>> Handle(
        QueryGetLocalRpcSample request,
        CancellationToken cancellationToken)
    {
        var providerResult = await localRpcProvider.GetLocalRpcGreeting(
            new QueryGetLocalRpcGreeting(request.ConsumerName),
            cancellationToken);

        if (providerResult.IsFailed(out var error, out var greeting))
        {
            return error!;
        }

        return new LocalRpcSampleDto(
            request.ConsumerName,
            greeting.Message,
            greeting.GeneratedAtUtc,
            "Local");
    }
}
```

Generated API methods accept an optional `CancellationToken`; HTTP and local transports propagate it.

### Date and time values over HTTP

Generated HTTP clients serialize `DateTime` query values, route values, and JSON properties with the canonical wall-clock format `yyyy-MM-dd'T'HH:mm:ss.FFFFFFF`. Whole seconds omit the fraction; significant fractional ticks are preserved. The format deliberately avoids both the seven fixed fractional digits of `"O"` and the precision loss of `"s"`.

`DateTime` does not carry a time zone across this boundary. Local, UTC, and Unspecified inputs keep the same clock ticks and emit no `Z` or offset. With Monica's default HTTP pipeline, query binding and canonical JSON parsing both deliver `DateTimeKind.Unspecified`. A host that replaces the `DateTime` JSON converter owns its custom body semantics. Do not pass an instant as `DateTime`; use `DateTimeOffset`, whose `"O"` representation preserves its offset and instant.

For body-bound operations, generated clients ask their `HttpRpcApi` base to create JSON content with the owning host's `IJsonSerializerOptionsProvider`. This keeps body serialization aligned with Monica's default canonical format and with host-owned JSON naming and converter choices. Local transport dispatches the request object directly and does not serialize it.

## 5. Select the runtime transport

For a modular monolith:

```csharp
builder.AddMonica(monica =>
{
    monica.AddRpcClient()
        .ConfigDomainInfoProvider(new MonicaDocsRpcClientDomainInfoProvider())
        .UseLocalTransport();
});
```

For separate processes, select `UseHttpTransport()` and configure an HTTP registration provider such as Dapr. The domain info provider maps generated RPC domains to remote application IDs.

## Why the first clean build works

The protocol generator reads published requests in its own Roslyn compilation. The provider generator resolves the same request symbol through `ApplicationService<TRequest, ...>`. No intermediate disk state connects those compilations.

The workflow therefore has no:

- `MonicaRpcMetadataExportDirectory` or consume directory;
- `RpcClientConfig`;
- `*.rpc-metadata.json`;
- bootstrap source scan;
- provider-first build.

Deleting `bin` and `obj` still leaves one ordinary solution build sufficient to generate contracts, transports, and controllers.

## Keep HTTP-only requests local

Place a request beside its handler when another domain should not consume it. It still needs `[ApiEndpoint]` and still generates an HTTP controller, but it does not generate an RPC API.

This is the recommended boundary for binary `PhysicalFileResult` responses, multipart uploads, transport-specific `object` exports, and domain-private operations. Monica.Docs keeps `QueryGetDocAsset` local for this reason.

## Verification checklist

- Published requests use `Command*` or `Query*` and carry `[ApiEndpoint]`.
- Their namespace matches `PublishedLanguages.Domain{Domain}.Requests` exactly.
- Each request exposes one `IRequest<TResult>` result contract.
- Published result envelopes implement `IRemoteResultEnvelope<TSelf>`; custom envelopes construct remote failures without bypassing their invariants.
- Provider handlers agree with the request and result type.
- Consumers use `I{Domain}CommandApi` or `I{Domain}QueryApi`.
- The host selects a transport enabled by `RpcClientTargets`.
- HTTP `DateTime` values are wall-clock values; contracts that represent instants use `DateTimeOffset`.
- No RPC metadata snapshots or related MSBuild properties remain.
- Repeated builds leave the source worktree unchanged.

## Next steps

- [AutoControllers](../modules/auto-controllers/index.md)
- [ProjectUnits](../concepts/project-units.md)
