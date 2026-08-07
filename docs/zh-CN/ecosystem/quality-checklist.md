---
title: 质量检查清单
description: 发布前验证模块行为、公开契约、包内容与发布准备情况。
sidebar_position: 5
---

Monica 兼容标识采用发布者自我声明。完成本清单是发布者对兼容声明负责的依据，并不构成 Monica 团队认证。要把每个适用项目用于完整 schema-v2 仓库发布，而不是只检查最容易的包或镜像。

## 仓库发布契约

- [ ] 根目录 `monica.manifest.json` 使用 `schemaVersion: 2`，且不包含不支持字段。
- [ ] `repositoryId`、`.slnx`、Publisher、联系方式、源码可见性、许可证、分发与发布目标描述同一个持久发布单元。
- [ ] 清单的 `packages[]` 条目与可打包 `src/<PackageId>/<PackageId>.csproj` 项目一一对应。
- [ ] 一个清单版本适用于所有 NuGet 包与所有 OCI `<version>-<tagSuffix>` Tag。
- [ ] 每个包使用相同 Publisher 片段与仓库级策略；真实的策略/版本差异已拆分仓库。

## 身份与包边界

- [ ] 显式设置 `PackageId`，并符合 `<Publisher>.Monica.<Package>[.<Variant>]`。
- [ ] 项目名、程序集名与根命名空间和包 ID 一致。
- [ ] 目标源上的包 ID 可用，且没有使用 `Monica.*`。
- [ ] 每个模块键等于包 ID，或以 `PackageId.` 开头。
- [ ] 每个 UI 模块键都以 `.UI` 结尾。
- [ ] README 列出模块键与注册方法。
- [ ] 包内模块属于一个内聚的版本与分发边界。
- [ ] 每个包与镜像都清楚标识为独立发布；没有把设计示例写成可用产物。

## 架构与公开 API

- [ ] 每个模块都有自己的 Module、Option、Guide、Builder 扩展与依赖声明。
- [ ] `packageDependencies` 是完整无环的仓库内 NuGet 图，并使用完整包 ID。
- [ ] `modules[].dependsOn` 是完整无环的 Monica 运行时图，并使用完整模块键。
- [ ] 每个跨包模块边都有对应包边；每个 Provider 都设置 `providerFor`、依赖对应目标，并实现 `IModuleProvider`。
- [ ] 项目引用与声明的仓库内包边完全一致；没有把兄弟包程序集嵌入另一包。
- [ ] 第三方注册类型位于 `<PackageId>.Modules`，而不是官方专用的 `Monica.Modules` 命名空间。
- [ ] UI 路由从移除 `<Publisher>.Monica.` 后的包族派生，宿主组合中不存在重复的规范化路由。
- [ ] 每个本地化页面都显式声明 `TResource`，不存在 `RegisterLocalizedComponent` 或集中式页面标题资源。
- [ ] 每个包自有分类 ID 都等于对应 UI 模块键移除末尾 `.UI`，具有显式顺序，并且只用页面所属资源注册一次。
- [ ] 每个导航资源都通过 `AddResource<TResource>()` 注册，`en-US` 与 `zh-CN` 键保持同步。
- [ ] `Modules/` 只包含注册逻辑。
- [ ] 公开 Abstraction/Model 与内部 Service/Provider 边界清晰。
- [ ] Facade 是返回 `Res` 或 `Res<T>` 的轻量宿主/UI 入口；内部 Service 使用普通 .NET 异常与返回类型。
- [ ] 其他模块依赖公开 Abstraction 与 Model，而不是 Facade 或内部 Service。
- [ ] 默认使用 `ModuleBase`；只有参与中间件或端点时才使用 `WebModuleBase`。
- [ ] 调用 `ScheduleCompositionWork(...)` 的模块只提供基于不可变或由本模块独占输入的隔离、确定性 CPU 密集型工作，不修改宿主 Builder、Service Collection、Service Provider、模块图或共享静态状态。
- [ ] UI 模块消费公开 Facade，不访问内部 Service 或 Provider。
- [ ] 公开和面向开发者的 API 具有有用的 XML 文档。
- [ ] Option 解释默认值和实际影响；Guide 方法解释前置条件与副作用。
- [ ] 所有 Monica 依赖都通过 `PackageReference` 从声明的 NuGet 源/版本还原；不存在 `MonicaSourceRoot`、同级 Monica 项目引用或本地重新标记版本的 Monica 包。
- [ ] 每个解析后的 `Monica.*` 包版本（包括中央管理/属性声明）都精确等于 Manifest `monicaVersion`。

## 行为与测试

- [ ] 完整解决方案以零警告完成 Restore、Build 与 Test。
- [ ] 测试通过真实 `builder.AddMonica(...)` 宿主边界组合包。
- [ ] 每个公开包入口都通过其打包后 NuGet 产物测试，包括跨包 Provider 选择。
- [ ] 使用调度组合工作时，测试证明存在有效重叠、每个声明的 Deadline 都会等待、失败会在对应检查点与 `Build()` 前传播、诊断保持确定性，并发执行保持安全。
- [ ] 设计为可独立使用的模块能够单独注册成功。
- [ ] 声明的依赖能正确解析，缺少必需 Guide 配置时会清晰失败。
- [ ] 重复注册具有幂等语义，或按明确契约拒绝。
- [ ] 按实际风险覆盖取消、并发、释放、超时与异常行为。
- [ ] UI 模块具有组件测试，并为主要路由提供可运行 Bridge/Demo。
- [ ] UI 测试按需断言分类身份/顺序、页面资源/键、导航路由/顺序、重复路由与冲突分类定义。
- [ ] 测试不依赖机器专属路径、持久共享状态或未声明的外部服务。
- [ ] Provider 集成测试区分协议/单元测试与声明的 Live Service CPU/GPU 门禁；伪造响应不能替代发布推理门禁。

