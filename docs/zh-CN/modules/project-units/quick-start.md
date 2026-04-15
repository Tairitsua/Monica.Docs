---
title: Quick Start
description: 安装并注册 ProjectUnits，并用一个最小请求/处理器组合跑通项目单元发现。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.Framework
```

## 最小注册与结构发现

```csharp
using Monica.Framework.ProjectUnits.Models;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddProjectUnits(o =>
{
    o.ConventionOptions.EnableNameConvention = true;
    o.ConventionOptions.NameConventionMode = ENameConventionMode.Warning;
});

builder.UseMonica();

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
public sealed record GetDocTreeRequest
    : IResultRequest<IReadOnlyList<DocTreeItemDto>>;
```

推荐位置：

```text
Shared/Platform.Protocol/PublishedLanguages/DomainDocumentation/Requests/
```

### 2. 定义查询处理器

```csharp
using Microsoft.AspNetCore.Mvc;

public sealed class QueryHandlerGetDocTree(
    IRepositoryDocumentationContent repository)
    : ApplicationService<GetDocTreeRequest, IReadOnlyList<DocTreeItemDto>>
{
    [HttpGet("tree")]
    public override async Task<Res<IReadOnlyList<DocTreeItemDto>>> Handle(
        GetDocTreeRequest request,
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

对于模块化单体，建议在每个 Domain 项目根目录只配置一次默认基础路由：

```csharp
using Monica.WebApi.AutoControllers.Annotations;

[assembly: AutoControllerConfig(
    DefaultRoutePrefix = "api/v1",
    DomainName = "Documentation")]
```

这样 `QueryHandlerGetDocTree` 的最终路由就是 `GET api/v1/Documentation/tree`，Handler 本身只保留请求级路由片段 `tree`。

如果是微服务架构，则把同样的 `[assembly: AutoControllerConfig(...)]` 写在 `{Subdomain}Service.API/Program.cs` 即可。

### 4. 让 `ProjectUnits` 看到什么

上面这组代码至少会被识别为：

- 一个 `RequestDto`
- 一个 `ApplicationService`
- 一个或多个依赖的仓储/领域服务

如果你同时启用了 `ParseUnitDetails = true`，模块还会尝试读取 XML 文档注释，让诊断结果更适合做 UI 展示和结构说明。

## 第一个有价值的配置

最值得优先决定的是：你是否要在当前项目启用命名约定治理。如果要启用，建议先从 `Warning` 模式开始，而不是一上来就用 `Strict`。

如果你的项目除了 `QueryHandler*` / `CommandHandler*` 之外，还同时使用 `CrudApplicationService` 这类不包含 `Handler` 的 CRUD 风格应用服务，也建议先用 `Warning` 模式观察现状，再决定是否要为 `ApplicationService` 单独放宽规则。

另一个值得尽早固定的配置是 `ApplicationService` 的默认基础路由。推荐统一采用 `api/{version}/{DomainName(PascalCase)}`，例如 `api/v1/Documentation`，然后每个请求只补充自己的方法路由，例如 `tree`、`doc`、`publish`。

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [项目单元编写](../../concepts/project-unit-authoring.md)
