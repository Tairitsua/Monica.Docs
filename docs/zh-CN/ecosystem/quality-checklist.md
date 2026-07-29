---
title: 质量检查清单
description: 发布前验证模块行为、公开契约、包内容与发布准备情况。
sidebar_position: 5
---

# 质量检查清单

Monica 兼容标识采用发布者自我声明。完成本清单是发布者对兼容声明负责的依据，并不构成 Monica 团队认证。

## 身份与包边界

- [ ] 显式设置 `PackageId`，并符合 `<Publisher>.Monica.<Package>[.<Variant>]`。
- [ ] 项目名、程序集名与根命名空间和包 ID 一致。
- [ ] 目标源上的包 ID 可用，且没有使用 `Monica.*`。
- [ ] 每个模块键等于包 ID，或以 `PackageId.` 开头。
- [ ] 每个 UI 模块键都以 `.UI` 结尾。
- [ ] README 列出模块键与注册方法。
- [ ] 包内模块属于一个内聚的版本与分发边界。

## 架构与公开 API

- [ ] 每个模块都有自己的 Module、Option、Guide、Builder 扩展与依赖声明。
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
- [ ] UI 模块消费公开 Facade，不访问内部 Service 或 Provider。
- [ ] 公开和面向开发者的 API 具有有用的 XML 文档。
- [ ] Option 解释默认值和实际影响；Guide 方法解释前置条件与副作用。

## 行为与测试

- [ ] 完整解决方案以零警告完成 Restore、Build 与 Test。
- [ ] 测试通过真实 `builder.AddMonica(...)` 宿主边界组合包。
- [ ] 设计为可独立使用的模块能够单独注册成功。
- [ ] 声明的依赖能正确解析，缺少必需 Guide 配置时会清晰失败。
- [ ] 重复注册具有幂等语义，或按明确契约拒绝。
- [ ] 按实际风险覆盖取消、并发、释放、超时与异常行为。
- [ ] UI 模块具有组件测试，并为主要路由提供可运行 Bridge/Demo。
- [ ] UI 测试按需断言分类身份/顺序、页面资源/键、导航路由/顺序、重复路由与冲突分类定义。
- [ ] 测试不依赖机器专属路径、持久共享状态或未声明的外部服务。

## NuGet 产物

- [ ] Release `.nupkg` 只包含预期程序集、依赖、Content 与静态 Web 资产。
- [ ] 作者、描述、版权、项目 URL、仓库、标签、发布说明与目标框架正确。
- [ ] 包内嵌 README 和 128×128 透明 PNG 图标。
- [ ] `PackageLicenseExpression` 与 `PackageLicenseFile` 只存在其中一个。
- [ ] README 清晰显示独立发布者和兼容性声明。
- [ ] 当源码可用时提供 Source Link 与 `.snupkg`。
- [ ] 干净消费者可以从本地源还原包并启动代表性宿主。
- [ ] 依赖预发布 Monica 的包自身也使用预发布版本。

## 安全、隐私与运维

- [ ] 产物与仓库历史中不含 Secret、凭据、机器路径或私有源地址。
- [ ] 披露外部网络访问、持久化、Hosted Service、端点、中间件与遥测。
- [ ] 对跨越信任边界的输入进行验证，日志不会泄露敏感数据。
- [ ] 已检查依赖的已知漏洞与许可证兼容性。
- [ ] README 提供支持与安全问题报告渠道。
- [ ] 发布者能够废弃或 Unlist 有问题的版本，并发布新的不可变修复版本。

## 发布流程

- [ ] 包版本遵循 SemVer，发布说明明确列出破坏性变更。
- [ ] CI 从用于打包的同一个提交重新构建并运行测试。
- [ ] 优先使用 NuGet Trusted Publishing；否则使用权限最小且短期有效的 API Key。
- [ ] 保留最终产物，便于追踪与检查。
- [ ] 发布者已经审阅[包与品牌规范](./package-and-branding-standard.md)及[许可证指南](./licensing-and-commercial-use.md)。
