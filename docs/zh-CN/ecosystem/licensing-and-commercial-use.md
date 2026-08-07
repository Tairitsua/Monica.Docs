---
title: 许可证与商业使用
description: 为独立 Monica 包选择开源、专有或商业条款。
sidebar_position: 7
---

独立 Monica 包作者可以自行选择许可证，也可以收费。Monica 的 MIT 许可证允许使用、修改、发布、分发、再授权和销售 Monica 软件，但复制或分发 Monica 软件的全部或实质部分时，必须保留 MIT 版权与许可声明。

本页解释生态政策，不构成法律意见。商业发布具有重要价值时，应让合格法律顾问审查 Monica 许可证、全部依赖许可证、复制的代码，以及适用的商标与消费者法律。

## 主动选择条款

| 模式 | NuGet 元数据 | 开源徽章 | 常见分发方式 |
|---|---|---|---|
| MIT、Apache-2.0 或其他 NuGet 接受的开源许可证 | `PackageLicenseExpression` | 可以使用 | NuGet.org 或私有源 |
| 自定义 Source-available 条款 | `PackageLicenseFile` | 不可使用 | 按条款选择公开或私有源 |
| 专有/商业许可证 | `PackageLicenseFile` | 不可使用 | 通常为私有或需认证的源 |
| 双重许可证 | 只有完整表达式被 NuGet 接受时才使用 Expression，否则使用许可证文件 | 仅当当前包版本确实开源时使用 | 公开和/或私有渠道 |

`PackageLicenseExpression` 与 `PackageLicenseFile` 必须二选一。不要留空：消费者能下载包，并不代表已经获得使用许可。NuGet 的[包创作指南](https://learn.microsoft.com/nuget/create-packages/package-authoring-best-practices#if-your-package-is-not-open-source)建议非开源包嵌入许可证文件。

## Monica MIT 许可证覆盖什么

你原创的模块代码仍由你选择条款。复制或重新分发的 Monica 代码受 Monica MIT 声明约束，必须为 Monica 代码的副本或实质部分保留该声明。普通 NuGet 依赖通常会在依赖包中保留 Monica 自己的许可证元数据；把源码复制到当前项目时需要特别注意声明保留。

你的包许可证不能覆盖：

- Monica MIT 声明义务
- MudBlazor、Provider SDK 或其他依赖的许可证
- 第三方资产、字体、图标、数据或生成内容的条款
- Monica 品牌与兼容标识规则

## 配套镜像与模型资产

在 schema-v2 仓库中，发布者声明的许可证与分发策略一致适用于发布者原创的包与配套镜像 Service。如果发布者原创的镜像代码需要不同条款，应拆分到另一仓库并明确边界。

这一仓库级选择不会对镜像中的第三方内容重新授权。容器可能在各自许可证与可接受使用条款下重新分发 Base Image Layer、System Library、Python/Native Runtime、Provider 代码、Model Weight、Dictionary、Font 或其他数据。发布镜像前：

- 记录每个组件、版本、源 URL、Checksum、许可证与必需 Notice。
- 确认允许重新分发所有模型与数据资产，并在适用时确认允许商业使用。
- 在镜像与配套源码/发布材料中保留必需 Notice。
- 在可行时发布 SBOM 或等价依赖清单。
- 说明上传文档是否离开宿主、是否持久化，以及是否用于遥测或模型改进。

开源 Connector 包不会自动使所有镜像 Layer 或模型变为开源；同样，收费也不会消除第三方 Notice 或重新分发义务。

## 对包收费

你可以对二进制、源码访问、更新、托管服务、技术支持、咨询或商业许可证收费。分发方式必须符合访问模型：

- NuGet.org 是公开包源，不是收银台或授权系统；发布到那里后任何人都能下载。
- 公开包仍可采用付费支持、单独授权服务等商业模式，但公开产物本身始终可下载。
- 需要控制付费二进制下载权限时，使用需要认证的私有 NuGet 源。
- 除包元数据外，还应在客户协议中明确认证、续费、离线使用、更新权与停止支持条款。

不要使用代码限制或遥测去暗示许可证协议中并不存在的条款。

## 品牌规则相互独立

无论许可证或价格如何，兼容包都不是官方包。开源并不会授予紫色 Monica 官方标识的使用权；商业包只要遵循[包与品牌规范](./package-and-branding-standard.md)，仍然可以使用绿色兼容标识。

始终标明独立发布者与兼容性自我声明，不要声称 Monica 已认证、验证、背书或承担该包责任。
