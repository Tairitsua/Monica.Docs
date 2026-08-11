---
title: 注册与访问边界
description: 把 Seeder 页面与运行时组合，并保护生产诊断。
sidebar_position: 4
---

## 注册入口

| Method | What it adds | Dependencies |
|---|---|---|
| `monica.AddSeederUI(...)` | `/seeders`、本地化 Monitor 导航、页面 Session 与访问策略。 | Seeder 运行时、Localization、Shell UI。 |

UI 没有持久历史或执行 Provider。它读取当前进程的 `SeederFacade`。所有执行策略都属于 `monica.AddSeeder(...)` 与发现到的 Seeder Annotation。

## 保护非 Development 访问

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SystemDiagnostics", policy =>
        policy.RequireRole("Operations"));
});

builder.AddMonica(monica =>
{
    monica.AddSeeder();
    monica.AddUIShell();
    monica.AddSeederUI(options =>
    {
        options.EnableOutsideDevelopment = true;
        options.AuthorizationPolicy = "SystemDiagnostics";
    });
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Shell 外围仍应使用认证、HTTPS、网络隔离与最小权限。即使 Stack Trace 留在日志中，有界异常消息与类型名仍可能披露内部实现细节。
