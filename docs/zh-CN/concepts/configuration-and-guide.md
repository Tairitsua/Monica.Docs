---
title: Option 与注册扩展
description: 在模块 Option、链式注册扩展、命名 Profile 与必需 Feature 之间做出清晰选择。
sidebar_position: 2
---

Monica 把启动阶段冻结的配置值，与会改变模块图或注册能力的动作分开表达。

## 用 `ModuleOptions<TModule>` 表达值

Option 属性应当公开、稳定、不依赖实现细节也能理解，并拥有写入文档的默认值。典型内容包括功能开关、限制、路由前缀、重试或批处理策略。

```csharp
public sealed class ModuleAnalyticsOption : ModuleOptions<ModuleAnalytics>
{
    public bool EnableDetailedMetrics { get; set; }

    public int BatchSize { get; set; } = 100;
}
```

通过模块 `Add*` 方法的回调配置 Option。Monica 先应用依赖与 Feature 拥有的默认 Contribution，再应用宿主拥有的 Contribution，并在各自区段内保留记录顺序。因此无论依赖以什么顺序被发现，宿主直接配置都能覆盖传递默认值。随后 Monica 定稿 Option，并在修改宿主 Builder 或 Service Collection 前调用 `ValidateOptions(...)`。

一个模块需要拥有多个 keyed provider 实例时，可用 `ConfigureProfile(name, ...)` 保存启动阶段冻结的命名 Option。Profile 是显式配置，不是可变运行时 Settings Bag。

## 用注册扩展表达能力

以下动作适合实现为 `ModuleRegistration<TModule,TOptions>` 上的 `Add*`、`Use*`、`Map*` 或 `Register*` 扩展：

- 包含或硬依赖另一个模块；
- 选择一种 Provider 实现；
- 记录 keyed service 标识；
- 贡献服务、中间件或端点；
- 满足必需 Feature；
- 使用不属于主 Option 的专用配置对象。

例如 `UseInMemoryMetadataRepository()`、`UseSchedulerScope("local-dev")`、`MapSignalRHub<THub>(...)` 与 `UseSetup<TSetup>()`。

注册扩展只在外层 `AddMonica(...)` 回调内有效。返回的 Registration 会随模块图一起封闭，不能保存后再修改。

## 必需 Feature

模块固有契约在 `Describe(...)` 中调用 `module.RequireFeature("feature-name")`。可选链式路径也可以调用 `registration.RequireFeature(...)`。具体 Provider 或能力扩展只有在记录了对应注册后，才调用 `SatisfyFeature(...)`。

校验与调用顺序无关：满足未声明的 Feature 是错误，声明后未满足同样是错误。这样必需 Provider 选择会清晰出现在组合根，而不会由框架静默决定默认实现。

## 跨模块 Option 读取

模块回调通过 `Option` 或 `context.Options` 读取自己的最终值。跨模块只能读取已声明关系：

- 通过 `GetOptions` 或 `context.Modules.Get` 读取直接硬依赖；
- 通过 `TryGetOptions` 或 `context.Modules.TryGet` 读取当前激活的可选顺序目标。

一个模块需要扩展另一个模块的运行时行为时，应优先使用 owner 定义的注册 API 或抽象。不要把其他模块的可变 Option 暴露成通用注册表。

## Option 诊断

诊断目录会按名称与干净类型展示每个公开 Option 属性。普通有界值可见，只有敏感值会脱敏。可以用 `[ModuleOptionDiagnosticsSensitive]` 标记属性；无法修改 Option 类型时，宿主可通过 `ConfigureModuleOptionDiagnostics(...).MarkSensitive(...)` 添加规则。

这种可见性只属于诊断边界，不会让最终 Option 重新变为可写，也不会把 Option 数据放进可移植导出。
