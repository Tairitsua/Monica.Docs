---
title: 创建流程
description: 设计、生成、实现并验证第三方 Monica 包仓库与可选 Provider 镜像。
sidebar_position: 4
---

使用 `$monica-third-party-module-development` 可以把仓库、包、模块与运行时决策转化为可发布的完整单元。身份、依赖图、许可证、产物所有权与运维验证都是设计输入，不应等实现完成后再补。

## 1. 定义发布边界

生成项目前先确定：

- 持久仓库 ID、对齐的发布版本、Publisher 与 NuGet.org 所有者
- 每个 NuGet 包的 ID、职责、项目路径与包间依赖
- 每个模块的 Manifest 生态键、类型、模块间依赖与 Provider 目标
- 非 Web、Web、Provider/Integration、混合 UI 或独立 UI 形态
- Provider 是进程内运行，还是通过配套 OCI Service 运行
- OCI Service 需要的镜像仓库、Connector 包、CPU/NVIDIA 目标、平台、运行时 Stage、不可变 Tag 后缀、Provider 专用 Smoke Command 与受管 NVIDIA Runner Label
- 最低支持的 Monica 版本与目标框架
- 开源、Source-available、专有或其他许可证
- 公开 NuGet.org 或私有源分发
- 仓库、支持、安全与发布渠道

一个包可以包含多个模块，一个仓库也可以包含多个包。共享安装/版本边界的模块放入同一包；只有当所有权、版本、许可证、支持与发布策略对齐时，才把多个包放入同一仓库。

## 2. 编写 schema-v2 仓库契约

`monica.manifest.json` 是完整发布单元的权威描述：

- `packages[].packageDependencies` 是仓库内 NuGet 依赖图，必须使用完整包 ID。
- `packages[].modules[].dependsOn` 是 Manifest 模块图，必须使用完整生态键；Scaffold 会把它解析为具体 CLR 类型依赖。
- 每个跨包模块依赖都必须由对应包依赖承载。
- `kind: provider` 模块要设置 `providerFor`，并在 `dependsOn` 中列出同一目标。
- `ociImages[]` 通过 `companionPackageId` 把一个镜像仓库映射到拥有 Provider 模块的 Connector 包；CPU 与 NVIDIA 变体是同一仓库的不同 Target。
- 可选 `releaseGates` 声明用于证明有意义 CPU/NVIDIA Provider 推理的仓库命令。NVIDIA 门禁还包含共享的 `managedNvidiaRunnerLabels`，其中必须有 `self-hosted` 与 `nvidia`。
- `version` 同时适用于所有 NuGet 包与每个 `<version>-<tagSuffix>` 镜像 Tag。

两张依赖图都必须完整且无环。不要从项目引用猜测 Manifest 模块依赖，也不要把生态键缩写为仓库内局部名称。

## 3. 使用 Skill 生成

向 Skill 提供明确要求：

```text
$monica-third-party-module-development 把 Tairitsua.Monica.AI.OCR 设计为一个仓库，
分别提供 OCR Contract、PaddleOCR Connector 与 OCR UI NuGet 包。
仅从 NuGet 使用 Monica 1.0.0-rc.6。为 Connector 配套一个分层 OCI 仓库，
包含 CPU amd64 与 NVIDIA CUDA 12.6 amd64 目标。只在本地生成和验证，不发布。
```

这只是设计示例，不代表这些包或镜像已经发布。接受生成结果前，检查身份清单、包/模块依赖图、项目引用、OCI 声明、元数据与许可证。声明 OCI 目标只会生成 Bake 契约与目录，不会生成真实 Provider Service 实现。只要有一个声明的镜像缺少完整发布门禁，Scaffold 就会省略整个发布工作流，避免产生部分 NuGet/OCI 发布。

对于每个 UI 模块，Scaffold 会从该模块的 Manifest 键移除末尾 `.UI` 得到稳定导航分类 ID，使用 `RegisterLocalizedCategory<TResource>()` 注册分类文本，再通过 `RegisterLocalizedPage<TPage, TResource>()` 注册页面。后续增加页面时继续使用这一显式资源归属模式，不要改回集中资源或按翻译文本分组。

