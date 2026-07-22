---
title: 创建流程
description: 设计、生成、实现并验证第三方 Monica 模块包。
sidebar_position: 4
---

# 创建流程

使用 `$monica-third-party-module-development` 可以把包级决策转化为可发布仓库。包身份、模块边界、许可证和发布所有权都是设计输入，不应等实现完成后再补。

## 1. 定义发布边界

生成项目前先确定：

- Publisher 与 NuGet.org 所有者
- 包 ID 与职责
- 包含哪些模块，以及每个模块的键
- 非 Web、Web、Provider/Integration、混合 UI 或独立 UI 形态
- 最低支持的 Monica 版本与目标框架
- 开源、Source-available、专有或其他许可证
- 公开 NuGet.org 或私有源分发
- 仓库、支持、安全与发布渠道

一个包可以包含多个模块。把它们放在一起的原因应当是能力内聚、共同发布，而不是“恰好位于同一仓库”。

## 2. 使用 Skill 生成

向 Skill 提供明确要求：

```text
$monica-third-party-module-development 创建 Acme.Monica.Analytics，作为一个可直接
发布的混合 Razor 包。包含 Analytics、Alerts 与 Analytics UI 模块，模块键分别是
Acme.Monica.Analytics、Acme.Monica.Analytics.Alerts 和
Acme.Monica.Analytics.UI。使用 MIT 与 GitHub Actions Trusted Publishing。
```

接受生成结果前，检查身份清单、模块表、项目引用、包元数据与许可证。

## 3. 实现公开模块契约

每个模块遵循当前 Monica 注册方式：

```csharp
using Microsoft.Extensions.DependencyInjection;
using Monica.Core.Modularity.Abstractions;
using Monica.Core.Modularity.Annotations;

// ReSharper disable once CheckNamespace
namespace Acme.Monica.Analytics.Modules;

public static class ModuleAnalyticsBuilderExtensions
{
    extension(IMonicaBuilder builder)
    {
        public ModuleAnalyticsGuide AddAnalytics(
            Action<ModuleAnalyticsOption>? configure = null)
        {
            return builder.AddModule<
                ModuleAnalytics,
                ModuleAnalyticsOption,
                ModuleAnalyticsGuide>(configure);
        }
    }
}

[ModuleKey("Acme.Monica.Analytics")]
public sealed class ModuleAnalytics(ModuleAnalyticsOption option)
    : ModuleBase<ModuleAnalytics, ModuleAnalyticsOption, ModuleAnalyticsGuide>(option)
{
    public override void ConfigureServices(IServiceCollection services)
    {
        // Register the module's implementation boundary.
    }
}

public sealed class ModuleAnalyticsGuide
    : ModuleGuide<ModuleAnalytics, ModuleAnalyticsOption, ModuleAnalyticsGuide>
{
}

public sealed class ModuleAnalyticsOption : ModuleOptions<ModuleAnalytics>
{
}
```

为 Module 入口、Option、Guide 方法、公开 Abstraction、Model 与 Facade 编写 XML 文档，说明默认值、前置条件、生命周期、副作用和失败行为。

## 4. 组合真实宿主

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

## 5. 验证可分发产物

发布前完成：

1. 以零警告完成 Restore、Build 与 Test。
2. 打包 Release 配置。
3. 检查 `.nupkg` 的元数据、README、图标、许可证、程序集与静态 Web 资产。
4. 把产物推送到临时本地源。
5. 在不引用源码项目的干净消费者项目中还原。
6. 启动代表性宿主，验证每个公开注册入口。
7. 完成[质量检查清单](./quality-checklist.md)。

不要发布占位实现、TODO、被禁用的测试，或只通过源码 `ProjectReference` 测试过的包。
