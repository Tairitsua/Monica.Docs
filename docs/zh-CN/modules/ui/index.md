---
title: UI
description: 在统一、主题感知的 Shell 中托管 Monica 的 Blazor 运维页面。
sidebar_position: 1
---

`Monica.UI` 提供 Monica 运维页面共用的 Interactive Server Blazor Shell、MudBlazor 服务、导航 Registry、浏览器存储、主题、本地化与静态资源映射。

```bash
dotnet add package Monica.UI --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.UI.Theming;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.AppId = "orders";
        options.AppName = "Orders operations";
    });

    monica.AddUIShell(options =>
    {
        options.DefaultTheme = MonicaThemeKind.Default;
        options.DefaultDarkMode = false;
        options.ShowLanguageSwitcher = true;
    });

    monica.AddModuleSystemUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

后续访问会优先使用浏览器保存的主题与深色模式选择。Shell 默认显示语言切换器，顶部最多直接显示六个导航分类，其余分类进入“更多”，并提供导航搜索。

## 模块诊断工作台

`AddModuleSystemUI()` 在 `/module-system-dashboard` 增加只读工作台。概览、性能、模块、依赖与类型发现五个分区都基于同一份不可变 Core 诊断快照。程序集清单与有界模块 Option 只有在打开对应视图时才加载；可移植基线只在浏览器中比较，不会创建服务端历史。

工作台在 Development 环境自动可用。非 Development 环境只需配置一次 Shell 全局宿主授权策略：

```csharp
monica.AddUIShell(options =>
{
    options.OperationalPageAccess.AuthorizationPolicy = "SystemDiagnostics";
});

monica.AddModuleSystemUI();
```

宿主必须通过 ASP.NET Core Authorization 注册该策略。Module System、Health Check、Seeder 与受保护的 Provider Option 诊断都会继承它；页面可以通过 `AuthorizationPolicyOverride` 替换全局策略。有效策略缺失或用户未授权时，不会调用诊断 Facade，也不会显示受保护导航。安全 Option 披露、访问配置、程序集分析与基线比较见[诊断与运维页面](../../scenarios/diagnostics-and-ops.md)。

## Health Check 与 Seeder 运维页面

共享 Shell 还可以承载独立打包的只读运维页面：

| 页面 | Route | Package | 数据生命周期 |
|---|---|---|---|
| [Health Check UI](../health-check-ui/index.md) | `/health-checks` | `Monica.HealthCheck.UI` | 当前宿主新执行的脱敏快照。 |
| [Seeder UI](../seeder-ui/index.md) | `/seeders` | `Monica.Framework.UI` | 当前进程的一次性 Seeder 运行诊断。 |

两个页面都优先面向 Development，并在非 Development 环境继承 Shell 全局运维策略。它们的运行时模块保持独立：即使页面不可访问，也应在所有环境注册 Health Check 探针与 Seeder 就绪检查。统一组合与页面策略覆盖方式见[诊断与运维页面](../../scenarios/diagnostics-and-ops.md)。

各模块在启动时增量组成导航。每个本地化页面通过 `RegisterLocalizedPage<TPage,TResource>()` 声明自己的 Resource；Shell 只拥有 Monitor、Configuration 等少量共享分类。独立包通过 `RegisterLocalizedCategory<TResource>()` 注册稳定分类 ID 与本地化标签。Registry 按 ID 分组、按数字排序并在路由前冻结，因此切换语言不会改变分类身份或顺序。

`EnableDebug` 跟随构建配置：DEBUG Build 默认启用，其他构建默认禁用。它只控制 Blazor 与 SignalR 详细错误。

`OperationalPageAccess.DebugMode` 是独立的授权绕过。启用后，所有采用共享契约的运维功能都会在任意环境跳过策略评估，页面覆盖也会被忽略，同时 Monica 会记录启动 Warning。除非宿主已被刻意隔离且明确接受信息披露风险，否则不要在生产可达宿主上启用它。

`Monica.HealthCheck.UI`、`Monica.Framework.UI`、`Monica.Configuration.UI`、`Monica.Repository.UI`、`Monica.JobScheduler.UI` 与 `Monica.OpenTelemetry.UI` 等运维 UI 都是独立 Stable 包。只添加运维人员真正需要的页面，并用宿主认证、授权与网络策略保护 Shell。
