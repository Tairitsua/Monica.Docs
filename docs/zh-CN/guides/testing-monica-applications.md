---
title: 测试 Monica 应用
description: 在宿主级应用场景、原始 ProjectUnit Fixture 与 UI 组件测试之间选择正确边界。
sidebar_position: 2
---

# 测试 Monica 应用

`Monica.Testing` 明确提供两种不同的测试边界：完整 Monica 宿主用于验证运行时相关的应用场景，原始 `ProjectUnitFixture<TUnit>` 用于聚焦单个项目单元及其显式协作者。应根据需要证明的行为选择边界，而不是只看被测类的名称。

## 选择最小但真实的边界

| 测试需要证明什么 | 推荐边界 |
|---|---|
| Entity、值对象或纯领域行为 | 直接构造对象 |
| 一个 ProjectUnit 与显式替身之间的协作 | `ProjectUnitFixture<TUnit>` |
| 模块组合、类型发现、执行管线行为、Option、代理、持久化或宿主生命周期 | `MonicaTestApplicationFactory<TDiscoveryAnchor>` |
| Razor 组件渲染与交互 | bUnit；需要 Monica UI 替身时再加入 `Monica.Testing.UI` |

不要用原始 Fixture 声称生产组合已经通过验证；反过来，验证一个纯实体不变式也不需要启动完整宿主。

## 安装

在测试项目中添加核心工具包：

```bash
dotnet add package Monica.Testing
```

只有 UI 测试项目需要 Monica 专用 UI 替身时，才添加 UI 包：

```bash
dotnet add package Monica.Testing.UI
```

`Monica.Testing.UI` 不会替代 bUnit。它只是把 `TestThemeState` 等 UI 专用支持从核心测试包中隔离出来。

## 创建完整的宿主级场景

先派生一个可复用 Factory，用它描述测试套件要执行的生产组合。Factory 只是组合配方；每次调用 `CreateAsync(...)` 都会创建并启动一个全新的应用，该应用独立拥有自己的服务提供程序、Monica 模块图、单例与作用域。

```csharp
using Microsoft.Extensions.DependencyInjection;
using Monica.Core.Modularity.Abstractions;
using Monica.Modules;
using Monica.Testing.Hosting;

public sealed class OrdersTestApplicationFactory
    : MonicaTestApplicationFactory<QueryHandlerGetOrder>
{
    protected override void ConfigureMonica(IMonicaBuilder monica)
    {
        monica.AddWebApi();
        monica.AddProjectUnits();
    }

    protected override void ConfigureServices(IServiceCollection services)
    {
        base.ConfigureServices(services);
        services.UseTestDatabase<OrdersDbContext>();
    }
}
```

一个独立配置的场景创建一个应用，再从这个应用的作用域中解析 ProjectUnit：

```csharp
var gateway = Substitute.For<IOrdersGateway>();
gateway.GetAsync(42, Arg.Any<CancellationToken>())
    .Returns(new OrderSnapshot(42, "Ready"));

await using var application = await factory.CreateAsync(
    seams => seams.With<IOrdersGateway>(gateway),
    TestContext.Current.CancellationToken);

await using var scope = application.CreateScope(
    TestContext.Current.CancellationToken);

var handler = scope.Resolve<QueryHandlerGetOrder>();
var result = await handler.Handle(
    new GetOrderRequest(42),
    scope.CancellationToken);
```

必须先释放作用域，再释放拥有它的应用。作用域只能从已经构建好的宿主解析服务，不会修改注册。

## Factory 扩展点与所有权

| 扩展点 | 职责 |
|---|---|
| `ConfigureHost(WebApplicationBuilder)` | 在 Monica 组合前提供宿主配置、环境输入或宿主级服务。 |
| `TypeDiscoveryAssemblies` | 声明 Monica 应扫描的生产程序集；默认包含发现锚点所在程序集。 |
| `ConfigureMonica(IMonicaBuilder)` | 组合当前场景真正执行的生产模块。 |
| `ConfigureServices(IServiceCollection)` | 在模块注册后、宿主构建前注册稳定的测试 Provider 与边界替身；应调用 `base.ConfigureServices(...)`。 |
| `CreateAsync(configureScenario, cancellationToken)` | 在构建并启动新宿主前应用当前场景专属的最终替换。 |

