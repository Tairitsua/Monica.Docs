---
title: Quick Start
description: 注册 AutoControllers 并暴露一个由请求拥有的应用端点。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.WebApi --prerelease
dotnet add package Monica.Generators.AutoController --prerelease
```

生成器包应作为编译请求或 Handler 的项目私有依赖。

## 配置所属程序集

模块化单体领域中的本地请求可以这样配置：

```csharp
using Monica.WebApi.Annotations;

[assembly: WebApiGenerationConfig(
    "api/v1",
    DomainName = "Documentation")]
```

对于发布请求，只需配置一次共享协议程序集；Domain 会从严格的 `PublishedLanguages.Domain{Domain}` 命名空间中推导。

## 定义请求

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

## 实现 Handler

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

最终生成 `GET api/v1/Documentation/tree`。Handler 不再携带 ASP.NET 路由特性，请求本身就是端点契约。

## 注册运行时模块

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

如果宿主需要完整 Web API 聚合，也可以使用 `monica.AddWebApi()`。
