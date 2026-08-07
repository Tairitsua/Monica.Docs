---
title: Quick Start
description: 安装并注册 Configuration，声明第一个可管理的 Options 类型，并理解 seed、source chain 和运行期修改。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.Configuration
```

如果要使用 EF Core DB store：

```bash
dotnet add package Monica.Configuration.EfCore
```

如果要启用内置操作台：

```bash
dotnet add package Monica.Configuration.UI
```

## 最小注册

```csharp
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;
using Monica.Configuration.Annotations;
using Monica.Configuration.Models;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddConfiguration()
        .UseFileConfigurationStore();
    monica.AddConfigurationUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

[Configuration(
    "Demo:App",
    DefinitionKey = "demo.app",
    DisplayName = "Demo App",
    Description = "演示 Monica.Configuration 的最小配置类。",
    Category = "Demo")]
public sealed class DemoAppOptions
{
    [Required]
    [OptionSetting("App Name")]
    public string AppName { get; set; } = "Demo";

    [Range(1, 200)]
    [OptionSetting("Page Size", Description = "默认分页大小。")]
    public int PageSize { get; set; } = 20;

    [OptionSetting("API Key", IsSensitive = true)]
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

`monica.AddConfiguration()` 会在 Monica 扫描业务类型时找到 `[Configuration]` 类型，生成 schema，并注册对应的 Options 绑定。运行期消费配置时仍然使用 Microsoft Options Pattern。

`UseFileConfigurationStore()` 是单体和本地模式的最小 store preset。第一次启动时，Monica 会为每个 `DefinitionKey` 创建一份 effective JSON document：优先从宿主当前 `IConfiguration` 的 section seed，缺失时回退到 CLR 默认值。

## 用宿主配置做首次 seed

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

`[Configuration("Demo:App")]` 决定 seed 的 Microsoft `IConfiguration` section。初始化完成后，Monica 的常规运行期修改会写入 active store bundle 中的 effective JSON document，不会自动回写原始 `appsettings.json`。

## 注册一个可管理 JSON 覆盖文件

当某些值必须继续由 JSON 文件管理时，可以把文件注册成 Monica 可识别的 runtime source：

```csharp
builder.AddMonica(monica =>
{
    monica.AddConfiguration()
        .UseFileConfigurationStore()
        .AddManagedJsonFile(
            "operator-settings.json",
            optional: true,
            reloadOnChange: true,
            options =>
            {
                options.DisplayName = "Operator Settings";
                options.Description = "现场交付时允许操作员维护的 JSON 文件。";
                options.IsWritable = true;
            });
});
```

这个文件会追加在 Monica effective provider 之后。也就是说，如果 `operator-settings.json` 提供了 `Demo:App:AppName`，运行时真正绑定到 `IOptions<DemoAppOptions>` 的值会来自这个 JSON 文件。UI 会在 source chain 中标记它是当前生效来源；如果它可写，用户修改该配置项时会写回这个 JSON 文件并记录历史。

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
            Value = ConfigurationStoredValue.FromJson("\"New Name\""),
            ExpectedSchemaVersion = 1
        });

        if (result.IsFailed(out var error, out _))
        {
            throw new InvalidOperationException(error.Message);
        }
    }
}
```

修改成功后，Monica 会 patch 对应 `DefinitionKey` 的 effective JSON document，写入 history，刷新本进程的 `MonicaConfigurationProvider` 投影。如果运行时当前生效来源是可写外部 JSON provider，则 UI 会改走 source-targeted mutation，并把目标 provider、文件路径和 source revision 写进 history。

## 接下来读什么

- [Configuration](./configuration.md)
- [Concepts](./concepts.md)
- [注册扩展与 Store](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
