---
title: 注册与访问边界
description: 把 Health Check 页面组合进 Shell，并保护生产环境访问。
sidebar_position: 4
---

## 注册入口

| Method | What it adds | Dependencies |
|---|---|---|
| `monica.AddHealthCheckUI(...)` | `/health-checks`、本地化 Monitor 导航、页面 Session 与访问策略。 | Health Check 运行时、Localization、Shell UI。 |

UI 没有存储或远程监控 Provider。它读取当前进程的 `HealthCheckFacade`，且只展示其脱敏模型。

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
    monica.AddHealthCheck();
    monica.AddUIShell();
    monica.AddHealthCheckUI(options =>
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

该策略保护 Dashboard，而不是平台探针。仍应配置认证中间件、HTTPS、网络隔离和最小权限策略。即使凭据类数据已经脱敏，健康描述与有界错误消息仍可能暴露内部组件名。