## NuGet 产物

- [ ] Release `.nupkg` 只包含预期程序集、依赖、Content 与静态 Web 资产。
- [ ] 产物目录对清单中每个包精确包含一个 `.nupkg` 与适用的 `.snupkg`，没有缺失或多余包。
- [ ] 打包后 Nuspec 的仓库内依赖与 `packageDependencies` 一致；未嵌入兄弟程序集。
- [ ] 作者、描述、版权、项目 URL、仓库、标签、发布说明与目标框架正确。
- [ ] 包内嵌 README 和 128×128 透明 PNG 图标。
- [ ] `PackageLicenseExpression` 与 `PackageLicenseFile` 只存在其中一个。
- [ ] README 清晰显示独立发布者和兼容性声明。
- [ ] 当源码可用时提供 Source Link 与 `.snupkg`。
- [ ] 干净消费者可以从本地源还原每个包入口，并在无源码项目引用的情况下启动代表性宿主。
- [ ] 依赖预发布 Monica 的包自身也使用预发布版本。

## 配套 OCI 镜像

- [ ] 每个 `ociImages[]` 条目都通过 `companionPackageId` 命名已声明 Connector，并且代表一个 Registry 仓库。
- [ ] CPU 与 NVIDIA 变体是该仓库下的显式 Bake Target，具有唯一 Stage、Platform、Accelerator 与 Tag Suffix。
- [ ] 一个分层/多阶段 Dockerfile 图在 CPU/NVIDIA Runtime Stage 分叉前共享已锁定的 Base、Dependency、Application 与 Model Layer。
- [ ] 规范化 Bake 图与清单的 Context、Dockerfile、Stage、Platform、Tag 与 Target 集合一致。
- [ ] 每个已构建镜像使用不可变 `<manifest-version>-<tagSuffix>` Tag，以非 Root 用户运行，声明 Health Check，并携带必需 OCI/Monica Label。
- [ ] CPU 与 NVIDIA 变体暴露相同的版本化 Connector-facing 协议与 Health Contract。
- [ ] 真实 CPU 容器请求可完成有意义的 Provider 推理。
- [ ] 每个 NVIDIA 目标都在具有 GPU 访问权限时运行，并在 GPU 上完成有意义的推理；构建成功、Health、CUDA Import 与 `nvidia-smi` 都不能单独通过。
- [ ] 除非文档化 CPU Fallback 属于有意且已测试的行为，否则 NVIDIA 模式在 GPU 执行不可用时立即失败。
- [ ] 自动发布前，每个镜像都声明 Provider 专用发布门禁；NVIDIA 门禁使用同一组受管 Self-hosted GPU Runner Label，缺少门禁时整个发布工作流被省略。
- [ ] 保留镜像 Digest 与 Provenance，没有覆盖不可变版本 Tag。

## 安全、隐私与运维

- [ ] 产物与仓库历史中不含 Secret、凭据、机器路径或私有源地址。
- [ ] 披露外部网络访问、持久化、Hosted Service、端点、中间件与遥测。
- [ ] 对跨越信任边界的输入进行验证，日志不会泄露敏感数据。
- [ ] 已检查依赖的已知漏洞与许可证兼容性。
- [ ] Base Image、System/Python/Native Dependency、Model Asset、下载 URL、Checksum 与许可证都已审查并可复现锁定。
- [ ] Connector/镜像文档解释端口、认证、Payload 限制、超时、Health、Volume、网络/数据处理、CPU/GPU 前置条件与 Fallback 行为。
- [ ] README 提供支持与安全问题报告渠道。
- [ ] 发布者能够废弃或 Unlist 有问题的版本，并发布新的不可变修复版本。

## 发布流程

- [ ] 包版本遵循 SemVer，发布说明明确列出破坏性变更。
- [ ] CI 从用于打包的同一个提交重新构建并运行测试。
- [ ] CI 同时针对源码与已打包产物验证有效发布版本，防止 Tag 覆盖绕过预发布依赖规则。
- [ ] 优先使用 NuGet Trusted Publishing；否则使用权限最小且短期有效的 API Key。
- [ ] NVIDIA 发布由受管 NVIDIA Runner 执行真实 GPU 推理门禁。
- [ ] 第一次外部 Push 前完成所有 NuGet/OCI 门禁，并保留已 Push 包哈希、镜像 Digest 与 Provenance。
- [ ] 发布工作流在 Registry 登录或任何 NuGet/OCI Push 前完成镜像 Load/Inspect 与 CPU/NVIDIA Provider Smoke Command。
- [ ] 发布者已经审阅[包与品牌规范](./package-and-branding-standard.md)及[许可证指南](./licensing-and-commercial-use.md)。