## 4. 实现公开模块契约

每个模块遵循当前 Monica 注册方式：

```csharp
using Microsoft.Extensions.DependencyInjection;
using Monica.Core.Modularity.Abstractions;
using Monica.Core.Modularity.Models;
using Monica.Modules;

// ReSharper disable once CheckNamespace
namespace Acme.Monica.Analytics.Modules;

public static class ModuleAnalyticsBuilderExtensions
{
    extension(IMonicaBuilder builder)
    {
        public ModuleRegistration<ModuleAnalytics, ModuleAnalyticsOption> AddAnalytics(
            Action<ModuleAnalyticsOption>? configure = null)
        {
            return builder.AddModule<ModuleAnalytics, ModuleAnalyticsOption>(configure);
        }
    }
}

public sealed class ModuleAnalytics : MonicaModule<ModuleAnalyticsOption>
{
    public override void Describe(ModuleDescriptor module)
    {
        module.Require<ModuleResultEnvelope, ModuleResultEnvelopeOption>();
        module.AfterIfPresent<ModuleObjectMapping, ModuleObjectMappingOption>();
    }

    public override void ConfigureServices(ModuleContext<ModuleAnalyticsOption> context)
    {
        // Register the module's implementation boundary.
        context.Services.AddSingleton<AnalyticsService>();
    }
}

public sealed class ModuleAnalyticsOption : ModuleOptions<ModuleAnalytics>
{
}
```

`Describe(ModuleDescriptor)` 不读取 Option，在 Monica 编译模块图时只执行一次。`Require<TModule, TOptions>()` 会包含硬依赖；`AfterIfPresent<TModule, TOptions>()` 只在目标已存在时增加排序关系。流式 Feature 方法扩展 `ModuleRegistration<TModule, TOptions>`，在同一个宿主绑定的注册对象上增加能力，不再引入独立 Guide 对象。

为 Module 入口、Option、注册扩展方法、公开 Abstraction、Model 与 Facade 编写 XML 文档，说明默认值、前置条件、生命周期、副作用和失败行为。

### 只调度隔离的 CPU 密集型组合工作

当完成物化的模块中有同步 CPU 密集型工作可以与后续串行回调重叠时，先准备不可变或由本模块独占的输入快照，再从该模块的 `ConfigureBuilder`、`ConfigureServices`、`PostConfigureServices`，或通过 `discovery.Match(...)` 声明的类型发现 Commit 回调中同步调用受保护的 `ScheduleStartupWork(...)` 方法。`DeclareTypeDiscovery(...)` Override 本身只记录计划，不是可调度回调。选择最晚需要结果的屏障：

```csharp
public sealed class ModuleAnalytics : MonicaModule<ModuleAnalyticsOption>
{
    private readonly AnalyticsExpressionCatalog _catalog = new();

    public override void ConfigureServices(ModuleContext<ModuleAnalyticsOption> context)
    {
        context.Services.AddSingleton(_catalog);
    }

    public override void PostConfigureServices(ModuleContext<ModuleAnalyticsOption> context)
    {
        var candidate = _catalog.CreateCompilationCandidate();

        ScheduleStartupWork(
            "compile-analytics-expressions",
            candidate.Compile,
            () => _catalog.Publish(candidate),
            ModuleStartupWorkBarrier.BeforeServiceRegistrationCompletion);
    }
}
```

`BeforeServiceRegistrationCompletion` 是默认值，可以省略。类型发现注册 Commit 需要结果时使用 `BeforeTypeDiscovery`，Post Configure 阶段需要结果时使用 `BeforePostConfigureServices`。从类型发现 Commit 内提交的工作不能选择 `BeforeTypeDiscovery`，因为 Monica 调用该 Commit 前已经跨过此 Barrier。`BeforeHostLifecycle` 允许组合先完成，但会阻塞 Generic Host 启动；`NoBarrier` 从不阻塞就绪状态，失败只进入诊断。串行 Commit 重载只支持不晚于 `BeforeServiceRegistrationCompletion` 的屏障；更晚或非阻塞工作不能提交 Service 注册变更。屏障是排序边界，不是超时设置。

