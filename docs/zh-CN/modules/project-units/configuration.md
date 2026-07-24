---
title: 配置
description: 配置项目单元详情解析、命名诊断、请求过滤和 UI 页面。
sidebar_position: 3
---

# 配置

## `ModuleProjectUnitsOption`

| 属性 | 类型 | 默认值 | 作用 |
|---|---|---|---|
| `ConventionOptions` | `ProjectUnitNamingOptions` | `new()` | 定义全局及按类型划分的命名诊断。 |
| `EnableRequestFilter` | `bool` | `false` | 启用宿主本地的请求过滤中间件和管理接口。 |
| `ParseUnitDetails` | `bool` | `true` | 加载 XML 类型和方法摘要，并声明 XML Documentation 模块依赖。 |

`ParseUnitDetails` 可以通过类型 XML 摘要满足“描述覆盖率”，但不能满足明确元数据、负责人或需求覆盖率。

## 命名诊断

```csharp
using Monica.ProjectUnits.Models;

builder.AddMonica(monica =>
{
    monica.AddProjectUnits(options =>
    {
        options.ConventionOptions.EnableNameConvention = true;
        options.ConventionOptions.NameConventionMode = ENameConventionMode.Warning;
    });
});
```

现有服务接入时建议先使用 `Warning`。按单元类型配置的规则放在 `ConventionOptions.Dict` 中。缺少元数据属于覆盖缺口，而不是命名错误；明确填写但格式错误的元数据会显示为目录告警。

## UI 选项

`ModuleProjectUnitsUIOption.DisablePage` 默认为 `false`。当运维界面由其他应用承载、但当前宿主仍需要 ProjectUnits 目录时，可以设为 `true`。

发现结果在宿主启动后保持稳定，因此状态面板采用手动刷新。
