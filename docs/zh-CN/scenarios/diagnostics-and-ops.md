---
title: 组合调试与管理能力
description: 把基础设施模块与对应 UI/诊断能力配套接起来。
sidebar_position: 2
---

# 组合调试与管理能力

Monica 的很多基础设施模块都提供了配套 UI 或诊断入口。推荐做法是：**先注册基础设施模块，再按需叠加 UI 模块**。

## 典型组合

| 基础设施模块 | 配套 UI 模块 | 作用 |
|---|---|---|
| `Configuration` | `ConfigurationUI` | 配置查看、编辑、历史回滚 |
| `DataChannel` | `DataChannelUI` | 通道状态、异常、重初始化 |
| `DependencyInjection` | `DependencyInjectionUI` | 自动注册诊断快照 |
| `EventBus` | `EventBusUI` | 事件诊断与订阅检查 |
| `JobScheduler` | `JobSchedulerUI` | 作业管理、监控、执行历史 |
| `ProjectUnits` | `ProjectUnitsUI` | 项目单元、枚举、事件结构查看 |
| `SignalR` | `SignalRUI` | Hub 元数据和连接调试 |

## 一个组合示例

```csharp
builder.AddMonica(monica =>
{
    monica.AddConfiguration();
    monica.AddConfigurationUI();

    monica.AddJobScheduler()
        .UseInMemoryMetadataRepository()
        .UseSchedulerScope("local-dev")
        .UseInMemoryProvider();
    monica.AddJobSchedulerUI();
});
```

## 组合原则

- UI 模块不替代基础设施模块
- 先让基础模块跑通，再考虑运维界面
- 文档里优先看基础模块包，UI 模块通常只是围绕同一个能力提供可视化入口

## 将 Monica 管理面板隔离到运维端口

Monica 的管理面板、诊断接口和部分 Minimal API 通常面向运维人员或开发者，不应该默认暴露给所有业务用户。在完善鉴权前，推荐先把 Monica 自有端点限制到单独端口，再通过防火墙、负载均衡或内网访问策略只允许可信网络访问该端口。

```csharp
builder.AddMonica(monica =>
{
    monica.ConfigureModuleSystem(options =>
    {
        options.MonicaEndpointPort = 7100;
        options.AutoAddMonicaHttpListener = true;
        // Optional: when omitted, Monica reuses the host from an existing URL.
        // options.MonicaEndpointHost = "localhost";
    });

    // Register the infrastructure and UI modules here.
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

启用 `MonicaEndpointPort` 后，Monica 自有端点只会在该端口匹配；同一路由从其他端口访问会表现为 `404`。`AutoAddMonicaHttpListener` 默认为 `true`，会为常见单进程宿主追加一个 HTTP 监听地址，并尽量沿用宿主已有 URL 的 host。例如开发环境已有 `http://localhost:5298` 时，会追加 `http://localhost:7100`；容器环境已有 `http://+:8080` 时，会追加 `http://+:7100`。

生产环境仍应把它视为**网络层隔离**，不是鉴权替代品：

- 业务端口只暴露给业务用户，Monica 运维端口只暴露给内网、VPN、堡垒机或运维网段。
- 如果希望 Monica 运维端口使用固定 host，可设置 `MonicaEndpointHost`，例如 `localhost`、`*`、`+`、`0.0.0.0` 或具体 IP。
- 如果宿主使用显式 `Kestrel:Endpoints`、HTTPS 证书或反向代理配置，监听端口应由宿主或部署平台明确配置；此时可以关闭 `AutoAddMonicaHttpListener`。
- 后续一旦接入认证和授权，仍应继续保留端口隔离作为纵深防护。

## 常见接入问题

如果你在引入某个 `*.UI` 模块后发现页面打不开、浏览器一直转圈，先检查浏览器 Network 面板里是否出现了 `/_framework/blazor.web.js` 或 `/_content/Monica.UI/...` 的 `404`。

这类问题通常不是业务模块本身失效，而是宿主的 UI 静态资源或 Razor Components 映射没有完成。优先回到 [安装与主机接入](../getting-started/installation.md)，按其中的 UI 模块排查步骤逐项确认主机环境、`RequiresAspNetWebAssets` 和 Monica 映射流程是否完整。
