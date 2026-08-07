---
title: 包与品牌规范
description: 为第三方 Monica 包统一包 ID、模块键、元数据与兼容品牌表达。
sidebar_position: 2
---

第三方生态使用“发布者在前”的 ID，让 NuGet 所有权一目了然，并确保官方 `Monica.*` 命名空间保持清晰。公开包与兼容性规则仍是生态 v1；schema v2 是可以描述多个包与可选镜像的仓库清单格式。

## 仓库清单与发布身份

每个生成仓库都在根目录使用 `schemaVersion: 2` 的 `monica.manifest.json`：

- `repositoryId` 是发布者拥有的持久身份，并用于命名 `.slnx` 解决方案。
- `packages` 包含每个可打包项目。每个包在 `src/<PackageId>/<PackageId>.csproj` 只有一个项目，清单之外不存在可打包项目。
- `version` 由一次仓库发布内的所有 NuGet 包与配套 OCI Tag 共享。
- Publisher、NuGet 所有者、目标框架、Monica 版本、源码可见性、分发、发布目标、许可证、品牌、联系方式与安全策略都是仓库级决策。
- 当这些共享策略或发布版本需要不同时，拆分仓库。

NuGet 包仍使用 `monica-ecosystem-v1` 标签；`schemaVersion: 2` 不会改变包的兼容性身份。

## 包 ID

统一使用：

```text
<Publisher>.Monica.<Package>[.<Variant>]
```

示例：

| 用途 | 包 ID |
|---|---|
| 同一个包内提供核心与 UI 模块 | `Tairitsua.Monica.GachaPool` |
| RabbitMQ Provider 包 | `Acme.Monica.EventBus.RabbitMQ` |
| 单独发布的 UI 包 | `Acme.Monica.Analytics.UI` |
| Provider-neutral OCR Contract | `Tairitsua.Monica.AI.OCR` |
| 独立发布的 OCR Provider | `Tairitsua.Monica.AI.OCR.PaddleOCR` |

上表只用于说明有效身份，不表示这些包已经发布。

具体规则：

- 第一个片段必须是作者或组织可控制、可持续使用的发布者标识。
- 仅使用以点分隔、兼容 C# 标识符的片段。Monica 生态规范比 NuGet 通用语法更严格，不使用连字符或下划线。
- 完整 ID 不超过 100 个字符。
- 显式设置 `PackageId`，并让项目名、程序集名与根命名空间保持一致。
- 第三方不得发布为 `Monica.*` 或 `Monica.Community.*`。
- 确定 ID 前先检查 NuGet.org。计划长期发布系列包的作者应考虑申请自己的发布者前缀保留。

可选的 `<Variant>` 表示需要独立版本或独立分发的另一个包。一个包内部包含多个模块，并不要求添加 Variant。

同一 schema-v2 仓库中的所有包 ID 使用相同的 Publisher 片段。`packages[].packageDependencies` 通过完整包 ID 列出仓库内依赖。开发阶段的项目引用必须与这些边一致，打包后的 Nuspec 依赖也必须一致。不得通过嵌入兄弟包程序集来逃避依赖声明。

## 模块键

包内每个模块都有独立且全局唯一的 `ModuleKey`：

- 模块键必须等于 `PackageId`，或以 `PackageId.` 开头。
- 如果包存在一个根模块，可以直接使用包 ID 作为其模块键。
- 其他模块在包 ID 后追加简洁的功能名。
- 第三方 UI 模块键必须以精确的 `.UI` 片段结尾。
- 在代码、README 与测试中保持同样的大小写。Monica 以不区分大小写的方式比较模块键，并拒绝不同模块类型之间的键冲突。

对于 `Tairitsua.Monica.GachaPool`，以下键都有效：

```csharp
[ModuleKey("Tairitsua.Monica.GachaPool")]
public sealed class ModuleGachaPool(ModuleGachaPoolOption option)
    : ModuleBase<ModuleGachaPool, ModuleGachaPoolOption, ModuleGachaPoolGuide>(option)
{
}

[ModuleKey("Tairitsua.Monica.GachaPool.UI")]
public sealed class ModuleGachaPoolUI(ModuleGachaPoolUIOption option)
    : ModuleBase<ModuleGachaPoolUI, ModuleGachaPoolUIOption, ModuleGachaPoolUIGuide>(option)
{
}
```

