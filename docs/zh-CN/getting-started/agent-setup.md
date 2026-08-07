---
title: Agent 设置
description: 为 Monica 仓库设置 Codex 或 Claude Code，预览变更，并安全开始开发。
sidebar_position: 2
---

`monica-guide` 用来让编码 Agent 为 Monica 仓库做好开发准备。它会按照你的目标安装开发指导、检查仓库，并在修改文件前预览设置方案。它不是运行时包，不会替代 .NET CLI，也不会在初始化期间修改业务代码。

## 开始前

1. 在目标仓库根目录打开 **Codex** 或 **Claude Code**。
2. 打开首页的 [Agent 设置起步区](/zh-CN/#start)，选择编码 Agent 与开发目标。
3. 复制生成的指令，并粘贴到 **Agent 对话框**，而不是终端。

通常每个用户在一台机器上只需安装一次 Guide，每个仓库只需初始化一次。官网指令会把 Guide 固定到不可变的 Monica 发布版本，并要求它在 Dry-run 预览后停止。

## 选择开发目标

| 目标 | 适用场景 | 源码要求 |
|---|---|---|
| **开发 Monica 应用** | 仓库通过 Monica 包实现应用 | 精确的只读 Monica 源码可选；依赖框架内部行为时建议绑定 |
| **开发扩展** | 创建独立 Monica 模块、Provider、UI 包或配套镜像 | 必须绑定精确的只读 Monica 源码；扩展项目本身仍通过 NuGet 使用 Monica |

Guide 可以检查仓库并解释建议，但对于模糊或混合仓库，最终选择仍由你确认。框架与文档贡献者应使用[Guide 运维与安全](./guide-operations.md#贡献者仓库)中的仓库专用流程。

## 审核预览

粘贴后的指令会要求 Agent：

- 只从官网公布的不可变 Monica tag 安装 `monica-guide`；
- 验证所选宿主能否发现已安装的 Skill；
- 仅在无法发现 Skill 时重启；
- 按所选目标初始化，但不传入 `--apply`；
- 报告解析后的发布版本、操作、受影响文件、Diff、警告、阻塞项与 `planDigest`。

请先审核结果再批准。设置过程可能全局安装 Monica 开发 Skill，也可能建议在仓库根 `AGENTS.md` 中加入托管区块；它不会授权 Commit、Push、Issue、Pull Request 或其他远程变更。

## 应用未变化的计划

如果预览正确，请让 Agent 应用这份原样计划。Guide 同时要求 `--apply` 与预览中显示的 `--plan-digest`；如果预览后仓库或计划发生变化，它会拒绝执行。此时应重新生成预览，不要复用旧 Digest。

应用成功后，让 Agent 运行 `doctor` 并解释仍存在的警告。如果托管的 `AGENTS.md` 或 `CLAUDE.md` 指令发生变化，请开始一次新的 Agent 运行，让宿主读取新的仓库指导。

## 开始开发

设置完成后，可以先提出一个具体请求：

```text
解释这个仓库的 Monica 架构，并指出新增订单功能应该放在哪里。先不要修改文件。
```

```text
使用此仓库已选择的 Monica Skill 实现下一个应用功能，然后运行相关测试。
```

```text
运行 Monica Guide status，并告诉我此仓库是否仍与当前激活的 Skill 发布版本一致。
```

如需了解通道、更新、源码绑定、状态、恢复与贡献控制，请继续阅读 [Guide 运维与安全](./guide-operations.md)。
