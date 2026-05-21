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

Mo.AddConfiguration()
    .UseFileConfigurationStore();

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

`UseFileConfigurationStore()` 是单体和本地模式的最小 store preset。第一次启动时，Monica 会为每个 `DefinitionKey` 创建一个 effective JSON document：优先从宿主 `IConfiguration` 的 section seed，缺失时回退到 CLR 默认值。

## 配置文件 seed 示例

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

`[Configuration("Demo:App")]` 决定 seed 的 Microsoft `IConfiguration` section。初始化完成后，运行时修改写入 Monica store 中的 effective JSON document，不会回写原始 `appsettings.json`。

## 添加管理 UI

```bash
dotnet add package Monica.Configuration.UI
```

```csharp
Mo.AddConfiguration()
    .UseFileConfigurationStore();
Mo.AddConfigurationUI();
```

`Mo.AddConfigurationUI()` 会注册配置状态、历史、Debug View 和 Storage 页面。页面入口请看 [Configuration UI](../configuration-ui/index.md)。

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

修改成功后，Monica 会 patch 对应 `DefinitionKey` 的 effective JSON document，写入 history，刷新本进程的 `MonicaConfigurationProvider` 投影。

## 接下来读什么

- [Configuration](./configuration.md)
- [Concepts](./concepts.md)
- [Guide and Stores](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
