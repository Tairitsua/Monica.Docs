---
title: 诊断与运维页面
description: 组合模块诊断、当前宿主健康与 Seeder 运行证据，并明确访问边界。
sidebar_position: 2
---

Monica 会把运维证据与展示层分开。Health Check 与 Seeder 运行时应在所有环境注册；交互页面优先面向 Development，共享一个 Shell 级授权边界，并允许页面单独覆盖。

## 组合运行时证据与页面

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    // 运行时契约：不要放入仅 Development/Aspire 执行的条件中。
    monica.AddHealthCheck();
    monica.AddSeeder();

    // 展示契约：只在运维人员应访问的宿主中暴露。
    monica.AddUIShell();
    monica.AddModuleSystemUI();
    monica.AddHealthCheckUI();
    monica.AddSeederUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

三个页面都只读，并且在 Development 中默认可用：

| 页面 | Route | 证据 | 刷新行为 |
|---|---|---|---|
| Module System | `/module-system-dashboard` | 不可变组合、拓扑、发现、耗时与有界 Option。 | 组合进行中每秒刷新，完成后停止。 |
| Health Check | `/health-checks` | 当前宿主新执行的脱敏健康快照。 | 每 10 秒刷新，并支持手动刷新。 |
| Seeder | `/seeders` | 当前进程的一次性依赖图、策略、耗时、尝试与失败。 | Waiting、Running 或 Aborting 时每秒刷新，之后停止。 |

平台探针 `/health` 与 `/alive` 是独立的匿名运行时端点。关闭或保护 Health Check 页面不会移除或保护这些探针。

## Health Check 运维

`AddHealthCheck()` 会在所有 Web 环境映射就绪与存活端点。应用检查应通过 `AddMonicaReadinessCheck<T>()` 或 `AddMonicaLivenessCheck<T>()` 注册；不要让生产就绪依赖仅 Development 调用的 `AddServiceDefaults()`。Dashboard 展示就绪、聚合计数、搜索、状态/标签筛选、耗时、有界 Data 与有界错误。它只表示承载当前 Blazor Circuit 的宿主，不会创建持久历史。

探针语义与页面行为见[可观测性与诊断 Skill](/zh-CN/skills/monica-infra-observability)。

## Seeder 运维

`AddSeeder()` 会发现并校验依赖图，在 `ApplicationStarted` 后启动，并把 `monica.seeder` 加入就绪检查。独立节点默认并发。`ContinueAndRecord` 只阻塞失败依赖链并保留独立工作；`FailFast` 在 Retry 用尽后激活，取消并等待本轮运行，让宿主继续存活但就绪状态保持 Unhealthy。

Dashboard 展示有效模块配置、运行进度、策略来源、依赖、尝试历史和有界失败证据。页面刻意只读，数据也只属于当前进程。

调度策略与页面契约见[作业与种子数据 Skill](/zh-CN/skills/monica-infra-jobs)。

## Module System 工作台

`AddModuleSystemUI()` 会通过模块图依赖 Core 诊断、Localization 与共享 UI Shell。它观察不可变诊断快照，不能在运行时启用、禁用或重新配置模块。

## 五个分区

当前分区与选中模块会写入路径和 `module` 查询参数，可以直接分享深链接。

| 分区 | URL | 适用问题 |
|---|---|---|
| 概览 | `/module-system-dashboard` | 组合结果、准确 KPI、Finding、热点与可选择的关键路径。 |
| 性能 | `/module-system-dashboard/performance` | 可交互瀑布图、阻塞链、启动工作、主要贡献者与五个类型发现阶段。 |
| 模块 | `/module-system-dashboard/modules` | 可搜索、可筛选的模块目录、成本进度条、依赖、受限 Option 与错误。 |
| 依赖 | `/module-system-dashboard/dependencies` | 选中模块邻域或显式全宿主图，并提供表格替代视图。 |
| 类型发现 | `/module-system-dashboard/discovery` | 查询 Contribution、扫描策略、失败/部分加载与延迟程序集清单。 |

组合尚未进入最终状态时，页面每秒刷新一次；快照 Final 后立即停止。刷新期间保留旧数据，较早请求的迟到结果不会覆盖新状态。

## 正确理解性能

工作台报告测量事实，不提供任意的效率分或健康分。结构结果只有 `Succeeded`、`Degraded` 与 `Failed`。只有宿主显式配置了对应 `ModuleStartupPerformanceBudgets`，超过预算才会出现性能 Warning。

瀑布图会区分系统阶段、串行生命周期回调、注册 Contribution、类型发现 Commit、启动工作执行、排队与 Barrier 等待。选择关键路径 Ribbon 或时间区间时，时间线证据与模块上下文会同步。贡献者列表默认显示耗时至少 1 ms 的前 10 项并隐藏零耗时记录，用户可以取消这些限制。