`Contoso.Monica.OtherFeature` 不属于这个包的身份边界，因此不能在该包中使用。

`modules[].dependsOn` 通过完整模块键列出运行时依赖。每个跨包模块依赖都要求归属包声明对应包依赖。Provider 模块要设置 `kind: provider`、实现 `IModuleProvider`，并通过 `providerFor` 命名所提供的能力；同一目标键必须出现在 `dependsOn` 中。包图与模块图都必须无环。

## 注册命名

每个公开模块都有自己的标准注册面：

| 组成 | 命名方式 | 示例 |
|---|---|---|
| Module | `Module{Name}` | `ModuleGachaPool` |
| Option | `Module{Name}Option` | `ModuleGachaPoolOption` |
| Guide | `Module{Name}Guide` | `ModuleGachaPoolGuide` |
| Builder 入口 | `monica.Add{Name}()` | `monica.AddGachaPool()` |
| UI Builder 入口 | `monica.Add{Name}UI()` | `monica.AddGachaPoolUI()` |

第三方 Module、Guide、Option 与 Builder 扩展统一放在包自有的 `<PackageId>.Modules` 命名空间。消费者通过 `using Acme.Monica.Analytics.Modules` 引入对应发布者的注册入口。`Monica.Modules` 仅供 Monica 官方模块使用；否则两个独立发布者采用相同模块名时会生成完全相同的 CLR 类型名。

第三方 UI 路由只从包族派生，不携带所有权前缀。先移除开头的 `<Publisher>.Monica.`，再移除仅用于独立分发的末尾 `.UI`，最后把剩余 PascalCase 片段转换为小写 kebab-case。例如，`Tairitsua.Monica.GachaPool` 使用 `/gacha-pool`，`Acme.Monica.Analytics.UI` 使用 `/analytics`；其他页面可以使用 `/gacha-pool-history` 之类的扩展路径。

包 ID 由发布者隔离，但路由仍共享宿主的全局命名空间。Monica 会在注册阶段拒绝重复的规范化路由，因此需要共存的包必须使用不同的包族，或使用不同的包族子路由。不要把包族路由缩短为与包身份无关的 `/dashboard`、`/settings` 等通用路径。

## 导航身份与本地化

导航分类身份、翻译后的显示文本和公开路由是三个独立契约。每个 UI 模块都应遵循以下规则：

- 从 UI `ModuleKey` 中只移除末尾 `.UI`，得到稳定分类 ID。因此 `Tairitsua.Monica.GachaPool.UI` 的分类 ID 是 `Tairitsua.Monica.GachaPool`，公开路由仍为 `/gacha-pool`。
- 使用 `RegisterLocalizedCategory<TResource>()` 只注册一次包自有分类文本。返回的 ID 才是分组键，翻译文本只负责显示。
- 每个页面都使用 `RegisterLocalizedPage<TPage, TResource>()`。页面标题与包自有分类键属于模块自己的资源，并且该资源必须通过 `AddResource<TResource>()` 注册。
- 分类与页面都显式设置数值顺序；Monica 不会按翻译文本排序或分组。

```csharp
DependsOnModule<ModuleLocalizationGuide>().Register()
    .AddResource<GachaPoolResource>();

DependsOnModule<ModuleShellUIGuide>().Register()
    .RegisterUIComponents(registry =>
    {
        var categoryId = registry.RegisterLocalizedCategory<GachaPoolResource>(
            "Tairitsua.Monica.GachaPool",
            "Navigation:Category",
            order: 450);

        registry.RegisterLocalizedPage<UIGachaPoolPage, GachaPoolResource>(
            UIGachaPoolPage.PAGE_URL,
            "Navigation:Title",
            Icons.Material.Filled.AutoAwesome,
            categoryId,
            addToNav: true,
            navOrder: 42);
    });
```

一个 NuGet 包可以包含多个 UI 模块。每个模块都用自身 UI 模块键移除 `.UI` 后的值作为分类 ID，因此 `Acme.Monica.Toolkit.Audit.UI` 与 `Acme.Monica.Toolkit.Admin.UI` 可以保留不同分类，而不必拆成多个包。所有贡献都在启动阶段完成；Shell 会在路由读取前冻结并验证注册表。

## 必需的包元数据

