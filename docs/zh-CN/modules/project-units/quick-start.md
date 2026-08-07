---
title: 快速开始
description: 注册 ProjectUnits、为单元添加注解，并查看类型化状态面板和接口。
sidebar_position: 2
---

## 安装

```bash
dotnet add package Monica.ProjectUnits --prerelease
dotnet add package Monica.Framework.UI --prerelease
```

如果宿主只需要 API 或 Facade，可以不安装 UI 包。

## 注册模块

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.ProjectUnits.Models;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddProjectUnits(options =>
    {
        options.ConventionOptions.EnableNameConvention = true;
        options.ConventionOptions.NameConventionMode = ENameConventionMode.Warning;
    });

    monica.AddProjectUnitsUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

## 为每个发现单元添加注解

```csharp
using Monica.ProjectUnits.Annotations;

[ProjectUnitMetadata(
    "审核订单",
    Owner = "订单团队",
    Description = "审核满足条件的订单。",
    Tags = ["ordering", "approval"])]
[ProjectUnitRequirement("ORD-REQ-001")]
public sealed class CommandHandlerApproveOrder(
    DomainOrderApproval domainService)
    : ApplicationService<CommandApproveOrder>
{
    public override async Task<Res> Handle(
        CommandApproveOrder request,
        CancellationToken cancellationToken)
    {
        await domainService.ApproveAsync(request.OrderId, cancellationToken);
        return Res.Ok();
    }
}
```

同一功能涉及的请求、领域服务、实体、仓储实现、事件、处理器、作业和配置也要分别声明自己的元数据。只有确实与该单元相关时，才复用相同需求 ID。

## 查看结果

打开 `/project-units`，第一个 Tab 就是“状态概览”。API 客户端可以调用：

```http
GET /framework/units/dashboard
GET /framework/units
GET /framework/units/Ordering.Application.CommandHandlerApproveOrder
```

空目录会显示“无数据”。非空目录会分别显示每种上下文缺口，使现有项目可以渐进接入而不阻止启动。
