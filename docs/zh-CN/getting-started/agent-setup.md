---
title: Agent 设置
description: 在任意兼容 Agent Skills 的编码 Agent 中安装 Monica Guide，了解工具箱，并在准备好后选择开发路线。
sidebar_position: 2
---

`monica-guide` 是面向编码 Agent 的 Monica 全局工具箱。即使你还在了解 Monica，没有仓库，也没决定要开发应用、扩展、框架还是文档，也可以先安装它。它不是运行时包，也不会替代 .NET CLI。

## 选定仓库之前就可以安装

1. 打开首页的 [Agent 设置起步区](/zh-CN/#start)。
2. 复制唯一的通用指令。
3. 把指令粘贴到任意**兼容 Agent Skills 的编码 Agent** 对话框，而不是终端。

指令会指定一个不可变的 Monica 发布版本。Agent 会下载与自身平台匹配的 Monica Guide 发布包——`win-x64`、`linux-x64` 或 `osx-arm64`——先对照发布附件 `SHA256SUMS` 校验，再安装进当前项目目录：先运行 `$monica-guide init --workspace <本仓库> --profile <你确认的 profile>`，再运行 `$monica-guide configure --workspace <本仓库>`（先审阅预览，只用批准的计划摘要应用）。这次安装只写入该仓库；只有当你明确提出整机安装时，才会修改用户级 Skill 目录。Codex 与 Claude Code 是发布 Smoke Test 验证过的宿主，但这条指令不会绑定任何一个宿主。

如果 Agent 无法自行完成安装，可展开首页的手动终端备用方案：自行下载与平台匹配的发布包并对照 `SHA256SUMS` 校验，然后在终端运行同样的 `$monica-guide configure --workspace <工作区>` 与 `$monica-guide status --workspace <工作区>` 命令。

## Guide 可以做什么

发现 Skill 后，Guide 会先解释以下能力，然后询问你想做什么：

- 显示当前激活的 Monica Skill 全局发布版本和已安装 Skill 健康状态；
- 显示已验证的 Monica 与 Monica.Docs 全局源码绑定；
- 在不配置仓库的情况下帮你了解 Monica；
- 检查工作区，并建议应用、扩展、框架或文档 Profile；
- 在你选择后初始化或重新配置工作区；
- 独立绑定或解除 Monica 与 Monica.Docs 精确源码，也可同时绑定两者；
- 诊断并更新 Monica Skill；
- 安全路由上游贡献，但不自动执行远程变更。

安装 Guide 不会初始化仓库、选择 Profile、安装下游开发 Skill、绑定源码或修改文件。Guide 会先报告当前全局状态，再询问你想使用哪项能力。

## 源码绑定会如何呈现

源码绑定保存在全局用户状态中，以规范仓库为键，而不是归属某个工作区 Profile。`status` 会列出每个绑定的仓库、精确 ref 与 commit、本地路径、来源和兼容性检查结果。因此，任何需要 Monica 或 Monica.Docs 内部实现的 Agent 都可重用已验证 Checkout。

应用开发者可以两个都不绑定，只绑定 Monica，只绑定 Monica.Docs，或同时绑定两者。Profile 可以根据任务推荐源码，但不会拥有或隐藏绑定。离线工作时，精确源码不可用就会停止，绝不会替换成其他发布版本或默认分支。

## 稍后再选择工作区 Profile

Profile 是可选的初始化预设，而不是安装 Guide 的前置选择：

| Profile | 适用场景 |
|---|---|
| `application` | 开发消费 Monica 的应用 |
| `extension-author` | 开发独立发布的 Monica 模块或 Provider |
| `framework-contributor` | 在可写 Monica Checkout 中工作 |
| `docs-contributor` | 在可写 Monica.Docs Checkout 中工作 |

Guide 可以检查现有工作区并解释建议。新建、混合或模糊的工作区仍由你决定；仅为查看状态或管理全局源码绑定时，不需要选择 Profile。

## 应用前审核变更

后续的每个修改型操作仍然会先预览。Guide 会报告完整操作列表、文件 Diff、警告、阻塞项与 `planDigest`；应用时必须提供匹配的 `--apply --plan-digest <digest>`，计划或工作区漂移后会失败。初始化可能全局安装 Profile 的 Skill 闭包，也可能建议托管根 `AGENTS.md` 区块，但永远不会授权 Commit、Push、Issue、Pull Request 或其他远程变更。

工作区变更应用后，运行 `doctor`。如果托管的 `AGENTS.md` 或 `CLAUDE.md` 指令发生变化，请开始一次新的 Agent 运行，让宿主读取更新后的指导。

## 试试这个工具箱

```text
使用 Monica Guide 解释它的工具箱，并帮我选择下一步。暂时不要修改任何内容。
```

```text
使用 Monica Guide 显示我当前激活的 Monica Skill 发布版本和所有全局源码绑定，再解释存在的问题。
```

```text
使用 Monica Guide 预览全局绑定精确 Monica 与 Monica.Docs 源码。在应用前显示建议路径、ref 或 commit、来源、兼容性警告与 plan digest。
```

如需了解通道、更新、源码绑定、状态、恢复与贡献控制，请继续阅读 [Guide 运维与安全](./guide-operations.md)。
