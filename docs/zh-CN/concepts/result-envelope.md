---
title: 统一结果模型 Res
description: 理解 Monica 中 `Res` / `Res<T>` 的使用边界与常见写法。
sidebar_position: 4
---

# 统一结果模型 Res

Monica 使用 `Res` / `Res<T>` 作为统一结果模型，但它并不是“所有层都要统一用”的意思。

## 推荐边界

在当前 Monica 代码约束下：

- **Facade / 面向宿主或 UI 的入口**：使用 `Res` / `Res<T>`
- **模块内部 Service**：更偏向标准返回值 + 异常

这意味着 `Res` 更像是**公开边界的返回封装**，而不是所有内部方法的默认返回类型。

## 常见写法

```csharp
public async Task<Res<UserDto>> GetAsync(Guid id)
{
    var dto = await repository.LoadAsync(id);
    if (dto is null)
    {
        return "User was not found.";
    }

    return dto;
}
```

```csharp
public async Task<Res> DeleteAsync(Guid id)
{
    await service.DeleteAsync(id);
    return Res.Ok();
}
```

## `IsFailed` 消费模式

```csharp
if ((await facade.GetAsync(id)).IsFailed(out var error, out var data))
{
    return error;
}

// 使用 data
```

## `string` 泛型返回值陷阱

当方法返回 `Res<string>` 时，不要写：

```csharp
return Res.Ok(content);
```

因为这会命中非泛型重载，导致 `Data` 丢失。应写成：

```csharp
return Res.Ok<string>(content);
```

## 什么时候不该用 Res

- 内部 Service 之间的普通协作
- Provider 层的底层实现
- 模块内部并不直接面对宿主 / UI 的纯实现细节
