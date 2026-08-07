---
title: Guide 与需求解析器
description: 注册需求导航，同时保证未解析 ID 和架构目录仍然可见。
sidebar_position: 4
---

`AddProjectUnits()` 返回 `ModuleProjectUnitsGuide`。应用侧扩展点是 `UseRequirementLinkResolver<TResolver>()`。

## 实现解析器

```csharp
using Monica.ProjectUnits.Abstractions;
using Monica.ProjectUnits.Models;

public sealed class RequirementLinkResolver
    : IProjectUnitRequirementLinkResolver
{
    public ValueTask<ProjectUnitRequirementLink?> ResolveAsync(
        string requirementId,
        CancellationToken cancellationToken = default)
    {
        var href = $"/workflow/requirements/{Uri.EscapeDataString(requirementId)}";
        return ValueTask.FromResult<ProjectUnitRequirementLink?>(
            new ProjectUnitRequirementLink(requirementId, href));
    }
}
```

## 注册解析器

```csharp
builder.AddMonica(monica =>
{
    monica.AddProjectUnits()
        .UseRequirementLinkResolver<RequirementLinkResolver>();
});
```

解析器采用 Scoped 生命周期，并且只在 `GetProjectUnitDetailAsync(key)` 或 `GET /framework/units/{key}` 中执行。列表和状态查询不会解析链接。

未知 ID 应返回 `null`。Monica 会继续显示这些 ID，但不会提供点击跳转。解析异常会按单个引用隔离，不安全链接也会被丢弃，因此外部文档系统故障不会隐藏架构目录。

默认的空解析器不需要配置，并会让所有需求保持未解析状态。
