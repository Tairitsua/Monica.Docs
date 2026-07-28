---
title: Dependency Injection
description: Register services by explicit lifetime markers and exposure rules.
sidebar_position: 1
---

# Dependency Injection

`Monica.DependencyInjection` scans business types and registers services through explicit lifetime markers or `[Dependency]`. It complements Microsoft DI; ordinary `builder.Services` registrations remain valid.

```bash
dotnet add package Monica.DependencyInjection --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.DependencyInjection.Abstractions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddDependencyInjection()
        .EnableAutoRegistrationDiagnostics();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

public interface IOrderNumberGenerator
{
    string Next();
}

public sealed class OrderNumberGenerator :
    IOrderNumberGenerator,
    ITransientDependency
{
    public string Next() => Guid.NewGuid().ToString("N");
}
```

Use `ITransientDependency`, `IScopedDependency`, or `ISingletonDependency` to make lifetime visible on the implementation. `[ExposeServices(...)]` and `[ExposeKeyedService<T>(key)]` make exposure explicit when naming conventions are insufficient. `[Dependency]` can override lifetime and choose try-register or replacement behavior.

| Option or Guide | Default | When to enable |
|---|---|---|
| `EnableAutoRegistrationDiagnostics` | `false` | Capture a host-local snapshot of conventional registrations. |
| `EnableAutoRegistrationLogging` | `false` | Emit a startup entry for each auto-registered type while diagnosing registration. |

The package also exposes `AddDynamicProxy()` and `AddInterceptor<TInterceptor>(...)` for intentional cross-cutting interception. Keep that graph explicit; do not add a proxy merely to hide ordinary service orchestration.

## Next steps

- [Registration and dynamic-proxy scenarios](./scenarios.md)
