---
title: 项目单元编写
description: 基于 Monica.WebApi、Repository、EventBus 与 JobScheduler 的项目单元编写约定与真实用法。
sidebar_position: 5
---

# 项目单元编写

`ProjectUnits` 模块负责在运行时发现项目结构，而真正决定“一个业务功能应该怎么拆”的，是你如何编写 `RequestDto`、`ApplicationService`、`DomainService`、实体、仓储、事件、事件处理器、作业与配置。这一页把这些单元放到同一张图里说明。

## 先分清两种应用层入口

Monica 里的“应用服务”通常有两种写法，它们都建立在 `Monica.WebApi` 之上，但目标不同。

### 1. 显式请求处理器

这是最标准的 ProjectUnit 写法：请求契约实现 `IResultRequest<T>` 或 `IResultRequest`，处理器继承 `ApplicationService<TRequest, TResponse>` 或 `ApplicationService<TRequest>`，放在 `Application/HandlersCommand` 或 `Application/HandlersQuery`。

`Monica.Docs` 当前就使用这条路径：

```csharp
using Microsoft.AspNetCore.Mvc;

public sealed record GetDocTreeRequest
    : IResultRequest<IReadOnlyList<DocTreeItemDto>>;

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

适合：

- 命令/查询边界清晰的业务能力
- 需要稳定 Published Language 请求契约的场景
- 需要把业务流程拆成请求、领域服务、仓储、事件等多个项目单元的场景

### 2. CRUD 应用服务

如果你的目标是快速暴露标准增删改查 HTTP 接口，可以继承 `CrudApplicationService<...>`，让 `AutoControllers` 自动生成控制器。

`Monica.WebApi` 的默认类名后缀是 `CrudService`。如果宿主修改了 `CrudControllerPostfix`，类名后缀也必须同步保持一致。

```csharp
public sealed class DocumentCrudService(
    IRepositoryDocument repository)
    : CrudApplicationService<Document, DocumentDto, long, DocumentPageRequest,
        CreateDocumentInput, UpdateDocumentInput, IRepositoryDocument>(repository)
{
}
```

适合：

- 一个实体主要只需要标准 CRUD 接口
- 你希望统一路由、查询、分页、列表导出等 CRUD 行为
- HTTP API 比领域流程本身更重要的后台管理场景

不适合：

- 复杂命令流程
- 需要多个领域规则协作的业务操作
- 一个动作远不止“增删改查一个资源”的场景

## 项目单元总览

| 单元 | Monica 契约 | 典型位置 | 主要职责 |
|---|---|---|---|
| `RequestDto` | `IResultRequest<TResponse>` / `IResultRequest` | `Shared/.../PublishedLanguages/.../Requests/` | 表达稳定的用例输入 |
| `ApplicationService` | `ApplicationService<TRequest, TResponse>` / `ApplicationService<TRequest>` | `Application/HandlersCommand/`、`Application/HandlersQuery/` | 边界编排，返回 `Res` |
| `ApplicationService`（CRUD 风格） | `CrudApplicationService<...>` | 应用层里的专用 CRUD 服务目录 | 标准资源型 HTTP CRUD |
| `DomainService` | `DomainService` | `DomainServices/` | 可复用业务规则，使用正常返回值和异常 |
| `Entity` | `Entity<TKey>` / `IEntity` | `Entities/` | 持有状态、约束不变式、封装行为 |
| `Repository` | `IRepository<TEntity, TKey>` 等 | `Interfaces/` + `Repository/` | 持久化访问 |
| `DomainEvent` | `DomainEvent` / `IDomainEvent` | `PublishedLanguages/.../Events/` | 表达业务事实 |
| `DomainEventHandler` | `DomainEventHandler<TEvent>` | `Application/HandlersEvent/` | 响应分布式事件 |
| `LocalEventHandler` | `LocalEventHandler<TEvent>` | `Application/HandlersEvent/` | 响应进程内事件 |
| `RecurringJob` | `RecurringJob` | `Application/BackgroundWorkers/` | 定时后台流程 |
| `TriggeredJob` | `TriggeredJob<TArgs>` | `Application/BackgroundWorkers/` | 被命令或事件触发的后台流程 |
| `Configuration` | `[Configuration]` + `*Options` | `Configurations/` | 宿主可调参数 |

## RequestDto

`RequestDto` 是用例契约，不是实体，也不是 API Controller 参数包。它应该稳定、序列化友好、字段明确，并且优先放在 `Shared/.../PublishedLanguages/.../Requests/` 下。

`Monica.Docs` 的查询请求：

```csharp
public sealed record GetDocBySlugRequest(string Slug)
    : IResultRequest<DocContentDto>;
