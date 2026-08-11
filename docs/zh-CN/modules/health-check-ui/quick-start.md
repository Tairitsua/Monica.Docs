---
title: Quick Start
description: 把 Development Health Check Dashboard 加入 Monica 共享 UI Shell。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.HealthCheck.UI --prerelease
dotnet add package Monica.UI --prerelease
```

## 注册运行时与页面

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddHealthCheck();
    monica.AddUIShell();
    monica.AddHealthCheckUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

以 Development 环境运行宿主并打开 `/health-checks`。页面位于 Monitor 导航分类下，探针端点仍独立存在于 `/health` 与 `/alive`。

`AddHealthCheckUI()` 会声明对 Health Check、Localization 与 Shell 的依赖；显式注册运行时与 Shell 可以让组合根更清楚，并为宿主配置各自 Option 提供明确位置。