每个版本至少声明：

- `PackageId`、`PackageVersion`、`Authors`、`Description` 与版权信息
- 存在仓库时声明 `PackageProjectUrl`、`RepositoryUrl` 与 `RepositoryType`
- `PackageReadmeFile`，并把 README 嵌入包中
- `PackageIcon`，并嵌入 128×128 透明背景 PNG
- `PackageTags`，其中包含 `monica`、`monica-module` 与 `monica-ecosystem-v1`
- `PackageLicenseExpression` 或 `PackageLicenseFile`，且只能选择一个
- 每个版本的发布说明

当源码对消费者可用时，应提供 Source Link 与 `.snupkg` 符号包。更多规则见 NuGet 官方的[包创作最佳实践](https://learn.microsoft.com/nuget/create-packages/package-authoring-best-practices)。

## 配套 OCI 身份

拥有 Provider 模块的 Provider Connector 包可以通过 `ociImages[].companionPackageId` 命名一个独立运行的镜像仓库。CPU 与 NVIDIA 变体是该单一 Registry 仓库下的目标，不是两个独立产品身份。不可变 Tag 使用 `<manifest-version>-<tag-suffix>`，例如：

```text
ghcr.io/tairitsua/monica-ai-ocr-paddleocr:0.1.0-alpha.1-cpu-amd64
ghcr.io/tairitsua/monica-ai-ocr-paddleocr:0.1.0-alpha.1-nvidia-cu126-amd64
```

这些名称只用于说明，不代表镜像已发布。运行时镜像必须携带 OCI 版本、源与修订 Label，以及 Monica Companion Package 和 Accelerator Label。Connector README 必须说明所有支持的镜像 Tag、端口/协议、Health Endpoint、必需 Volume、模型/依赖来源、CPU/GPU 前置条件、数据处理行为，以及 GPU 失败时是否允许回退到 CPU。只有每个镜像都声明 Provider 专用 CPU 与适用的 NVIDIA 发布门禁（包括受管 Self-hosted GPU Runner）后，自动发布才会启用。

## 官方标识与兼容标识

紫色 `#512BD4` Monica 包标识与 `Monica.*` 前缀用于识别官方包。第三方不得使用紫色资源、自行制作其他改色或几何变体，也不得把它作为自己的包图标。下方标准绿色兼容标识是唯一允许独立包使用的 Monica 同轮廓配色版本。

独立发布者可以选择：

- 使用自己的图标；或
- 使用 Skill 提供的 `monica-compatibility-mark.svg` 与 `monica-compatibility-mark.png`。

兼容标识保留 Monica 轮廓，并固定使用绿色 `#10B981`。该固定配色用于区分“由发布者自行声明兼容”的生态包与紫色官方身份。NuGet 包中嵌入 PNG，仓库文档中可使用 SVG；两份标准资源都必须保持不变。

![Monica 兼容标识](../../shared/attachments/monica-compatibility-mark.svg)

第一次使用该标识时，在附近加入以下声明：

> Monica compatibility is self-attested by the publisher. This community package is independently maintained and is not affiliated with, endorsed by, or supported by the Monica project.

同一页面和 NuGet 元数据中还必须标出独立发布者。

v1 的兼容性由发布者自行声明。该标识不代表 Monica 已完成安全审查、质量审核、支持承诺，也不授予超出公开品牌规则的商标许可。

## 开源徽章

开源状态与 Monica 兼容性相互独立，也不会改变包 ID。当包使用 NuGet 接受的开源 `PackageLicenseExpression` 时，发布者可以在 README 中使用生态提供的开源徽章。自定义、Source-available 或专有许可证不能使用该徽章，应改用 `PackageLicenseFile` 并直接说明条款。

![Monica 开源徽章](../../shared/attachments/monica-open-source-badge.svg)

## 面向消费者的披露

包 README 必须列出：

- 独立发布者与支持渠道
- 支持的 Monica 版本与目标框架
- 每个模块及其注册方法
- 模块是否增加端点、中间件、Hosted Service、静态 Web 资产、持久化或外部网络访问
- 许可证与分发条款
- 兼容性自我声明
- 适用时列出每个配套 OCI 仓库与不可变目标 Tag 规则
- 哪些检查用于证明 CPU Service 行为与真实 NVIDIA 推理
