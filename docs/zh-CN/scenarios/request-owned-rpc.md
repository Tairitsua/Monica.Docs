---
title: 请求拥有的 RPC 客户端与 Local RPC
description: 从 Platform.Protocol 中的发布请求直接生成 HTTP 与 Local RPC 客户端，无需 JSON snapshot 或 Producer 优先构建。
sidebar_position: 2
---

# 请求拥有的 RPC 客户端与 Local RPC

`Monica.Generators.AutoController` 直接从带 `[ApiEndpoint]` 的请求符号生成 HTTP Controller 与 RPC 客户端。RPC 契约不再从 Handler 构建产物或 `*.rpc-metadata.json` 中恢复，因此从空的 `bin/`、`obj/` 开始就能一次构建成功。

## 何时使用

- 你需要让 `Platform.Protocol` 成为跨领域同步调用的唯一契约源。
- 你希望同一份请求契约既支持跨进程 HTTP，也支持进程内 Local 调用。
- 你不希望构建向源码目录写入 snapshot，或要求先构建 Provider。
- 你希望通过请求放置位置明确区分“发布 RPC”与“仅 HTTP”。

## 契约与运行时角色

| 角色 | 典型项目 | 职责 |
|---|---|---|
| Contract owner | `Platform.Protocol` | 保存 `PublishedLanguages` 请求/响应，并生成 RPC 接口与传输实现。 |
| Provider | `Domains.*` 或 `*Service.API` | 实现使用发布请求的 `ApplicationService`，并生成 HTTP Controller。 |
| Consumer | 其他领域 | 注入 `I{Domain}CommandApi` 或 `I{Domain}QueryApi`。 |
| Host | AppHost / API 宿主 | 注册 `monica.AddRpcClient()` 并选择 Local 或 HTTP。 |

推荐结构：

```text
src/
  Domains/
    LocalRpcProvider/
      Application/HandlersQuery/
    Showcase/
      Application/HandlersQuery/
  Shared/
    Platform.Protocol/
      PublishedLanguages/
        DomainLocalRpcProvider/
          Requests/
          Models/
```

这里没有 `RpcMetadata/` 目录。

## 1. 配置协议程序集

协议程序集私有引用 `Monica.Generators.AutoController`，然后用一份统一配置选择要生成的客户端传输：

```csharp
using Monica.WebApi.Annotations;

[assembly: WebApiGenerationConfig(
    "api/v1",
    RpcClientTargets = RpcClientGenerationTargets.Http
        | RpcClientGenerationTargets.Local)]
```

`RpcClientTargets` 是编译期输出选择，不是宿主运行时传输选择。

## 2. 发布请求拥有端点契约

```csharp
using Monica.WebApi.Abstractions;
using Monica.WebApi.Annotations;

namespace Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Requests;

/// <summary>
/// 返回 Local RPC 示例领域的问候信息。
/// </summary>
[ApiEndpoint(ApiHttpMethod.Get, "greeting", Binding = ApiRequestBinding.Query)]
public sealed record QueryGetLocalRpcGreeting(string ConsumerName)
    : IResultRequest<LocalRpcGreetingDto>;
```

发布条件同时要求：

1. 请求带 `[ApiEndpoint]`。
2. 请求位于严格的 `PublishedLanguages.Domain{Domain}.Requests` 命名空间。

生成器根据 `Query*` / `Command*` 分类接口，并从请求实现的唯一 `IRequest<TResult>` 得到返回类型。上例生成 `ILocalRpcProviderQueryApi`。

## 3. Provider 实现 Handler

Provider 程序集只配置自己的路由前缀和 Domain：

```csharp
[assembly: WebApiGenerationConfig(
    "api/v1",
    DomainName = "LocalRpcProvider")]
```

Handler 不再声明 `[HttpGet]` 或端点 XML 文档：

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

请求上的 Route 与 Provider 配置组合成 `GET api/v1/LocalRpcProvider/greeting`。

## 4. Consumer 注入生成接口

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

生成接口方法接收可选 `CancellationToken`，HTTP 与 Local 实现都会继续传递它。

## 5. Host 选择运行时传输

### 模块化单体

```csharp
builder.AddMonica(monica =>
{
    monica.AddRpcClient()
        .ConfigDomainInfoProvider(new MonicaDocsRpcClientDomainInfoProvider())
        .UseLocalTransport();
});
```

Local 实现继承 `LocalRpcApi`，通过 `IMediator` 在同一进程派发发布请求。

### 跨进程 HTTP

```csharp
builder.AddMonica(monica =>
{
    monica.AddRpcClient()
        .ConfigDomainInfoProvider(new AppRpcClientDomainInfoProvider())
        .UseHttpTransport()
        .UseDaprProvider(options =>
        {
            options.Timeout = TimeSpan.FromSeconds(30);
        });
});
```

HTTP 实现使用同一请求上的 Method、Route 与 Binding。宿主还必须提供 Domain 到远端 AppId 的映射。

## 首次干净构建为什么成立

协议项目在自身 Roslyn compilation 中读取发布请求并生成客户端。Provider 项目解析 `ApplicationService<TRequest, ...>` 使用的同一个请求符号并生成 Controller。两边不通过磁盘文件交换中间状态，所以不存在下面这些步骤：

- `MonicaRpcMetadataExportDirectory`
- `MonicaRpcMetadataConsumeDirectory`
- `RpcClientConfig`
- `*.rpc-metadata.json`
- bootstrap 源码扫描
- Producer 优先构建

删除所有 `bin/`、`obj/` 后，正常依赖顺序中的一次 solution build 就能产出协议接口、传输实现与 Controller。

## 什么时候把请求保持本地

如果请求不应成为跨领域契约，就把它放在所属 Handler 附近，而不是放进 `PublishedLanguages`。本地请求仍需 `[ApiEndpoint]`，也会生成 HTTP Controller，但不会生成 RPC API。

典型本地端点：

- 返回 `PhysicalFileResult` 的二进制资源
- `IFormFile` / multipart 上传
- 返回传输专用 `object` 的导出接口
- 只服务于当前领域的内部操作

Monica.Docs 的 `QueryGetDocAsset` 就与 Handler 放在同一文件中。

## 验证清单

- 发布请求使用 `Command*` 或 `Query*` 命名并带 `[ApiEndpoint]`。
- 发布命名空间严格符合 `PublishedLanguages.Domain{Domain}.Requests`。
- 请求只有一个 `IRequest<TResult>` 结果契约。
- 发布结果 Envelope 实现 `IRemoteResultEnvelope<TSelf>`；自定义 Envelope 使用正常构造流程创建远程失败结果，不绕过自身不变量。
- Provider Handler 与请求/响应结果类型一致。
- Consumer 使用 `I{Domain}CommandApi` 或 `I{Domain}QueryApi`。
- Host 显式选择与生成 Target 对应的传输。
- 仓库中没有 `RpcMetadata` snapshot 或相关 MSBuild 属性。
- 连续两次构建都不会修改源码工作区。

## 继续阅读

- [AutoControllers](../modules/auto-controllers/index.md)
- [项目单元编写](../concepts/project-unit-authoring.md)
