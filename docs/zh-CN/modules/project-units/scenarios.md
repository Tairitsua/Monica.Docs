---
title: Scenarios
description: ProjectUnits 在真实业务项目里的典型写法，以及 ApplicationService、DomainService、事件与作业的组合方式。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 用显式请求 + Handler 组织业务用例

这是 Monica 最标准的业务写法：

1. 在 `Shared/.../PublishedLanguages/.../Requests/` 下定义 `Command*` 或 `Query*`
2. 在 `Application/HandlersCommand/` 或 `Application/HandlersQuery/` 下定义 `ApplicationService`
3. 把可复用规则放进 `DomainServices/`
4. 把持久化放进仓储

`Monica.Docs` 的 `GetDocTreeRequest` + `QueryHandlerGetDocTree` 就属于这个模式。对于命令场景，则继续采用同样的 `Command*` + `CommandHandler*` 组合即可。

路由建议也一并固定下来：

- 基础路由统一采用 `api/{version}/{DomainName(PascalCase)}`
- Handler 方法只写请求级路由片段
- 例如 `QueryHandlerGetDocTree` 使用 `[HttpGet("tree")]`，最终就是 `GET api/v1/Documentation/tree`
- 模块化单体把 `[assembly: AutoControllerConfig(...)]` 放在 Domain 项目根目录
- 微服务把同样的配置写在 `{Subdomain}Service.API/Program.cs`

适合：

- 用例边界清楚
- 需要 Published Language
- 以后可能继续扩展事件、作业、权限或跨域调用

## 场景 2 — 用 `CrudApplicationService` 暴露标准资源接口

如果一个资源主要就是列表、详情、创建、更新、删除，那么把它写成 CRUD 应用服务会更省力。

Monica-native 的 CRUD 服务通常有这些共同点：

- 直接继承 `CrudApplicationService<...>`
- 放在应用层的专用 CRUD 服务目录
- 由 `AutoControllers` 自动生成控制器
- 默认类名后缀是 `CrudService`

这个模式很适合后台管理资源，但不建议把复杂业务动作硬塞进去。像“审核、回滚、批量处理、跨聚合编排”这类动作，通常还是应该单独写 `Command*` + `CommandHandler*`。

## 场景 3 — 用领域事件把副作用从主流程里拆出去

例如定义 `EventDocumentPublished` 并由 `DomainEventHandlerDocumentPublished` 处理：主流程只负责发布“发生了什么”，后续写索引、推送通知、刷新读模型等副作用交给事件处理器。

这种写法的价值在于：

- 主流程更短
- 副作用更容易扩展
- `ProjectUnits` 能把事件与处理器的依赖关系直接识别出来

当事件处理器开始变重时，再继续往下拆 `DomainService` 或 `TriggeredJob`。

## 场景 4 — 用后台作业承接长流程

长时间运行、批量处理、需要进度记录或支持取消的流程，适合交给作业层。

例如：

- `CleanupExpiredDocumentsJob : RecurringJob` 表示定时后台流程
- `RebuildSearchIndexJob : TriggeredJob<RebuildSearchIndexArgs>` 表示触发式后台流程

建议职责分工如下：

- `Worker*` / `Job*` 负责调度、日志、进度、事务边界
- 实际业务规则继续交给实体和 `DomainService`

## 场景 5 — 用 Warning 模式逐步收紧命名治理

如果团队想统一应用服务、领域事件、仓储等命名规则，建议先打开 `EnableNameConvention` 并保持 `Warning`，先观察现有代码偏差，再决定是否切到 `Strict`。

如果项目同时使用 `CommandHandler*` 和 `*CrudService` 两种风格，不要急着把 `ApplicationService` 这一类切到严格模式。先把命名策略和 `AutoControllers` 后缀规则统一，再谈收紧治理。

## Common mistakes

- 把所有应用层逻辑都塞进 `CrudApplicationService`，导致真正的业务流程没有清晰边界。
- 把 `Res` 带进 `DomainService`、仓储或实体，破坏领域层边界。
- 使用 CRUD 风格应用服务，但忘了同步对齐 `CrudControllerPostfix`。
- 把请求 DTO 放在 API 项目本地，而不是 Published Language。
- 一开始就启用 `Strict` 模式，导致历史项目接入成本过高。
- 关闭 `ParseUnitDetails` 后仍然期望看到完整的单元细节和文档信息。