当一个场景跨越多个生产程序集时，应显式声明发现边界：

```csharp
protected override IEnumerable<Assembly> TypeDiscoveryAssemblies =>
[
    typeof(QueryHandlerGetOrder).Assembly,
    typeof(BillingPublishedLanguageAnchor).Assembly
];
```

不要从已经构建的宿主复制服务描述，也不要把一个宿主的 `MonicaApplication` 接到另一个服务提供程序。宿主所有权就是隔离边界。

## 在构建前替换外部边界

场景回调只提供构建前替换操作：

| 方法 | 生命周期与用途 |
|---|---|
| `With<TService>(instance)` | 用场景拥有的单例实例替换服务。 |
| `With<TService>(factory)` | 用 scoped factory 替换服务。 |
| `Substitute<TService>(out service)` | 创建并注册一个 NSubstitute 单例。 |
| `WithHttpClient(name, client)` | 为 HTTP 适配器边界注册命名客户端；可以同时保留多个名称。 |

替换对象应集中在真实外部边界，例如远程 Gateway、时钟、当前用户上下文或需要显式控制的基础设施。如果应用服务、领域服务、仓储行为和 Monica 运行时路径正是场景要验证的主体，就应保持它们为真实实现。

## 隔离持久化

在 `ConfigureServices(...)` 中注册测试数据库：

```csharp
services.UseTestDatabase<OrdersDbContext>();
```

| 隔离模式 | 行为 | 典型用途 |
|---|---|---|
| `PerScopeDatabase` | 每个作用域创建全新的 SQLite 内存数据库；这是默认值。 | 独立测试与并行执行。 |
| `SharedDatabaseWithTransaction` | 共享一个由宿主拥有的 SQLite 数据库，并在每个作用域释放时回滚事务。 | 需要共享初始化结构，同时保留作用域回滚的场景。 |
| `RealDatabase` | 必须改用 `UseRealTestDatabase<TDbContext>(...)`；Provider 与清理策略由调用方选择并拥有。 | Provider 专属的集成检查。 |

作用域可以向唯一注册的 Repository DbContext 写入种子数据，或显式解析它：

```csharp
await scope.SeedAsync(order);
var dbContext = await scope.GetDbContextAsync<OrdersDbContext>();
```

如果场景注册了多个 Repository DbContext，应解析目标 DbContext 并直接写入数据。

## 有意识地使用原始 ProjectUnit 快速路径

`ProjectUnitFixture<TUnit>` 会构建一个小型 Microsoft DI Provider，提供确定性的核心测试替身，激活目标对象，并在目标支持时设置 Monica cached service provider。

```csharp
var fixtureBuilder = ProjectUnitFixture<DomainCalculateOrderTotal>
    .Builder()
    .WithSubstitute<IPriceCatalog>(out var priceCatalog);

priceCatalog.GetUnitPriceAsync("SKU-42", Arg.Any<CancellationToken>())
    .Returns(12.50m);

await using var fixture = fixtureBuilder.Build();
var total = await fixture.Unit.CalculateAsync(
    "SKU-42",
    quantity: 2,
    TestContext.Current.CancellationToken);
```

这条快速路径明确**不会**运行 Monica 模块组合、生产类型发现、统一执行管线、约定注册、Option 绑定或 Hosted lifecycle。只要预期行为依赖授权、路由、UnitOfWork、追踪、其他执行行为、服务激活或任何被跳过的运行时能力，就应使用完整宿主。框架不再提供另一套 ApplicationService 专用 Fixture。

## 并行执行

独立应用可以并行运行，因为每个应用都拥有完整的运行时图。可变替身、数据库名称、端口、文件、队列等外部资源标识必须在场景间保持唯一。只有真正位于应用边界之外且必须共享的资源才需要串行化。

## 相关页面

- [Module 模式与主机边界](../concepts/module-pattern.md)
- [执行边界](../concepts/execution-boundaries.md)
- [项目单元编写](../concepts/project-unit-authoring.md)
- [模块目录](../modules/index.md)
