---
title: Configuration
description: AutoControllers 的公开选项、默认值与必需设置。
sidebar_position: 3
---

# Configuration

## Module options

这个模块没有需要优先调整的公开 `ModuleOption` 字段；大多数使用方式集中在额外选项或 Guide 方法上。

## 额外选项 `CrudControllerOption`

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `RoutePath` | `string` | `"api/v1/[controller]"` | 否 | 你需要统一 CRUD 路由前缀时 | 影响自动生成 CRUD 控制器的默认路由模板。 |
| `CrudControllerPostfix` | `string` | `"CrudService"` | 否 | 你采用了不同的 CRUD 服务命名约定时 | 只有类名匹配该后缀的 CRUD 服务才会被自动识别。 |

补充说明：

- `CrudControllerOption.RoutePath` 只影响 CRUD 控制器。
- `ApplicationService<TRequest, TResponse>` 这类 Handler 风格入口，建议改用程序集级 `AutoControllerConfigAttribute` 固定基础路由。
- 推荐基础路由模式是 `api/{version}/{DomainName(PascalCase)}`，然后由各个 Handler 方法补充 `tree`、`doc`、`publish` 这类请求级路由片段。
