---
title: 发布包与配套镜像
description: 安全确定版本、验证并发布第三方 Monica NuGet 包与可选 Provider 镜像。
sidebar_position: 6
---

只有当干净消费者已运行每个包，且每个声明的配套镜像都通过运行时门禁后，才能由 CI 发布不可变产物。NuGet.org 适合公开分发包；需要限制下载访问时应使用私有源。OCI 镜像使用 schema-v2 仓库清单声明的 Registry。

## 1. 准备所有权与身份

第一次发布前：

1. 确认 NuGet.org 上的包 ID 可用。
2. 通过未来持续拥有该包的个人或组织发布。
3. 当包系列符合 NuGet 条件时，考虑申请发布者前缀保留。
4. 配置能够长期使用的支持与安全联系方式。
5. 把包 ID 与 NuGet 所有者当作持久公开决策。

NuGet 的[前缀保留](https://learn.microsoft.com/nuget/nuget-org/id-prefix-reservation)才是包源级别的来源信号，Monica 兼容标识不能替代它。

## 2. 选择版本

使用 `Major.Minor.Patch[-prerelease]` 形式的 SemVer。

- 公开契约尚不稳定时发布 `-alpha`、`-beta` 或 `-rc`。
- `1.0.0` 之后的主动破坏性变更提升主版本号。
- 依赖包使用经过测试的最低 Monica 版本，避免精确版本或没有必要的上限。
- 如果依赖预发布 Monica，当前包也必须是预发布版本；稳定 NuGet 包不能依赖预发布包。
- 一个 schema-v2 仓库对所有声明的 NuGet 包与配套镜像 Tag 使用同一对齐版本。

## 3. 验证、构建并检查包

```bash
python scripts/validate_repository.py --root .
dotnet restore
dotnet build -c Release --no-restore
dotnet test -c Release --no-build
dotnet pack -c Release --no-build --output artifacts/packages
python scripts/inspect_packages.py --root . --artifacts artifacts/packages
```

随后验证：

- 精确的 `.nupkg`/`.snupkg` 集合、元数据、许可证、README、图标、依赖与静态 Web 资产
- 每条仓库内 `packageDependencies` 边都出现在 Nuspec 中，且没有嵌入兄弟包程序集
- 当源码可用时生成 `.snupkg` 与 Source Link
- 每个公开包入口都能从本地源还原到干净消费者项目
- 在代表性宿主中验证启动、Provider 选择与模块注册

从声明的 NuGet 源还原 Monica 版本。每个解析后的 `Monica.*` `PackageReference`（包括中央管理或属性间接声明的版本）都必须等于 Manifest `monicaVersion`。发布验证不得依赖 `MonicaSourceRoot`、同级 Monica `ProjectReference` 或携带公开版本号的本地重建包。如果仓库声明 Monica `1.0.0-rc.6` 之类的预发布版本，仓库/包版本必须保持预发布状态。

第一次发布演练时不要给 `dotnet nuget push` 增加 `--skip-duplicate`，让意外版本冲突明确失败。已经发布的版本不可变；错误版本必须用新版本修复。

## 4. 使用 Trusted Publishing

GitHub Actions 优先采用 NuGet [Trusted Publishing](https://learn.microsoft.com/nuget/nuget-org/trusted-publishing)。它使用 GitHub OIDC 身份换取短期 NuGet API Key，避免长期保存发布 Secret。

发布 Job 应当：

1. 只由明确的 Tag 或受保护发布流程触发。
2. 只在发布 Job 中申请 `id-token: write`。
3. 请求凭据前完成构建、测试、打包与验证。
4. 临近 Push 时调用 `NuGet/login@v1`；临时 Key 有效期为一小时。
5. 推送刚刚验证过的 `.nupkg` 与 `.snupkg`。
6. 记录源码提交、Workflow Run 与包哈希。

Trusted Publishing 仍在逐步开放。如果当前 NuGet 帐号尚未提供该功能，应使用只允许目标包 ID 与 Push 操作、短期有效的 API Key，把它保存为受保护 CI Secret，并在疑似泄漏后立即轮换。

## 5. 构建并验证配套镜像

当 `ociImages` 非空时，在任何外部 Push 之前验证并构建精确 Bake 图：

```bash
python scripts/validate_oci.py --root .
docker buildx bake --file docker-bake.hcl --print
docker buildx bake --file docker-bake.hcl
python scripts/inspect_images.py --root .
```

每个声明的 Provider Service 使用一个 OCI 仓库。CPU 与 NVIDIA 变体使用不可变 `<version>-<tagSuffix>` Tag 和同一个分层/多阶段 Dockerfile 图。Inspector 必须验证声明的 Target/Stage/Platform 映射、镜像 Tag、非 Root 用户、Health Check 与 OCI/Monica Label。

静态检查必不可少，但仍然不够：

1. 启动 CPU 镜像，等待 Health Ready，再通过 Connector-facing 协议完成一次真实 Provider 推理。
2. 使用 GPU 访问权限启动每个 NVIDIA 镜像，请求的 Accelerator 不可用时立即失败，并在 GPU 上完成一次真实推理。
3. 断言有意义的 Provider 输出，不只是 HTTP 成功。对 OCR，要验证识别区域/文本与置信度。

仅构建 CUDA Tag 镜像、导入框架、调用 Health Endpoint 或运行 `nvidia-smi` 都不能证明 GPU 推理。标准托管 CI Runner 可以构建 NVIDIA 镜像，但通常无法通过这一门禁；请使用明确管理的 NVIDIA Runner。记录镜像 Digest 与 Provenance，永远不覆盖已存在的版本 Tag。

在第一次 Push 之前完成所有包与镜像门禁。这能降低多产物部分发布的风险，但无法让外部发布真正具有事务性。

生成的工作流采用 Fail-closed 设计。每个 OCI 镜像都要为 CPU Target 声明 `releaseGates.cpuSmokeCommand`，并为 NVIDIA Target 声明 `nvidiaSmokeCommand` 与共享的 `managedNvidiaRunnerLabels`。Runner Label 必须包含 `self-hosted` 和 `nvidia`。任何镜像缺少必需门禁时都不会生成发布工作流。门禁完整时，工作流会先 Load/Inspect 所有镜像并运行每条 Provider 专用 Smoke Command，然后才登录 Registry 并开始 OCI/NuGet Push。

## 6. 验证公开版本

Push 后：

- 等待 NuGet 验证与索引完成，再检查公开包页面。
- 预览 README 与许可证渲染结果。
- 在构建工作区之外的干净消费者中还原公开版本。
- 验证所有声明的模块键与注册入口。
- 通过 Digest 拉取每个已发布镜像 Tag，重复适用的 CPU/GPU Smoke Test。
- 编写 Release Notes，把不可变产物关联到源码提交。

## 7. 持续维护发布

- 每次修正都发布新版本，不尝试覆盖已有产物。
- 当消费者应迁移到后继包时，废弃当前包或版本。
- 对损坏或不安全版本执行 Unlist，使其不再出现在常规搜索中，同时保留现有还原能力。
- 漏洞影响消费者时发布安全公告与修复版本。
- 维护者离开项目前，先转移或添加 NuGet 所有者。
- 保持 OCI 版本 Tag 不可变，在 Registry 元数据中废弃不安全镜像，并在新的对齐发布版本下发布修正 Tag。

命令行与所有权细节见 NuGet 官方的[发布 NuGet 包](https://learn.microsoft.com/nuget/nuget-org/publish-a-package)。