```

一个典型命令请求：

```csharp
public sealed record CommandPublishDocument(string Slug) : IResultRequest;
```

写法建议：

- `Query*` 表示查询，`Command*` 表示命令
- 只表达输入，不混入仓储、映射或数据库字段语义
- 响应 DTO 放在 Published Language 一侧，而不是和 EF 实体放在一起

## ApplicationService

`ApplicationService` 负责边界编排。它可以读取仓储、调用 `DomainService`、发布事件、做对象映射，但不应该长期持有复杂领域规则。

编写时遵循这些规则：

- 返回 `Res` 或 `Res<T>`
- 让 `RequestDto` 实现 `IResultRequest<T>` 或 `IResultRequest`
- 复杂规则放进实体或 `DomainService`
- 需要 `string` 成功结果时，使用 `Res.Ok<string>(value)`，不要写成 `Res.Ok(value)`
- 基础路由统一采用 `api/{version}/{DomainName(PascalCase)}`，Handler 方法只保留请求级路由片段
- 模块化单体把 `[assembly: AutoControllerConfig(...)]` 放在 Domain 项目根目录；微服务把它写在 `{Subdomain}Service.API/Program.cs`

`Monica.Docs` 的 `QueryHandlerGetDocBySlug` 就是典型的查询处理器：它先校验请求，再从仓储取文档，最后组装 DTO 并返回 `Res`。

## ApplicationService 的 CRUD 风格

CRUD 应用服务也是 `ApplicationService` 体系的一部分，但它更偏向“资源型接口”。在 `ProjectUnits` 的发现结果里，它仍然属于 `ApplicationService`，只是编写风格不同。

一个典型的 Monica-native CRUD 服务写法如下：

```csharp
public sealed class DocumentCrudService(
    IRepositoryDocument repository)
    : CrudApplicationService<Document, DocumentDto, long, DocumentPageRequest,
        CreateDocumentInput, UpdateDocumentInput, IRepositoryDocument>(repository)
{
    public override async Task<Res> CreateAsync(CreateDocumentInput input)
    {
        return await base.CreateAsync(input);
    }
}
```

使用它时要记住：

- 它适合资源 CRUD，不是通用业务流程容器
- 只有满足 `CrudControllerPostfix` 规则的类型才会被 `AutoControllers` 自动发现
- 默认后缀是 `CrudService`，如果宿主改了后缀，类名也要同步修改

## DomainService

`DomainService` 用来安放可复用的业务规则。它应该使用正常的 .NET 返回值和异常，而不是把 `Res` 扩散进领域层。

一个典型的 `DomainService` 会注入仓储、配置和其他领域服务，但不会承担 HTTP 边界职责。

```csharp
public sealed class DomainDocumentPublication(
    IRepositoryDocument repository)
    : DomainService
{
    public async Task PublishAsync(
        long documentId,
        CancellationToken cancellationToken = default)
    {
        var document = await repository.GetAsync(documentId, cancellationToken: cancellationToken);
        document.Publish();
        await repository.UpdateAsync(document, autoSave: true, cancellationToken: cancellationToken);
    }
}
```

什么时候创建 `DomainService`：

- 两个或更多入口都要复用同一段业务规则
- 逻辑跨越多个实体、仓储或外部领域接口
- 规则属于领域，但又不适合塞进单个实体

什么时候不要创建：

- 只是简单透传仓储查询
- 只是给某个实体改一两个字段，那通常应该是实体方法
- 代码里主要是 HTTP、路由、文件上传、分页导出等接口细节

## Entity 与 Repository

实体负责自己的状态和行为，仓储负责持久化访问。不要把业务规则藏进仓储，也不要让 Handler 直接在外面散着改实体状态。

`Monica.Docs` 当前是文件系统读取场景，没有传统数据库实体，但它依然保持了清晰边界：

- `IRepositoryDocumentationContent` 定义读取文档树、文档正文和附件的抽象
- `RepositoryDocumentationContent` 负责 Markdown 目录、文件系统与内容读取

这说明一个重点：就算不是 EF Core 仓储，也仍然应该把“数据访问策略”放进仓储抽象，而不是塞回 Handler。

## DomainEvent 与事件处理器

领域事件用来表达“已经发生的业务事实”。事件处理器负责响应这个事实，但应该保持足够薄，让真正可复用的规则继续留在 `DomainService`。

一个 Monica-native 事件与处理器通常长这样：

```csharp
public sealed class EventDocumentPublished : DomainEvent
{
    public long DocumentId { get; init; }
    public string Slug { get; init; } = string.Empty;
}

