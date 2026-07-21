---
title: Quick Start
description: 安装并注册 ProjectUnits，并用一个最小请求/处理器组合跑通项目单元发现。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.ProjectUnits
```

## 最小注册与结构发现

```csharp
using Monica.ProjectUnits.Models;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddProjectUnits(o =>
    {
        o.ConventionOptions.EnableNameConvention = true;
        o.ConventionOptions.NameConventionMode = ENameConventionMode.Warning;
    });
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

注册后，`ProjectUnits` 会在宿主启动阶段扫描业务类型，并通过 `/framework/units`、`/framework/units/domain-event`、`/framework/enum` 等接口暴露结果。

## 第一组最值得先写好的项目单元

如果你正在新建一个业务功能，最推荐先跑通这一组最小组合：

1. 一个 Published Language 请求
2. 一个 `ApplicationService`
3. 一个实体或仓储抽象
4. 可选的 `DomainService`

`Monica.Docs` 当前就使用这种写法。

### 1. 定义请求契约

```csharp
using Monica.WebApi.Annotations;

/// <summary>
/// 返回指定文档语言的导航树。
/// </summary>
[ApiEndpoint(ApiHttpMethod.Get, "tree", Binding = ApiRequestBinding.Query)]
public sealed record QueryGetDocTree
    : IResultRequest<IReadOnlyList<DocTreeItemDto>>;
```

推荐位置：

```text
Shared/Platform.Protocol/PublishedLanguages/DomainDocumentation/Requests/
```

### 2. 定义查询处理器

```csharp
public sealed class QueryHandlerGetDocTree(
    IRepositoryDocumentationContent repository)
    : ApplicationService<QueryGetDocTree, IReadOnlyList<DocTreeItemDto>>
{
    public override async Task<Res<IReadOnlyList<DocTreeItemDto>>> Handle(
        QueryGetDocTree request,
        CancellationToken cancellationToken)
    {
        var nodes = await repository.GetTreeAsync(cancellationToken);
        var response = nodes.Select(MapNode).ToList();
        return Res.Ok<IReadOnlyList<DocTreeItemDto>>(response);
    }
}
```

推荐位置：

```text
Domains/Documentation/Application/HandlersQuery/
```

### 3. 固定领域级基础路由

这个请求位于 `Platform.Protocol` 的 Published Language 中，因此在协议程序集配置路由前缀与 RPC Target：

```csharp
using Monica.WebApi.Annotations;

[assembly: WebApiGenerationConfig(
    "api/v1",
    RpcClientTargets = RpcClientGenerationTargets.Http
        | RpcClientGenerationTargets.Local)]
```

这样 `QueryGetDocTree` 的最终路由就是 `GET api/v1/Documentation/tree`。相对路由与端点文档都由请求拥有。

Domain 会从严格的 `PublishedLanguages.DomainDocumentation.Requests` 命名空间推导，不需要在协议配置中重复声明。若请求只服务于当前 Domain 或微服务，则把它放在 Handler 附近，并在所属 Domain 项目或 `{Subdomain}Service.API` 中配置 `DomainName = "Documentation"`；这种请求只生成 HTTP Controller。

### 4. 让 `ProjectUnits` 看到什么

上面这组代码至少会被识别为：

- 一个 `RequestDto`
- 一个 `ApplicationService`
- 一个或多个依赖的仓储/领域服务

如果你同时启用了 `ParseUnitDetails = true`，模块还会尝试读取 XML 文档注释，让诊断结果更适合做 UI 展示和结构说明。

## 第一个有价值的配置

最值得优先决定的是：你是否要在当前项目启用命名约定治理。如果要启用，建议先从 `Warning` 模式开始，而不是一上来就用 `Strict`。

如果你的项目除了 `QueryHandler*` / `CommandHandler*` 之外，还同时使用 `CrudApplicationService` 这类不包含 `Handler` 的 CRUD 风格应用服务，也建议先用 `Warning` 模式观察现状，再决定是否要为 `ApplicationService` 单独放宽规则。

另一个值得尽早固定的配置是 `ApplicationService` 的默认基础路由。推荐统一采用 `api/{version}/{DomainName(PascalCase)}`，例如 `api/v1/Documentation`，然后每个请求通过 `[ApiEndpoint]` 补充自己的方法与相对路由，例如 `tree`、`doc`、`publish`。

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [项目单元编写](../../concepts/project-unit-authoring.md)
