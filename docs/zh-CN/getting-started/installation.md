---
title: 安装与主机接入
description: 安装 Monica 包并接入统一的主机启动流程。
sidebar_position: 2
---

# 安装与主机接入

Monica 不要求你一次性安装整套框架。通常的做法是：**先安装你真正需要的模块包，再把它们通过 `Mo.Add*()` 注册到主机中。**

## 你至少需要知道的模式

Monica 主机通常遵循下面的三段式流程：

1. 在 `builder` 阶段调用 `Mo.Add*()` 注册模块
2. 在 `builder` 阶段调用 `builder.UseMonica()` 完成 Monica 主机构建
3. 在 `app` 阶段调用 `app.UseMonica()` / `app.MapMonica()` 让模块端点与中间件生效

## 安装包

```bash
dotnet add package Monica.Core
dotnet add package Monica.DependencyInjection
dotnet add package Monica.EventBus
```

只安装需要的包即可。后续如果要接入仓储、作业调度、SignalR 或配置管理，再补对应的模块包。

## 最小主机骨架

```csharp
using Monica.Core;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddDependencyInjection();
Mo.AddEventBus().UseNoOpDistributedEventBus();

builder.UseMonica();

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

## 接入 UI 模块后页面一直转圈时

如果你在接入 `Monica.UI` 或其他 `*.UI` 模块后发现页面打不开、浏览器一直转圈，先打开浏览器开发者工具的 Network 面板，确认下面两个资源是否返回了 `404`：

- `/_framework/blazor.web.js`
- `/_content/Monica.UI/...`

如果 `/_framework/blazor.web.js` 在本地调试时返回 `404`，或样式文件返回 `200 OK` 但 `Content-Length: 0`，通常按下面顺序排查：

1. 确认宿主确实是 ASP.NET Core Web 应用，并且走的是 `WebApplicationBuilder` / `WebApplication` 启动流程。
2. 确认当前启动配置真的应用了预期环境。如果 `launchSettings.json` 没有生效，运行环境可能和你本地调试时假设的不一致，这会直接影响静态 Web 资源的加载行为。
3. 在宿主 `.csproj` 中确认已经启用 Razor 类库静态资源支持：

```xml
<PropertyGroup>
  <RequiresAspNetWebAssets>true</RequiresAspNetWebAssets>
</PropertyGroup>
```

4. 必要时检查编译输出中的 `.StaticWebAssets.xml` 或 `*.staticwebassets.runtime.json`，确认 `Monica.UI`、`MudBlazor` 等依赖资源的映射已经生成。
5. 最后回到 `Program.cs`，确认 Monica 主机闭环没有缺失：`builder.UseMonica()`、`app.UseMonica()`、`app.MapMonica()`。

### Debug 启动后 UI 没有样式

如果页面结构已经出来，但 Monica 顶栏、MudBlazor 卡片或加载骨架看起来像“无样式”页面，先不要只看 HTTP 状态码。静态资源端点可能返回 `200 OK`，但响应体是空的。可以直接检查关键 CSS 的响应头和字节数：

```bash
curl -D - http://localhost:5298/_content/MudBlazor/MudBlazor.min.css -o /tmp/mud.css
wc -c /tmp/mud.css

curl -D - http://localhost:5298/_content/Monica.UI/css/mo-theme-main.css -o /tmp/mo-theme.css
wc -c /tmp/mo-theme.css
```

本地 Debug 运行时，ASP.NET Core 默认只在 `Development` 环境自动启用静态 Web 资源。如果 IDE 没有应用 `launchSettings.json`，进程可能会以 `Production` 启动，但仍然从 `bin/Debug` 运行。这个组合会导致 Razor Class Library 静态资源没有真正启用，表现为 CSS/JS 请求返回空内容，并且服务端日志可能出现类似提示：

```text
The application is not running against the published output and Static Web Assets are not enabled.
```

优先修复启动配置，而不是在正式生产环境中强行打开本地静态资源映射：

1. 在 IDE 的 Run/Debug Configuration 中确认 `ASPNETCORE_ENVIRONMENT=Development` 或 `DOTNET_ENVIRONMENT=Development`。
2. 确认启动项使用的是宿主项目的 `Properties/launchSettings.json`，而不是裸的 executable/profile。
3. 如果项目经常被 IDE 以裸 Debug 配置启动，可以在 `Program.cs` 中添加 Debug-only fallback，并且只在两个环境变量都未设置时生效：

```csharp
#if DEBUG
UseDevelopmentEnvironmentByDefaultForLocalDebugging();
#endif

var builder = WebApplication.CreateBuilder(args);

static void UseDevelopmentEnvironmentByDefaultForLocalDebugging()
{
    if (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"))
        || !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")))
    {
        return;
    }

    Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", Environments.Development);
    Environment.SetEnvironmentVariable("DOTNET_ENVIRONMENT", Environments.Development);
}
```

不要把这个问题误判为 Monica 主题 CSS 本身损坏。只要同一套 URL 在正确的 `Development` Debug 启动下能返回非零字节内容，问题就通常在宿主启动环境或静态 Web 资源加载条件上。

如果某个 UI 页面在浏览器内导航可以打开，但按 `F5` 刷新后返回 `404`，还要额外检查模块端点是否都通过 Monica 的映射流程注册完成。`Monica.UI` 会在模块映射阶段注册 Razor Components、静态资源和附加程序集；宿主没有完成这一步时，Router 内导航和直接刷新可能表现不一致。

## 什么时候需要继续往下配

- 只要模块有 `ModuleOption`，你就可以在 `Mo.Add*()` 的 lambda 中配置它
- 只要模块有 `ModuleGuide`，你就可以继续链式调用启用附加能力
- 只要模块存在配套 UI 模块，通常都应该把基础设施模块和 UI 模块分开理解、按需组合

## 下一步

- [注册第一个模块](./first-module.md)
- [理解 Monica 模块模式](../concepts/module-pattern.md)
