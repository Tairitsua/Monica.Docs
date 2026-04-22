---
title: 无需工具的 RPC 客户端生成与 Local RPC
description: 用 Monica.Generators.AutoController 在 Producer、Protocol 与 Host 之间生成 HTTP 与 Local RPC 客户端，无需额外 CLI 工具。
sidebar_position: 2
---

# 无需工具的 RPC 客户端生成与 Local RPC

`Monica.Generators.AutoController` 现在同时承担两件事：

1. 从 `ApplicationService` / Handler 生成 HTTP API Controller。
2. 通过构建期元数据导出与消费，生成 RPC 合同接口和传输实现。

这条工作流已经是**构建集成**的。正常项目里不再需要 `Monica.Generators.AutoController.Tool`、手工执行 CLI、也不需要人工维护 RPC 调用代码。

## 何时使用

- 你希望一个共享 `Platform.Protocol` 同时服务于微服务和模块化单体。
- 你希望跨领域调用继续走“共享请求/响应契约 + 生成 RPC 客户端”模式，而不是手写一批 Adapter。
- 你希望在分布式场景用 HTTP RPC，在单体场景直接切换成进程内 `Local` 调用。
- 你希望删除 `RpcMetadata/` 后，重新构建仍然能自动恢复元数据。

## 整体角色划分

这条工作流通常有三个角色：

| 角色 | 典型项目 | 责任 |
|---|---|---|
| Producer | `Domains.*` 或 `*Service.API` | 暴露 Handler，构建后导出 `*.rpc-metadata.json` |
| Consumer | `Platform.Protocol` | 保存 `PublishedLanguages` 契约，消费 `RpcMetadata`，生成 `Contracts` 与 `Implementations.*` |
| Host | `AppHost` / API 宿主 | 注册 `Mo.AddRpcClient()`，选择 HTTP 或 Local 传输 |

推荐目录结构：

```text
src/
  AppHost/
    Monica.Docs.Api/
  Domains/
    Documentation/
    LocalRpcProvider/
  Shared/
    Platform.Protocol/
      PublishedLanguages/
      RpcMetadata/
```

## 最小正确接入

### 1. Producer 项目导出 RPC 元数据

Producer 项目只需要像普通生成器项目一样引用包，然后声明导出目录。

```xml
<PropertyGroup>
  <MonicaRpcMetadataExportDirectory>../../Shared/Platform.Protocol/RpcMetadata</MonicaRpcMetadataExportDirectory>
</PropertyGroup>

<ItemGroup>
  <PackageReference Include="Monica.Generators.AutoController" Version="x.y.z" PrivateAssets="all" />
</ItemGroup>
```

然后在 Producer 程序集级固定默认路由：

```csharp
using Monica.WebApi.AutoControllers.Annotations;

[assembly: AutoControllerConfig(
    DefaultRoutePrefix = "api/v1",
    DomainName = "LocalRpcProvider")]
```

构建后，包会自动完成下面几件事：

- 打开 `EmitCompilerGeneratedFiles`
- 从生成的 `__RpcMetadata.g.cs` 中提取元数据
- 输出到 `MonicaRpcMetadataExportDirectory`
- 如果 JSON 内容未变化，则跳过重写

### 2. Consumer 项目消费元数据并生成客户端

Consumer 项目通常就是共享协议层，例如 `Platform.Protocol`。它需要两部分配置：

1. 引用 `Monica.Generators.AutoController`
2. 在程序集级声明 `RpcClientConfig`

```xml
<ItemGroup>
  <PackageReference Include="Monica.Generators.AutoController" Version="x.y.z" PrivateAssets="all" />
</ItemGroup>
```

```csharp
using Monica.WebApi.AutoControllers.Annotations;
using Monica.WebApi.RpcClient.Annotations;

[assembly: AutoControllerConfig(SkipGeneration = true)]
[assembly: RpcClientConfig(
    AddHttpImplementations = true,
    AddLocalImplementations = true)]
```

这段配置表示：

- `SkipGeneration = true`：协议层自己不生成 HTTP Controller。
- `AddHttpImplementations = true`：生成 `Implementations.Http`。
- `AddLocalImplementations = true`：生成 `Implementations.Local`。

Consumer 项目默认从 `RpcMetadata/*.rpc-metadata.json` 读取元数据。如果你用了其他目录，可以改 `MonicaRpcMetadataConsumeDirectory`。