## 依赖关系图

图中只使用编译模块图的直接依赖边。依赖深度表示最长依赖路径，而不是宽度或任意层级。默认邻域保留选中模块、它的直接依赖与直接依赖方；需要完整拓扑时可显式切换到全宿主总览。键盘操作或受限布局可以使用表格视图。

## 程序集与类型发现分析

打开“类型发现”后才会延迟加载程序集清单。解析失败与部分类型加载优先显示；其余清单支持搜索、分页、默认折叠，并使用自己的局部滚动容器。Outcome 会明确区分已扫描、已排除、解析失败、部分类型加载与已解析但未扫描，不会再用推测的“缺少运行时 DLL”数量代替事实。

阶段汇总分别展示：

1. 计划声明；
2. 程序集解析；
3. 类型枚举；
4. 去重查询计算；
5. 注册 Commit。

因此类型发现 Commit 或启动工作 Commit 不会看起来像第二次编译。

## Option 目录与敏感调试

只有打开模块抽屉的“配置”区时才加载模块 Option。每个公开、非索引属性都会显示名称与干净类型，避免因为值未投影而让研发人员误以为模块只定义了少量配置。值与嵌套遍历都有边界；不支持的值或失败 Getter 仍作为元数据保留。

普通值默认可见。由 `[ModuleOptionDiagnosticsSensitive]`、宿主 `MarkSensitive(...)` 规则或内置凭据分类识别的敏感属性只显示存在性。

专用本地调试可以显示有界敏感标量：

```csharp
using Monica.Core.Modularity.Diagnostics.Models;

builder.AddMonica(monica =>
{
    monica.ConfigureModuleSystem(options =>
    {
        options.OptionDiagnosticsExposureMode =
            ModuleOptionDiagnosticsExposureMode.RevealSensitive;
    });

    monica.AddModuleSystemUI();
});
```

非 Development 环境会拒绝 `RevealSensitive`。实时页面可能显示凭据、Token、连接字符串或私有端点，因此不要分享截图或录屏。任何模式下的可移植导出都不会包含 Option 诊断。

## 基线比较

导出会创建脱敏、客户端自有的 JSON 基线。导入相同 Schema Version 的基线后，时间线会增加 Overlay，并展示耗时差值、模块变化与直接依赖边变化。Schema 不同或结构无效的文件会以本地化错误拒绝；服务端不会保存任何历史。

导出会省略：

- Option 诊断与已显示敏感值；
- 程序集路径；
- Stack Trace；
- 原始异常细节。

## 生产环境访问

非 Development 环境中，受保护运维功能只有在能够评估有效的命名宿主策略时才会放行，否则 Fail Closed。公共策略只需在 Shell 配置一次：

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SystemDiagnostics", policy =>
        policy.RequireRole("Operations"));
});

builder.AddMonica(monica =>
{
    monica.AddUIShell(options =>
    {
        options.OperationalPageAccess.AuthorizationPolicy = "SystemDiagnostics";
    });
    monica.AddModuleSystemUI();
    monica.AddHealthCheckUI();
    monica.AddSeederUI();
});
```

Module System、Health Check、Seeder 与受保护的 Provider Option 诊断都会继承 Shell 策略。只有某个页面需要不同策略时才在对应模块 Option 设置 `AuthorizationPolicyOverride`；空白覆盖仍继承全局值。

对于明确隔离的诊断宿主，也可以让 Shell 绕过授权：

```csharp
monica.AddUIShell(options =>
{
    options.OperationalPageAccess.DebugMode = true;
});
```

Debug 模式在所有环境都优先于全局策略和页面覆盖，并且 Monica 会记录启动 Warning。它与控制 Blazor、SignalR 详细错误的 `ModuleShellUIOption.EnableDebug` 相互独立。除非宿主已被刻意隔离且明确接受信息披露风险，否则不要在生产可达宿主上启用授权绕过。

每个页面仍会在 Facade 边界前重新检查访问权限。Debug 模式关闭时，策略缺失、授权服务缺失、策略未注册、评估异常或当前用户未通过都会隐藏受保护导航，也不会请求诊断。仍应配合认证、HTTPS、网络隔离与最小权限授权；即使凭据类 Value 与 Stack Trace 不会暴露，拓扑、组件名、耗时和有界错误仍属于敏感运维信息。

需要编程访问时，继续阅读[核心组合诊断](/zh-CN/skills/monica-infra-hosting)、[Health Check 诊断](/zh-CN/skills/monica-infra-observability)与 [Seeder 诊断](/zh-CN/skills/monica-infra-jobs)。
