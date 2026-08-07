---
title: Quick Start
description: 安装并启用 Configuration UI，打开配置状态、历史和来源页面。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.Configuration.UI
```

## 最小注册

```csharp
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
```

`monica.AddConfigurationUI()` 会自动声明对 `monica.AddConfiguration()`、Localization、Diff Highlight 和 Shell UI 的依赖。核心配置模块仍然需要显式选择 file 或 DB store。

## 第一次打开页面

启动应用后打开：

```text
/configuration/state
```

如果项目中已经有带 `[Configuration]` 的 Options 类型，页面会展示配置定义列表、配置分组、当前运行时有效值和 source action。配置状态页可以暂存多个修改，并作为一个审计组保存。

配置来源页面位于：

```text
/configuration/storage
```

该页面显示当前 active store bundle、Microsoft provider order、每个 source 提供的配置项数量、当前生效数量、是否可写、是否 reloadOnChange，以及可查看的 JSON file content。

## 注册一个 UI 可识别的 JSON source

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
                options.Description = "现场维护的 JSON 覆盖文件。";
                options.IsWritable = true;
            });
    monica.AddConfigurationUI();
});
```

打开配置状态页后，如果某个配置项被 `operator-settings.json` 覆盖，行内会显示外部来源提示。点击来源按钮可以看到完整 source chain；如果该 JSON 文件可写，修改该配置项会写回文件并记录外部 source history。

## 接下来读什么

- [Configuration UI 配置](./configuration.md)
- [Configuration 核心模块](../configuration/index.md)
- [Configuration Store 与 Source](../configuration/guide-and-providers.md)
