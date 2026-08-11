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
    monica.AddUIShell(options =>
    {
        options.OperationalPageAccess.AuthorizationPolicy = "SystemDiagnostics";
    });
    monica.AddSeederUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Shell 策略会被 Module System、Health Check、Seeder 以及采用 Monica 运维访问契约的其他诊断功能继承。只有本页面需要不同策略时才配置覆盖：

```csharp
monica.AddSeederUI(options =>
{
    options.AuthorizationPolicyOverride = "SeederDiagnostics";
});
```

Shell 外围仍应使用认证、HTTPS、网络隔离与最小权限。即使 Stack Trace 留在日志中，有界异常消息与类型名仍可能披露内部实现细节。

对于刻意隔离的诊断宿主，`options.OperationalPageAccess.DebugMode = true` 会在所有环境绕过全局和页面策略。它与 `ModuleShellUIOption.EnableDebug` 不是同一功能；启用授权绕过时 Monica 会记录启动 Warning。
