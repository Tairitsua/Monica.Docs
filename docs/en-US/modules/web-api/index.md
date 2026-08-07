---
title: WebApi and AutoControllers
description: Expose Monica application services over HTTP with host-owned routing and paging rules.
sidebar_position: 1
---

`Monica.WebApi` is the Stable HTTP composition package. `AddWebApi()` brings in AutoControllers, AutoModel, conventional DI, Swagger, authentication, mediator dispatch, object mapping, Repository, and Monica exception mapping. Use the narrower module registrations when an application does not need that aggregate.

```bash
dotnet add package Monica.WebApi --prerelease
dotnet add package Monica.Generators.AutoController --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.WebApi.Annotations;

[assembly: WebApiGenerationConfig(
    "api/v1",
    DomainName = "Ordering")]

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddWebApi();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

The generator creates controllers from `[ApiEndpoint]` on application-service request types. Route, HTTP method, binding, and endpoint documentation belong to the request rather than the handler. At runtime, `AddAutoControllers(...)` discovers ordinary controllers and `ICrudApplicationService` implementations, maps MVC endpoints, and applies one immutable set of host-owned conventions.

Generated mediated endpoints enter the shared [Execution Pipeline](../execution-pipeline/index.md) through Mediator and carry `[MediatedController]`, so the MVC adapter skips them. Direct MVC and generated CRUD actions enter through the MVC adapter. A handwritten controller that calls `IMediator` must add `[MediatedController]` explicitly to avoid nested MVC and Mediator boundaries.

Published requests under `Platform.Protocol.PublishedLanguages.Domain{Domain}.Requests` can also generate `I{Domain}CommandApi` and `I{Domain}QueryApi` clients. Keep HTTP-only requests local to their owning domain.

## Configure generated CRUD endpoints

```csharp
builder.AddMonica(monica =>
{
    monica.AddAutoControllers(
        crudOptionAction: options =>
        {
            options.RoutePath = "api/v1/[controller]";
            options.CrudControllerPostfix = "CrudService";
            options.Pagination.DefaultResultCount = 20;
            options.Pagination.MaximumResultCount = 500;
            options.Pagination.MaximumCrudResultCount = 5_000;
        });

    monica.AddSwagger(options => options.RoutePrefix = "swagger");
});
```

Defaults are 10 results, a 1,000 general maximum, a 100,000 CRUD maximum, and `POST` when no action-name prefix maps to another HTTP method. Lower the CRUD maximum for public or memory-sensitive APIs.

`Monica.Generators.AutoController` is a build-time Stable package. It is not a runtime provider and should remain a development dependency supplied through its package assets.

Read the [AutoControllers guide](../auto-controllers/index.md) for request-owned endpoint contracts and [request-owned RPC](../../scenarios/request-owned-rpc.md) for HTTP and local client generation.