public sealed class DomainEventHandlerDocumentPublished(
    IDocumentSearchIndexer indexer)
    : DomainEventHandler<EventDocumentPublished>
{
    public override async Task HandleEventAsync(EventDocumentPublished eventData)
    {
        await indexer.IndexAsync(eventData.DocumentId);
    }
}
```

写法建议：

- 事件命名为事实，例如 `EventOrderApproved`
- 事件里放消费者真正需要的数据，不要把完整实体图直接扔出去
- 处理器只做响应，不把它写成第二套应用服务

## RecurringJob 与 TriggeredJob

作业是后台入口，不是领域规则本身。

Monica 原生作业分成两类：

- `RecurringJob`：实现 `ExecuteAsync(CancellationToken)`，用于定时流程
- `TriggeredJob<TArgs>`：实现 `ExecuteAsync(TArgs, CancellationToken)`，用于被命令或事件触发的异步流程

```csharp
[JobConfig(CronSchedule = "0 0 * * * *")]
public sealed class CleanupExpiredDocumentsJob : RecurringJob
{
    public override Task ExecuteAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}

public sealed record RebuildSearchIndexArgs(long DocumentId);

[JobConfig(JobName = "Rebuild Search Index")]
public sealed class RebuildSearchIndexJob : TriggeredJob<RebuildSearchIndexArgs>
{
    public override Task ExecuteAsync(
        RebuildSearchIndexArgs parameters,
        CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
```

适合的拆法是：

- `Worker*` / `Job*` 负责调度、批处理、进度记录、取消控制、日志
- 真正的业务计算继续放到实体或 `DomainService`

如果一个作业类已经充满业务分支、规则判断和数据修正，通常说明你还缺一个 `DomainService`。

## Configuration

配置类用于宿主可调行为，不用于表达业务实体。

`Monica.Configuration` 的标准写法如下：

```csharp
[Configuration]
public class AppSettings
{
    [OptionSetting(Title = "程序名")]
    [DefaultValue("Unknown")]
    public string AppName { get; set; } = "Unknown";
}
```

使用建议：

- 放在 `Configurations/`
- 类名以 `Options` 结尾
- 用 `IOptions<T>`、`IOptionsSnapshot<T>` 或 `IOptionsMonitor<T>` 注入使用
- 真正需要热更新时再选 `Snapshot` / `Monitor`

## 推荐文件布局

以模块化单体为例，一组完整项目单元通常会落在这样的结构里：

```text
Domains/Documentation/
├── Application/
│   ├── HandlersCommand/
│   ├── HandlersQuery/
│   ├── HandlersEvent/
│   └── BackgroundWorkers/
├── Entities/
├── Interfaces/
├── Configurations/
├── DomainServices/
├── Repository/
└── Providers/

Shared/Platform.Protocol/PublishedLanguages/DomainDocumentation/
├── Requests/
├── Models/
└── Events/
```

这也是 `Monica.Docs` 当前采用的基本结构。

## 常见误区

- 把 `Res`、`Res<T>` 带进 `DomainService`、仓储或实体
- 把所有业务动作都塞进 `CrudApplicationService`
- 把请求 DTO 放到 API 项目本地，而不是 Published Language
- 在 Handler 里直接散着改实体状态，而不是把行为放回实体或 `DomainService`
- 用 `Res.Ok(value)` 返回 `string` 成功结果，导致命中非泛型重载

## 继续阅读

- [ProjectUnits 模块](../modules/project-units/index.md)
- [AutoControllers 模块](../modules/auto-controllers/index.md)
- [Facade、Service、Provider 边界](./facades-services-providers.md)
