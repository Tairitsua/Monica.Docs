---
title: Scenarios
description: 选择发布或本地端点契约，并避开常见生成错误。
sidebar_position: 5
---

# Scenarios

## 发布为 RPC 的端点

把 Command 或 Query 放到 `Platform.Protocol.PublishedLanguages.Domain{Domain}.Requests`，应用 `[ApiEndpoint]`，并在协议程序集中启用需要的 `RpcClientTargets`。Monica 会生成 HTTP Controller、`I{Domain}CommandApi` 或 `I{Domain}QueryApi`，以及选中的传输实现。

只有明确的跨领域或跨进程契约才使用这种方式。

## 仅 HTTP 端点

如果其他领域不应该依赖该请求，就把带特性的请求放在 Handler 附近。Monica 仍会生成 Controller，但协议生成器不会为它发布 RPC API。

这是二进制下载、multipart 上传和内部运维端点的推荐边界。Monica.Docs 把 `QueryGetDocAsset` 保留在本地，因为它返回 ASP.NET `PhysicalFileResult`，不是可移植的 RPC 响应。

## 路由参数

路由占位符必须匹配请求属性。例如 `"orders/{OrderId}"` 要求请求存在 `OrderId` 成员。Monica 会对所有受支持 HTTP 方法验证并替换占位符。

## 显式 Handler 与约定式 CRUD 共存

标准资源使用 `ICrudApplicationService`，领域动作使用请求拥有的 `ApplicationService` Handler。流式或高度定制的 HTTP 行为仍可使用手写 `ControllerBase`。

## 常见错误

- 把 `[HttpGet]` 或 `[HttpPost]` 放在 Handler 上，而不是把 `[ApiEndpoint]` 放到请求上。
- 把领域私有请求留在 `PublishedLanguages`，意外发布 RPC 客户端。
- 在没有强类型传输设计时发布文件、表单或 `object` 端点。
- 使用不符合 `PublishedLanguages.Domain{Domain}.Requests` 的命名空间。
- 误以为生成 Http 和 Local 两套实现后会自动选择运行时传输。