### 3. 共享契约必须放在 `PublishedLanguages`

请求、响应、共享模型应放在 Consumer 项目里，通常是：

```text
Platform.Protocol/
  PublishedLanguages/
    DomainDocumentation/
      Requests/
      Models/
    DomainLocalRpcProvider/
      Requests/
      Models/
  RpcMetadata/
```

生成后的类型逻辑上会落在下面这些命名空间：

```text
Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider
  Contracts
  Implementations.Http
  Implementations.Local
```

### 4. Host 在运行时选择传输

#### 模块化单体

如果调用方和提供方在同一个进程里，直接注册 `Local` 传输：

```csharp
Mo.AddRpcClient()
    .ConfigDomainInfoProvider(new MonicaDocsRpcClientDomainInfoProvider())
    .UseLocalTransport();
```

`Local` 传输的特点：

- 生成实现继承 `LocalRpcApi`
- 通过 `IMediator` 在进程内直接派发请求
- 不需要 Dapr
- 不需要额外 `HttpClient` Provider

#### 分布式部署

如果领域之间是跨进程调用，则注册 HTTP 传输，并补上具体 Provider，例如 Dapr：

```csharp
Mo.AddRpcClient()
    .ConfigDomainInfoProvider(new ExtendModuleRpcClient(config))
    .UseHttpTransport()
    .UseDaprProvider(o =>
    {
        o.Timeout = config.DaprOptions.InvocationTimeout;
    });
```

`UseHttpTransport()` 仍然是默认传输，但如果你同时生成了 `Http` 和 `Local`，建议在宿主里**显式写出来**，不要依赖默认值推断。

## Monica.Docs 中的 Local RPC 实例

`Monica.Docs` 现在包含一个真实可运行的单体示例：

- `Domains.LocalRpcProvider`：提供方领域，暴露 `QueryHandlerGetLocalRpcGreeting`
- `Domains.Documentation`：调用方领域，暴露 `QueryHandlerGetLocalRpcSample`
- `Platform.Protocol`：保存共享请求/响应契约，并生成 `IQueryLocalRpcProvider`
- `Monica.Docs.Api`：注册 `Mo.AddRpcClient().UseLocalTransport()`

调用方 Handler 的核心写法如下：

```csharp
public sealed class QueryHandlerGetLocalRpcSample(
    IQueryLocalRpcProvider localRpcProvider)
    : ApplicationService<GetLocalRpcSampleRequest, LocalRpcSampleDto>
{
    [HttpGet("local-rpc-sample")]
    public override async Task<Res<LocalRpcSampleDto>> Handle(
        GetLocalRpcSampleRequest request,
        CancellationToken cancellationToken)
    {
        var providerResult = await localRpcProvider.GetLocalRpcGreeting(
            new GetLocalRpcGreetingRequest(request.ConsumerName));

        if (providerResult.IsFailed(out var error, out var providerGreeting))
        {
            return error!;
        }

        return new LocalRpcSampleDto(
            request.ConsumerName,
            providerGreeting.Message,
            providerGreeting.GeneratedAtUtc,
            "Local");
    }
}
```

这次验证里，下面这个接口已经实际跑通：

```text
GET /api/v1/Documentation/local-rpc-sample?ConsumerName=Codex
```

返回结果示例：

```json
{
  "message": null,
  "code": 200,
  "data": {
    "consumerName": "Codex",
    "providerMessage": "Hello Codex from LocalRpcProvider.",
    "providerGeneratedAtUtc": "2026-04-22T07:40:30.6022617+00:00",
    "transport": "Local"
  }
}
```

## 删除 `RpcMetadata` 后会发生什么

当 Consumer 项目构建时，如果满足下面任一条件，包会先执行 bootstrap：

- 存在 `RpcMetadata` 目录
- 存在 `PublishedLanguages` 目录

bootstrap 会：

1. 找到仓库根目录
2. 扫描仓库里的 `*.csproj`
3. 找出那些把 `MonicaRpcMetadataExportDirectory` 指向同一个消费目录的 Producer
4. 根据 Producer 源码恢复缺失的 `*.rpc-metadata.json`

所以在同仓库开发里，下面几种情况都可以恢复：

