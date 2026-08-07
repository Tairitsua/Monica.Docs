---
title: Authority
description: Configure authentication identity and enum-backed permission checks.
sidebar_position: 1
---

`Monica.Authority` contains separate Authentication, Authorization, and CORS modules. Authentication supplies JWT bearer support and requires an explicit system-user definition. Authorization maps a flags enum to a configured claim type.

```bash
dotnet add package Monica.Authority --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddAuthentication(options =>
        {
            options.Secret = builder.Configuration["Auth:Secret"]
                ?? throw new InvalidOperationException("Auth secret is required.");
            options.Issuer = "orders-api";
            options.Audience = "orders-clients";
        })
        .ConfigDefaultSystemUser();

    monica.AddAuthorization<OrderPermission>("permissions");
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

[Flags]
public enum OrderPermission
{
    None = 0,
    Read = 1,
    Approve = 2
}
```

Access tokens default to 60 minutes and refresh tokens to 120 minutes. The source defaults for secret, issuer, and audience are placeholders for development—not production credentials. Supply a stable secret through protected configuration and validate rotation and audience policy for the deployment.

`AddPermissionBit<TEnum>(claimType)` adds another permission family. `ConfigAsAlwaysAllow()` deliberately bypasses checks and should be limited to isolated development or tests. Authorization contributes `ExecutionAuthorizationBehavior<,>` to the shared [Execution Pipeline](../execution-pipeline/index.md) for business-operation descriptors. Endpoint policies still use normal ASP.NET Core authorization.

Bearer tokens are read from the `Authorization` header by default. Browser WebSocket transports that cannot set that header may opt in with `AllowQueryStringAccessTokens("/hubs/orders")`. Scope every prefix to one mapped hub route: query-string tokens can otherwise leak through browser history, proxy logs, and server access logs. Monica does not expose an HTTP token-decoding endpoint.

Use `AddCors()` and its Guide configuration only when cross-origin callers are required; prefer an explicit origin policy over permissive production defaults.
