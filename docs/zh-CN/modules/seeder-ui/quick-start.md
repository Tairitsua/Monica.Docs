---
title: Quick Start
description: 把 Development Seeder Dashboard 加入 Monica 共享运维 Shell。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.Framework.UI --prerelease
dotnet add package Monica.UI --prerelease
```

## 注册运行时与页面

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddSeeder();
    monica.AddUIShell();
    monica.AddSeederUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

以 Development 环境运行宿主并打开 `/seeders`。页面位于 Monitor 导航分类下，默认排在 Health Check 之后。

`AddSeederUI()` 会声明对 Seeder、Localization 与 Shell 的依赖。显式保留 `AddSeeder()` 可以让运行时策略在组合根中清晰可见，并把运行时就绪与页面暴露分开。
