---
title: Configuration
description: 配置探针路径，并理解端点与快照的安全保证。
sidebar_position: 3
---

## 模块选项

| Property | Default | Purpose |
|---|---:|---|
| `EnableReadinessEndpoint` | `true` | 启用时映射就绪探针。 |
| `ReadinessPath` | `/health` | 执行 `ready` 标签检查的绝对应用路径。 |
| `EnableLivenessEndpoint` | `true` | 启用时映射存活探针。 |
| `LivenessPath` | `/alive` | 执行 `live` 标签检查的绝对应用路径。 |

已启用路径必须以 `/` 开头、不能等于 `/`，也不能包含 Query 或 Fragment。两个端点都启用时，就绪与存活路径必须不同。无效配置会让模块组合失败，而不是在运行时生成含糊路由。

```csharp
builder.AddMonica(monica =>
{
    monica.AddHealthCheck(options =>
    {
        options.ReadinessPath = "/ops/ready";
        options.LivenessPath = "/ops/live";
    });
});
```

## 探针响应契约

两个端点都禁用响应缓存并返回纯文本。状态映射固定如下：

| 聚合状态 | HTTP Status |
|---|---:|
| `Healthy` | 200 |
| `Degraded` | 200 |
| `Unhealthy` | 503 |

端点刻意允许匿名访问。保持响应最小化，并通过 Ingress、Service Mesh 或平台层控制网络可达性。

## 快照脱敏

`HealthCheckFacade` 面向已认证的运维消费者。每份快照包含聚合状态、UTC 检查时间、总耗时、计数，以及按注册名排序的条目。条目描述、诊断值与异常消息最多保留 2 KiB；Data 最多保留 32 项。Key 中包含 `password`、`secret`、`token`、`credential` 或 `connectionstring` 等凭据片段时，Value 会替换为 `[redacted]`。

异常快照只包含异常类型和有界消息。程序集信息、异常对象与 Stack Trace 不会进入 Facade 响应。
