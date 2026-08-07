---
title: 模块诊断工作台
description: 安全查看启动因果、模块拓扑、类型发现与有界 Option 诊断。
sidebar_position: 2
---

`Monica.UI` 在 `/module-system-dashboard` 提供只读模块诊断工作台。它只消费不可变诊断快照，不会在运行时启用、禁用或重新配置模块。

## 注册工作台

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddUIShell();
    monica.AddModuleSystemUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`AddModuleSystemUI()` 会通过模块图硬依赖 Core 诊断模块、本地化模块与共享 UI Shell。在 Development 环境中，工作台自动可用。

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

非 Development 环境默认关闭。必须同时显式启用并提供非空的宿主授权策略：

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ModuleDiagnostics", policy =>
        policy.RequireRole("Operations"));
});

builder.AddMonica(monica =>
{
    monica.AddModuleSystemUI(options =>
    {
        options.EnableOutsideDevelopment = true;
        options.AuthorizationPolicy = "ModuleDiagnostics";
    });
});
```

策略缺失、无法解析或当前用户不满足策略时，导航入口会隐藏，页面也不会调用诊断 Facade。仍应配合认证、HTTPS、网络隔离与最小权限授权；即使敏感 Option 保持脱敏，工作台仍会披露内部拓扑与运行耗时。

需要编程访问与指标时，继续阅读[核心组合诊断](../modules/core-composition/index.md#不可变诊断-facade)。
