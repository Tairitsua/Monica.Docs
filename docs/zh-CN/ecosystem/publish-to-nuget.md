---
title: 发布到 NuGet
description: 通过安全 NuGet 流程为第三方 Monica 包确定版本、验证并发布。
sidebar_position: 6
---

# 发布到 NuGet

先让干净消费者还原并运行包，再由 CI 发布不可变产物。NuGet.org 适合公开分发；需要限制下载访问时应使用私有源。

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

## 3. 构建并检查

```bash
dotnet restore
dotnet build -c Release --no-restore
dotnet test -c Release --no-build
dotnet pack -c Release --no-build --output artifacts/packages
```

随后验证：

- `.nupkg` 元数据、许可证、README、图标、依赖与静态 Web 资产
- 当源码可用时生成 `.snupkg` 与 Source Link
- 从本地源还原到干净消费者项目
- 在代表性宿主中启动并注册模块

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

## 5. 验证公开版本

Push 后：

- 等待 NuGet 验证与索引完成，再检查公开包页面。
- 预览 README 与许可证渲染结果。
- 在构建工作区之外的干净消费者中还原公开版本。
- 验证所有声明的模块键与注册入口。
- 编写 Release Notes，把不可变产物关联到源码提交。

## 6. 持续维护

- 每次修正都发布新版本，不尝试覆盖已有产物。
- 当消费者应迁移到后继包时，废弃当前包或版本。
- 对损坏或不安全版本执行 Unlist，使其不再出现在常规搜索中，同时保留现有还原能力。
- 漏洞影响消费者时发布安全公告与修复版本。
- 维护者离开项目前，先转移或添加 NuGet 所有者。

命令行与所有权细节见 NuGet 官方的[发布 NuGet 包](https://learn.microsoft.com/nuget/nuget-org/publish-a-package)。