- `RpcMetadata/` 整个删掉
- 只删掉部分 `.rpc-metadata.json`
- 只保留空目录或 `.gitkeep`

但它也有明确边界：

- Producer 源码必须在同一仓库里
- Producer 的导出目录和 Consumer 的消费目录必须能对应上
- 共享契约源码必须仍然能从 Consumer 项目里读到

如果这些条件不成立，仍应把 `RpcMetadata/*.json` 作为源码一部分提交。

## 实践补充与常见问题

### 1. 共享 DTO 不要留在 Producer 私有项目里

RPC 生成依赖 Consumer 项目里的共享契约命名空间。如果请求或响应类型仍然放在 Producer 私有命名空间里，生成器就无法为 Consumer 产出可编译的 RPC 客户端。

最稳妥的规则是：

- `Requests/`
- `Models/`
- 需要跨领域共享的契约接口

全部放进 `Platform.Protocol/PublishedLanguages/...`

### 2. 同时生成 `Http` 与 `Local` 时，宿主必须选择传输

现在 Consumer 可以同时生成：

- `Implementations.Http`
- `Implementations.Local`

但运行时注册只能选一个传输实现。请在宿主里明确写：

- `UseHttpTransport()`
- `UseLocalTransport()`

否则你会把“生成了两套实现”和“实际要注册哪一套实现”混在一起。

### 3. 协议层不需要再手工引用 `System.ServiceModel.Primitives`

生成的 RPC 合同接口会使用 `ServiceContract` / `OperationContract`。当前版本里，`Monica.WebApi` 已经携带 `System.ServiceModel.Primitives`，协议层不需要再单独补这个包。

### 4. Source 引用只适合框架联调，普通项目优先 NuGet

如果业务仓库只是使用这个能力，优先写：

```xml
<PackageReference Include="Monica.Generators.AutoController" Version="x.y.z" PrivateAssets="all" />
```

只有在你明确需要直接联调 `MoLibrary` 源码时，才考虑用 `ProjectReference` 指向生成器项目。那种模式下，通常还需要仓库级 `Directory.Build.props` / `Directory.Build.targets` 额外 glue，来准备 BuildTasks 程序集。

### 5. NuGet 发布后，使用方式不变

发布到 NuGet 后，Producer / Consumer / Host 这三层角色和配置方式不变：

- Producer 仍然导出 `RpcMetadata`
- Consumer 仍然通过 `RpcClientConfig` 生成客户端
- Host 仍然通过 `Mo.AddRpcClient()` 选择 `Http` 或 `Local`

真正变简单的是：

- 不需要手工摆放 BuildTasks
- 不需要源代码联调的额外 glue
- 项目引用关系更清晰

## 故障排查清单

### 没有导出元数据文件

优先检查 Producer 项目是否同时满足下面几项：

- 已引用 `Monica.Generators.AutoController`
- 已声明程序集级 `AutoControllerConfig`
- 已正确设置 `MonicaRpcMetadataExportDirectory`
- 本次构建确实产出了 `__RpcMetadata.g.cs`
- Handler 使用的请求/响应契约位于 Consumer 可引用的共享命名空间中，通常就是 `PublishedLanguages`

### 没有生成 RPC 客户端代码

优先检查 Consumer 项目是否同时满足下面几项：

- 已引用 `Monica.Generators.AutoController`
- 已声明程序集级 `RpcClientConfig`
- 元数据文件位于 `RpcMetadata/` 或 `MonicaRpcMetadataConsumeDirectory` 指向的目录
- Consumer 项目中仍然包含 `PublishedLanguages` 下的共享契约源码

### 删除 `RpcMetadata` 后重新构建仍然失败

如果 bootstrap 没有把元数据恢复出来，通常说明下面至少有一项不成立：

- Producer 源码项目不在同一个仓库中
- Producer 的导出目录和 Consumer 的消费目录没有正确对应
- Consumer 项目已经无法读取共享契约源码

这时不要继续依赖自动恢复，应先修正仓库布局与目录映射；如果当前仓库本来就不满足这些前提，就把 `RpcMetadata/*.json` 重新作为源码提交。

## 相关阅读

- [AutoControllers 模块文档](../modules/auto-controllers/index.md)
- [构建最小 Monica API 主机](./minimal-api-host.md)
- [项目单元编写](../concepts/project-unit-authoring.md)
