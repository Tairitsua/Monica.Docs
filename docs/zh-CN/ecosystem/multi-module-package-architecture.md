---
title: 多模块包架构
description: 在一个 NuGet 包内组织任意数量、彼此内聚的基础设施、Provider、Web 与 UI 模块。
sidebar_position: 3
---

# 多模块包架构

一个 NuGet 包可以包含任意数量、彼此内聚的 Monica 模块。包边界表达版本与分发方式，模块边界表达可以独立注册的能力。不要为了强制“一包一模块”而拆散本来应该共同发布的库。

## 示例包

下面的包把 Analytics、Alerts 与轻量 UI 一起发布：

```text
src/Acme.Monica.Analytics/
├── Modules/
│   ├── ModuleAnalytics.cs
│   ├── ModuleAlerts.cs
│   └── ModuleAnalyticsUI.cs
├── Analytics/
│   ├── Abstractions/
│   ├── Models/
│   ├── Facades/
│   ├── Services/
│   └── Providers/
├── Alerts/
│   ├── Abstractions/
│   ├── Models/
│   ├── Facades/
│   └── Services/
├── Pages/
├── UIAnalytics/
│   ├── Components/
│   ├── State/
│   └── Support/
├── Localization/
├── wwwroot/
└── Acme.Monica.Analytics.csproj
```

包内模块仍然拥有独立身份：

| 模块 | 模块键 | 注册入口 |
|---|---|---|
| Analytics | `Acme.Monica.Analytics` | `monica.AddAnalytics()` |
| Alerts | `Acme.Monica.Analytics.Alerts` | `monica.AddAlerts()` |
| Analytics UI | `Acme.Monica.Analytics.UI` | `monica.AddAnalyticsUI()` |

消费者只安装一个包，再按宿主需求注册其中部分或全部模块。

## Feature-first 组织方式

小型包先使用简单的项目级分层。当真正的子领域逐渐形成后，再增加 `Analytics/`、`Alerts/` 之类的根功能目录，并在每个功能中使用标准层。Module 注册文件集中放在 `Modules/`，只包含注册、Option、Guide 与依赖声明，不承载业务逻辑。

按需选择层，不创建空目录：

- `Abstractions/`、`Models/`、`Events/` 与刻意公开的 `Extensions/` 构成跨模块公开契约。
- `Facades/` 通过 `Res` 或 `Res<T>` 暴露宿主与 UI 用例。
- `Services/` 使用普通 .NET 返回值与异常实现内部流程。
- `Providers/` 隔离外部系统和厂商 SDK。
- `Annotations/` 保存面向开发者的特性。
- `Metrics/` 保存遥测契约与实现。
- `Utils/` 保存纯内部工具。

一个功能不得调用另一个功能的内部 Service。需要协作时依赖对方公开的 Abstraction 与 Model；当注册顺序和可用性属于契约时，再声明 Monica 模块依赖。

## 每个模块都有独立契约

即使多个模块位于同一程序集，每个模块仍然需要：

- 唯一且归属于当前包的 `ModuleKey`
- 自己的 `Module{Name}`、`Module{Name}Option` 与 `Module{Name}Guide`
- 自己的 `monica.Add{Name}()` 入口
- 位于 `<PackageId>.Modules` 下的包自有注册类型
- 通过模块图显式声明的依赖
- 聚焦当前模块的宿主组合测试
- 在 README 表格中说明注册方法、副作用与依赖

不要用一个 Catch-all 模块悄悄开启互不相关的能力。

## 混合 UI 包

当 UI 较轻、与基础设施能力使用同一发布周期时，可以在一个 Razor SDK 项目中同时提供基础设施模块与 UI 模块，但仍需保持边界：

- 基础设施模块拥有 Abstraction、Model、Service、Provider 与 Facade。
- UI 组件注入公开 Facade，不直接访问 `Services/` 或 `Providers/`。
- UI 模块使用自己以 `.UI` 结尾的模块键和独立 `Add{Name}UI()` 注册方法。
- UI 路由位于移除 `<Publisher>.Monica.` 后的包族路径下，例如 `/analytics`；Monica 会在共享的宿主路由空间中拒绝重复路由。
- 每个 UI 模块都从自身模块键中移除末尾 `.UI`，得到稳定的导航分类 ID。一个包内的多个 UI 模块因此可以贡献不同分类，而不必拆分 NuGet 包。
- 每个页面使用 `RegisterLocalizedPage<TPage, TResource>()`；包自有分类使用 `RegisterLocalizedCategory<TResource>()`。标题与分类显示键保留在归属资源中，并通过 `AddResource<TResource>()` 注册该资源。
- UI 模块通常继承 `ModuleBase`；只有真正配置中间件或端点时才使用 `WebModuleBase`。
- 路由页保持轻量，把可复用展示、状态与格式化逻辑放入 `UI{Name}/Components`、`State` 和 `Support`。
- 本地化资源统一位于项目级 `Localization/`，静态资源位于 `wwwroot/`。

当 UI 需要独立版本、会给非 UI 消费者引入大量依赖，或需要单独分发时，再拆为 `<Publisher>.Monica.<Package>.UI` 包。

## 什么时候拆包

只有边界真实存在时才拆包，例如：

- 功能需要独立版本或发布节奏。
- 未使用某功能的消费者不应收到大型 Provider SDK 或静态资源。
- 许可证或分发条款不同。
- 某个 Provider 集成应保持可选。
- 所有权与支持责任不同。

不要仅仅因为模块数量大于一个就拆包。
