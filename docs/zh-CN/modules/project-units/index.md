---
title: ProjectUnits
description: 发现宿主范围内的架构目录，并提供类型化状态、详情和需求追踪视图。
sidebar_position: 1
---

`Monica.ProjectUnits` 会发现受支持的应用角色，连接依赖关系，记录架构诊断，并向 Agent、API 和管理界面提供可序列化的类型化投影。

## 公开入口

| 使用面 | 作用 |
|---|---|
| `monica.AddProjectUnits()` | 注册发现过程、目录服务、Facade 和 HTTP 接口。 |
| `ModuleProjectUnitsOption` | 配置命名检查、XML 详情解析和请求过滤。 |
| `UseRequirementLinkResolver<TResolver>()` | 把稳定需求 ID 映射为可选详情链接。 |
| `ProjectUnitsFacade` | 返回类型化列表、状态、详情、事件和枚举结果。 |
| `monica.AddProjectUnitsUI()` | 增加 `/project-units` 运维页面。 |

## 类型化 HTTP 查询

| 方法与路由 | 结果 |
|---|---|
| `GET /framework/units/dashboard` | 当前宿主身份、类型分布、独立覆盖率、拓扑、告警和待处理缺口。 |
| `GET /framework/units` | 每个已发现单元的 `ProjectUnitSummary`。 |
| `GET /framework/units/{key}` | `ProjectUnitDetail`，其中包括按需解析的需求引用。 |

`key` 是单元的 CLR 完整类型名，客户端应进行 URL 编码。响应使用 Monica `Res` 封装。原始 `Type`、`MethodInfo`、特性实例和内部 `ProjectUnit` 对象不会越过该边界。

## 状态面板

`/project-units` 的第一个 Tab 会展示：

- 来自 `IMonicaApplicationOptions` 的服务身份和版本；
- 单元总数、类型数量、元数据覆盖率、需求覆盖率和告警；
- 响应式类型分布图和彼此独立的上下文覆盖率仪表；
- 依赖边、孤立单元和诊断严重程度；
- 可打开类型化详情的覆盖缺口列表；
- 已解析和未解析的需求引用。

目录在宿主启动后保持稳定，因此采用手动刷新。页面始终只表示当前宿主，不是跨服务控制平面。

## 后续阅读

- [快速开始](./quick-start.md)
- [配置](./configuration.md)
- [Guide 与需求解析器](./guide-and-providers.md)
- [接入场景](./scenarios.md)
- [项目单元编写](../../concepts/project-unit-authoring.md)
