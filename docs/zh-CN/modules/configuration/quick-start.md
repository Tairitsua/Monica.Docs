---
title: Quick Start
description: 安装并注册 Configuration，声明第一个可管理的 Options 类型。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.Configuration
```

## 最小注册

```csharp
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;
using Monica.Configuration.Annotations;
using Monica.Configuration.Models;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddConfiguration();

builder.UseMonica();

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

[Configuration(
    "Demo:App",
    DefinitionKey = "demo.app",
    DisplayName = "Demo App",
    Description = "演示 Monica.Configuration 的最小配置类。",
    OwnerModule = "Demo")]
public sealed class DemoAppOptions
{
    [Required]
    [OptionSetting("程序名称")]
    public string AppName { get; set; } = "Demo";

    [Range(1, 200)]
    [OptionSetting("Page Size", Description = "默认分页大小。")]
    public int PageSize { get; set; } = 20;

    [OptionSetting("Api Key", IsSensitive = true)]
    public string? ApiKey { get; set; }

    [OptionSetting(
        "Startup Cache TTL",
        ReloadBehavior = ConfigurationReloadBehavior.StaticAfterStartup)]
    public TimeSpan StartupCacheTtl { get; set; } = TimeSpan.FromMinutes(10);
}

public sealed class HomeService(IOptionsSnapshot<DemoAppOptions> options)
{
    public string ReadName() => options.Value.AppName;
}
```

`Mo.AddConfiguration()` 会在 Monica 扫描业务类型时找到 `[Configuration]` 类型，生成 schema，并注册对应的 Options 绑定。运行期消费配置时仍然使用 Microsoft Options Pattern。

当前 Options 绑定使用宿主已有的 `builder.Configuration` section。运行时 mutation 会写入 Monica value source；如果宿主需要把这些动态 override 直接纳入 `IConfiguration` 绑定视图，还需要接入 Monica 投影 provider。Configuration UI、来源链路、历史和 mutation 不依赖应用手写 `services.Configure<TOptions>(...)`。

## 配置文件示例

```json
{
  "Demo": {
    "App": {
      "AppName": "Monica Docs",
      "PageSize": 50,
      "StartupCacheTtl": "00:10:00"
    }
  }
}
```

`[Configuration("Demo:App")]` 决定 Microsoft `IConfiguration` 绑定路径。上面的 `Demo:App` 会绑定到 `DemoAppOptions`，属性路径分别是 `Demo:App:AppName`、`Demo:App:PageSize` 等。

## 添加管理 UI

```bash
dotnet add package Monica.Configuration.UI
```

```csharp
Mo.AddConfiguration();
Mo.AddConfigurationUI();
```

`Mo.AddConfigurationUI()` 会注册配置状态、历史、Debug View 和 Provider 页面。页面入口请看 [Configuration UI](../configuration-ui/index.md)。

## 第一个运行时修改

运行时修改不直接写 `IConfiguration`。应用或 UI 应该通过 `ConfigurationFacade` 发起 mutation：

```csharp
using Monica.Configuration.Facades;
using Monica.Configuration.Models;

public sealed class ConfigurationCommand(ConfigurationFacade facade)
{
    public async Task RenameAsync()
    {
        var result = await facade.MutateAsync(new ConfigurationMutationRequest
        {
            DefinitionKey = "demo.app",
            LogicalPath = LogicalPath.FromProperties(nameof(DemoAppOptions.AppName)),
            MutationKind = ConfigurationMutationKind.Set,
            Value = ConfigurationStoredValue.Plain("\"New Name\""),
            ExpectedSchemaVersion = 1
        });

        if (result.IsFailed(out var error, out _))
        {
            throw new InvalidOperationException(error.Message);
        }
    }
}
```

默认情况下，可写源是内存源，适合开发、演示和测试。如果需要重启后保留修改和历史，请启用 EF Core 或 Redis 等持久化来源。

## 接下来读什么

- [Configuration](./configuration.md)
- [Concepts](./concepts.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
