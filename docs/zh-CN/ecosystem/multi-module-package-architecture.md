---
title: 仓库、包与模块架构
description: 在一个仓库内组织内聚 NuGet 包、Monica 模块与可选 Provider Service 镜像。
sidebar_position: 3
---

# 仓库、包与模块架构

一个 schema-v2 仓库可以发布多个版本对齐的 NuGet 包，每个包又可以包含任意数量、彼此内聚的 Monica 模块。仓库边界表达共同所有权与发布策略；包边界表达安装与依赖选择；模块边界表达可独立注册的运行时能力。不要混淆这三种身份，也不要为强制“一包一模块”而拆散内聚能力。

## 显式维护两张依赖图

仓库清单描述两张完整的有向无环图：

- NuGet 图使用 `packages[].packageDependencies` 和完整包 ID。开发期的每条边都必须对应项目引用，打包后则对应 NuGet 依赖。
- Monica 图使用 `modules[].dependsOn` 和完整模块键，用于控制运行时组合与注册顺序。

每个跨包模块依赖都必须有对应包依赖，但反向不强制：一个包可以仅使用另一个包的公开类型，而不依赖其中每个模块。Provider 模块还要设置 `providerFor`，依赖对应目标模块键，并实现 `IModuleProvider`。

## 多包 OCR 示例

下方只是设计示例，不代表任何包或镜像已经发布：

```text
Tairitsua.Monica.AI.OCR/
├── monica.manifest.json
├── Tairitsua.Monica.AI.OCR.slnx
├── src/
│   ├── Tairitsua.Monica.AI.OCR/
│   ├── Tairitsua.Monica.AI.OCR.PaddleOCR/
│   └── Tairitsua.Monica.AI.OCR.UI/
├── tests/
│   ├── Test.Tairitsua.Monica.AI.OCR/
│   ├── Test.Tairitsua.Monica.AI.OCR.PaddleOCR/
│   └── Test.Tairitsua.Monica.AI.OCR.UI/
├── containers/paddleocr/
└── docker-bake.hcl
```

完整 NuGet 图：

| 包 | `packageDependencies` | 职责 |
|---|---|---|
| `Tairitsua.Monica.AI.OCR` | 无 | Provider-neutral OCR 抽象、结果、置信度与 Facade |
| `Tairitsua.Monica.AI.OCR.PaddleOCR` | `Tairitsua.Monica.AI.OCR` | HTTP Connector 与 PaddleOCR Provider 模块 |
| `Tairitsua.Monica.AI.OCR.UI` | `Tairitsua.Monica.AI.OCR` | 可选的本地化 OCR Workbench |

完整 Monica 运行时图：

| 模块键 | 类型 | `dependsOn` | `providerFor` |
|---|---|---|---|
| `Tairitsua.Monica.AI.OCR` | infrastructure | 无 | — |
| `Tairitsua.Monica.AI.OCR.PaddleOCR` | provider | `Tairitsua.Monica.AI.OCR` | `Tairitsua.Monica.AI.OCR` |
| `Tairitsua.Monica.AI.OCR.UI` | UI | `Tairitsua.Monica.AI.OCR` | — |

Provider 包与 UI 包不嵌入 Contract 程序集，它们的 Nuspec 在打包后依赖 Contract 包。所有项目都只能通过 `PackageReference` 和配置的 NuGet 源引用选定 Monica 版本，而且每个解析后的 `Monica.*` 引用都必须等于 Manifest `monicaVersion`。例如，面向 Monica `1.0.0-rc.6` 的仓库不得增加 `MonicaSourceRoot`、指向同级 Monica 源码的项目引用、不同的中央 Monica 版本，也不得使用伪装成该版本的本地重建包。

## 同一包内的多模块

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

## Provider Connector 与单一 OCI 仓库

当大型 Native Runtime、模型、CUDA 库与 Python 环境更适合进程隔离时，不要把它们塞进 NuGet。发布轻量 Provider Connector 包，并配套一个 OCI 镜像仓库：

```text
Tairitsua.Monica.AI.OCR.PaddleOCR       .NET Connector 包
ghcr.io/tairitsua/monica-ai-ocr-paddleocr
  :0.1.0-alpha.1-cpu-amd64
  :0.1.0-alpha.1-nvidia-cu126-amd64
```

上述引用只用于说明，不构成已发布声明。在 `monica.manifest.json` 中，镜像条目通过 `companionPackageId` 指向拥有 Provider 模块的 Connector 包；两种加速模式都是同一镜像仓库下的 Target。使用一个多阶段 Dockerfile DAG，让它们共享已锁定的 Base、Dependency、Application 与 Model Layer，再分叉为 CPU 和 NVIDIA Runtime Stage。两个变体对 Connector 暴露相同的版本化 API 与 Health Contract。

每个运行时镜像都必须以非 Root 用户运行，声明 Health Check，锁定 Base/Dependency/Model 输入，并包含 OCI 版本/源/修订以及 Monica Companion Package/Accelerator Label。除非 CPU Fallback 是显式产品行为，否则 NVIDIA 镜像在请求的 GPU Runtime 不可用时必须立即失败。

镜像构建成功不能证明 Provider 可用。必须验证规范化 Bake 图、检查已构建镜像配置、完成真实 CPU 推理，然后通过 `docker run --gpus ...` 运行 NVIDIA 目标并在 GPU 上完成真实 OCR 推理。仅运行 `nvidia-smi`、导入 CUDA 或请求 Health 接口都不能通过 GPU 门禁。

只有当仓库脚本能够证明上述行为时，才声明 `releaseGates.cpuSmokeCommand` 和适用的 `nvidiaSmokeCommand`。NVIDIA 门禁还声明一组共享的受管 Self-hosted Runner Label。只要任何镜像缺少完整门禁，Scaffold 就不会为这个对齐发布单元生成发布工作流；门禁完整时，所有本地镜像 Load/Inspect 与 Provider Smoke Command 都必须在 Registry 认证及任何 NuGet/OCI Push 前完成。

## 什么时候拆包

只有边界真实存在时才拆包，例如：

- 功能需要独立版本或发布节奏。
- 未使用某功能的消费者不应收到大型 Provider SDK 或静态资源。
- 许可证或分发条款不同。
- 某个 Provider 集成应保持可选。
- 所有权与支持责任不同。

不要仅仅因为模块数量大于一个就拆包。当包与镜像之间的版本、许可证、源码可见性、分发、发布目标、支持或安全策略不再对齐时，应拆分仓库本身。
