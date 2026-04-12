---
title: Quick Start
description: 安装并注册 AutoModel。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.AutoModel
```

## 最小注册

```csharp
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddAutoModel(o =>
{
    o.EnableActiveMode = true;
});

builder.UseMonica();

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

## 第一个有价值的配置

如果你希望只暴露被明确标记的字段，优先打开 `EnableActiveMode`，然后在实体上使用 `AutoTableAttribute` / `AutoFieldAttribute`。这样能避免“所有属性都默认可筛选”的隐式暴露。

```csharp
using Monica.AutoModel.Annotations;

[AutoTable(Name = "users", ActiveMode = true)]
public sealed class User
{
    [AutoField(Title = "用户名")]
    public string UserName { get; set; } = string.Empty;

    [AutoField]
    public bool IsEnabled { get; set; }
}
```

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
