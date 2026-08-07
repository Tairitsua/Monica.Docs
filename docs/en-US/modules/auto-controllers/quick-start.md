---
title: Quick Start
description: Register AutoControllers and expose a request-owned application endpoint.
sidebar_position: 2
---

## Install the packages

```bash
dotnet add package Monica.WebApi --prerelease
dotnet add package Monica.Generators.AutoController --prerelease
```

Keep the generator package private to the project that compiles requests or handlers.

## Configure the owning assembly

For a modular-monolith domain with local requests:

```csharp
using Monica.WebApi.Annotations;

[assembly: WebApiGenerationConfig(
    "api/v1",
    DomainName = "Documentation")]
```

For published requests, configure the shared protocol assembly once. Their domain comes from the strict `PublishedLanguages.Domain{Domain}` namespace.

## Define the request

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

## Implement the handler

```csharp
public sealed class QueryHandlerGetDocTree(
    IRepositoryDocumentationContent repository)
    : ApplicationService<QueryGetDocTree, IReadOnlyList<DocTreeItemDto>>
{
    public override async Task<Res<IReadOnlyList<DocTreeItemDto>>> Handle(
        QueryGetDocTree request,
        CancellationToken cancellationToken)
    {
        var nodes = await repository.GetTreeAsync(request.Locale, cancellationToken);
        return Res.Ok<IReadOnlyList<DocTreeItemDto>>(
            nodes.Select(MapNode).ToList());
    }
}
```

This produces `GET api/v1/Documentation/tree`. The handler has no ASP.NET route attributes; the request is the endpoint contract.

## Register the runtime module

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddAutoControllers();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`monica.AddWebApi()` may be used when the host wants the broader Web API aggregate.
