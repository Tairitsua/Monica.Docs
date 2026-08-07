---
title: 创建第三方 Monica 仓库
description: 使用 Monica 开发 Skill 创建可发布的独立包与配套 Provider 镜像。
sidebar_position: 1
---

Monica 第三方生态允许个人或组织独立发布模块，同时让仓库、包、运行时与品牌身份保持一致。一个仓库可以发布一个或多个 NuGet 包；当 Provider 更适合进程隔离时，还可以配套一个同时提供 CPU 与 NVIDIA 变体的 OCI 镜像仓库。发布内容可以开源、闭源、免费或收费；“兼容 Monica”并不代表官方身份或 Monica 团队已审查。

## 从 Skill 开始

先按照 [Agent 设置指南](../getting-started/agent-setup.md)，使用 `extension-author` Profile 初始化当前仓库。`monica-guide` 会从同一个不可变 Monica 发布版本安装 catalog 选定的框架、架构、开发、第三方与测试 Skill 闭包，并绑定扩展开发所需的精确只读 Monica 源码。

```text
$monica-guide 使用 extension-author Profile 初始化这个仓库。
在应用前预览所有 Skill、源码与指令变更。
```

应用初始化后，再调用聚焦于仓库设计的开发 Skill：

```text
$monica-third-party-module-development 创建 Tairitsua.Monica.AI.OCR 仓库，
分别提供 Provider-neutral、PaddleOCR Connector 与 UI NuGet 包。
为 Connector 配套分层 CPU/NVIDIA 镜像，仅通过 NuGet 使用已选择的
Monica 发布版本，暂不发布任何产物。
```

Skill 会在生成文件前确认发布者、仓库用途、包集合、完整的包/模块依赖图、运行时类型、可选 OCI 目标、Monica 版本、许可证、分发渠道与发布所有者，不会擅自选择许可证。

## Skill 会生成什么

- SDK 风格的 `.NET` 仓库与 `.slnx` 解决方案
- 描述完整发布单元的 schema-v2 `monica.manifest.json`
- 一个或多个 NuGet 包项目，每个包可以包含一个或多个内聚 Monica 模块
- 使用完整身份声明的仓库内 NuGet 依赖与 Monica 运行时依赖
- Module、Option、Guide 与 `IMonicaBuilder` 注册入口
- 按需生成非 Web、Web、Provider/Integration、混合 UI 或独立 UI 结构
- 可选的 Buildx Bake 目标，用于一个 Provider Service OCI 仓库的分层 CPU/NVIDIA 变体
- 通过真实 Monica 宿主完成组合的社会性测试
- NuGet 元数据、包 README、兼容标识与许可证配置
- CI，以及仅在 Provider 专用 OCI 发布门禁完整后生成、优先使用 NuGet Trusted Publishing 的 Fail-closed GitHub Actions 发布流程
- 包/镜像检查、干净本地源消费、CPU Smoke Test 与适用时的真实 GPU 推理门禁

生成代码只是发布者拥有并维护的起点。声明 OCI 目标并不会让 Skill 凭空生成可用的 Provider Service。发布前必须真正实现并审查公开 API、Provider 协议、依赖、镜像、安全行为与法律条款。包含 OCI 镜像的仓库只有在每个镜像都声明 Provider 专用 CPU 与适用的 NVIDIA Smoke Command 后才会生成发布工作流；NVIDIA 门禁还要指定受管 Self-hosted GPU Runner。

## 仓库 schema v2 与生态 v1

这两个版本标识描述的是不同契约：

- `monica.manifest.json` 使用 `schemaVersion: 2`，因为一个仓库现在可以声明多个 NuGet 包与可选 OCI 目标。
- NuGet 包仍使用 `monica-ecosystem-v1` 标签，并继续遵守下方 v1 身份、导航、品牌、许可证与兼容性规则。

Schema v2 不会改变公开生态规范名称，也不代表包获得官方认证。

## v1 核心契约

1. NuGet 包 ID 使用 `<Publisher>.Monica.<Package>[.<Variant>]`。
2. 一个仓库可以发布多个版本对齐的 NuGet 包，每个包可以包含任意数量、彼此内聚的模块。
3. 每个模块键必须等于 `PackageId`，或以 `PackageId.` 开头。
4. `Monica.*` 与紫色官方 Logo 仅供 Monica 官方包使用。
5. 第三方包可以使用绿色 Monica 兼容标识，也可以使用发布者自己的图标。
6. 明确兼容性由发布者自我声明，并标出独立发布者。
7. 使用完整元数据、测试、许可证表达式或许可证文件，以及可复现的发布流程。发布任何一个产物前，必须把声明的所有 NuGet 与 OCI 产物作为同一发布单元验证。

## 继续阅读

- [包与品牌规范](./package-and-branding-standard.md)
- [仓库、包与模块架构](./multi-module-package-architecture.md)
- [创建流程](./creation-workflow.md)
- [质量检查清单](./quality-checklist.md)
- [发布包与配套镜像](./publish-to-nuget.md)
- [许可证与商业使用](./licensing-and-commercial-use.md)
