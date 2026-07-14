---
title: AutoModel
description: Describe queryable model fields once and consume host-owned metadata and expression services.
sidebar_position: 1
---

# AutoModel

`Monica.AutoModel` creates host-owned model snapshots and provides dynamic expression normalization, tokenization, conversion, and EF Core or in-memory operators. AutoControllers uses it for generated CRUD querying, but it can also be registered directly.

```bash
dotnet add package Monica.AutoModel --prerelease
```

```csharp
using Monica.AutoModel.Annotations;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddAutoModel(options =>
    {
        options.EnableMinimalApi = true;
        options.EnableErrorForUnsupportedFieldTypes = true;
    });
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

[AutoTable(Name = "orders")]
public sealed class OrderView
{
    [AutoField(Title = "Order number")]
    public string Number { get; init; } = string.Empty;

    [AutoField(Title = "Customer")]
    public string CustomerName { get; init; } = string.Empty;
}
```

Passive mode is the default: eligible fields participate unless excluded. Set `EnableActiveMode = true` when only `[AutoField]` properties should participate. Properties marked `[JsonIgnore]` or `[NotMapped]` are ignored by default.

Inject `IAutoModelSnapshot<TModel>` to inspect field metadata or `IAutoModelSnapshotFactory` for the host catalog. With Minimal APIs enabled, `/auto-model/status` exposes discovered snapshots for diagnostics.

`EnableTitleAsActivateName` and `AutoFieldAttribute.TitleAsActivateName` are currently marked obsolete and not implemented; do not build application contracts around them.