工作 Action 与可选 Commit Action 必须同步；Monica 会拒绝 `async`/`async void` 委托。Worker 必须具有确定性并保持隔离：不得修改宿主 Builder、`IServiceCollection`、模块图、Service Provider 或共享静态状态，也不得依赖其他工作项的完成顺序。Monica 负责限制并发调度，在选定屏障处等待，并在继续前传播阻塞型工作的失败。`NoBarrier` 工作由宿主持有并持续可观测，直到完成或宿主释放。不要在模块内增加 `Task.Run`、`Task.WhenAll` 或 Fire-and-forget 工作。

运行时激活、I/O、长时间任务与清理应使用 `IHostedLifecycleService` 或 Hosted Service。`ScheduleStartupWork(...)` 不会让 `ConfigureServices`、`PostConfigureServices` 或其他模块回调并发执行。

## 5. 组合真实宿主

测试消费者真正使用的边界：

```csharp
using Acme.Monica.Analytics.Modules;
using Monica.Core.Modularity.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddAnalytics();
    monica.AddAlerts();
    monica.AddAnalyticsUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Console 与 Worker 宿主只需要 `AddMonica(...)`；Web 宿主在 `Build()` 后调用 `UseMonica()` 与 `MapMonica()`。

.NET 10 UI Bridge 必须使用 `Microsoft.NET.Sdk.Web`，并在项目中设置
`<RequiresAspNetWebAssets>true</RequiresAspNetWebAssets>`。缺少该属性时，
服务器预渲染可能看似正常，但 `/_framework/blazor.web.js` 会返回 404，页面也不会进入
可交互状态。

对于独立运行的 Provider Service，Provider NuGet 包仍是实现能力包公开抽象的轻量 Connector。CPU 与 NVIDIA 镜像 Tag 必须提供完全相同的 HTTP 或 gRPC 契约，让消费者只通过部署配置切换加速方式，不需要重新编译。

## 6. 验证完整发布单元

发布前完成：

1. 运行 `python scripts/validate_repository.py --root .` 以及适用的本地化与 OCI Validator。
2. 从 NuGet 还原清单中声明的精确 Monica 版本。仓库 Validator 要求每个解析后的 `Monica.*` `PackageReference`（包括使用普通属性间接声明的中央版本）都等于 Manifest `monicaVersion`。不要增加 `MonicaSourceRoot`、指向同级 Monica 源码的 `ProjectReference` 或本地源码包源覆盖。
3. 以零警告完成 Build 与 Test，再以 Release 打包所有声明项目。
4. 运行 `python scripts/inspect_packages.py --root . --artifacts artifacts`，拒绝缺失/多余包、错误的仓库内 NuGet 依赖以及被嵌入的兄弟包程序集。
5. 把所有 `.nupkg` 推送到临时本地源。在不引用包源码项目的干净消费者中还原并运行每个公开包入口。
6. 对 OCI 发布，验证规范化 Bake 图，构建每个目标，并运行 `python scripts/inspect_images.py --root .` 检查 Tag、Label、非 Root 运行与 Health Check。
7. 运行声明的 Provider 专用 CPU Smoke Command。对每个 NVIDIA 目标，在声明的受管 Self-hosted GPU Runner 上执行 NVIDIA Smoke Command，并在 GPU 上完成真实 Provider 推理。发布工作流会先 Load/Inspect 镜像并执行这些命令，然后才登录 Registry 或推送任何产物。仅构建镜像、执行 `docker inspect`、导入 CUDA 或运行 `nvidia-smi` 都不足以通过。
8. 启动代表性宿主与 UI Bridge，验证每个公开注册入口，并完成[质量检查清单](./quality-checklist.md)。

不要发布占位实现、TODO、被禁用的测试、伪造 Provider 响应，或只通过源码 `ProjectReference` 测试过的产物。第一次外部 Push 前，所有声明的包与镜像必须一起通过。
