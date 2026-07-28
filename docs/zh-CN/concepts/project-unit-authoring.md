---
title: 项目单元编写
description: 使用类型化角色、明确上下文和需求追踪关系建立可由 Agent 理解的架构目录。
sidebar_position: 5
---

# 项目单元编写

ProjectUnit 是 Monica 对应用架构的类型化表达。开发者、编码 Agent 和运行中的宿主可以据此理解每个类型承担什么职责、由谁负责，以及它源自哪些需求。

## 架构角色

- `ApplicationService` 与 `RequestDto` 定义用例边界。
- `DomainService`、`Entity` 与 `Repository` 承载领域行为和持久化边界。
- `DomainEvent`、`DomainEventHandler` 与 `LocalEventHandler` 表达协作和副作用。
- `Configuration` 表达由宿主管理的配置。
- `RecurringJob` 与 `TriggeredJob` 表达后台入口。

ProjectUnit 不会替代良好的领域建模。状态约束仍应留在状态拥有者上，服务只负责边界和编排。

## 架构角色不等于拦截边界

ProjectUnit 角色描述架构职责，不会自动包装该类型的每一次方法调用。运行时执行边界由子系统适配器建立，例如 Mediator 请求、EventBus 处理器、直接 MVC Action、作业、Seeder 与 Hosted work item。`DomainService` 通常在调用方已经建立的边界内运行。

子系统需要共享行为链时使用 [Execution Pipeline](../modules/execution-pipeline/index.md)。只有选定的服务方法缺少原生适配器时，才考虑另外启用可选的 [DynamicProxy 模块](../modules/dynamic-proxy/index.md)。

## 明确声明 Agent 上下文

每个被发现的类或记录都应声明自己的元数据。该注解不会被继承，因为基类无法准确描述每个派生单元的具体职责。

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

`ProjectUnitRequirementAttribute` 可以重复使用。Monica 会裁剪需求 ID，并按不区分大小写的方式去重，但不会限制业务项目自己的 ID 格式。注解里应保存稳定 ID，不要保存文档路径或 URL。

明确填写但格式错误的注解会产生目录告警；缺少注解只会成为可见的接入债务，不会阻止宿主启动。

## 相互独立的覆盖率

状态面板会对当前宿主发现的全部 ProjectUnit 分别计算四项指标：

| 指标 | 满足条件 |
|---|---|
| 元数据 | 单元直接声明了 `ProjectUnitMetadataAttribute`。 |
| 描述 | 元数据提供描述，或 XML 文档提供类型摘要。 |
| 负责人 | 元数据提供非空负责人。 |
| 需求 | 单元至少声明一个有效的需求注解。 |

四项指标彼此独立，分母都是当前宿主发现的全部单元。Monica 不会把它们合成为加权成熟度分数。空目录显示“无数据”，不会显示 100%。

## 宿主范围内的类型化目录

内部发现过程可以使用反射，但 Facade 和 HTTP 边界只暴露可序列化模型：

- `ProjectUnitSummary`
- `ProjectUnitDetail`
- `ProjectUnitDashboardSnapshot`
- `ProjectUnitCoverageMetric`
- `ProjectUnitTypeStatistics`
- `ProjectUnitRequirementReference`
- `ProjectUnitServiceIdentity`

目录只属于当前 Monica 宿主。跨服务聚合应由网关或平台层负责。

## 需求跳转

应用可以实现 `IProjectUnitRequirementLinkResolver`，并通过 `UseRequirementLinkResolver<TResolver>()` 注册。只有加载详情时才会解析链接。无法解析的 ID 仍会显示，但不可点击；单个解析失败不会导致整个目录不可用。

注册、接口、状态面板和解析器示例见 [ProjectUnits 模块](../modules/project-units/index.md)。

## 测试边界

只有依赖明确的纯协作测试适合使用 `ProjectUnitFixture<TUnit>`。依赖发现、约定注册、执行管线行为、代理、Options、持久化或宿主生命周期的行为，应通过完整的宿主场景验证。

[选择正确的测试边界](../guides/testing-monica-applications.md)。
