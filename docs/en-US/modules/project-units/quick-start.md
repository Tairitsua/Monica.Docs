---
title: Quick Start
description: Register ProjectUnits, annotate a unit, and inspect the typed dashboard and APIs.
sidebar_position: 2
---

# Quick Start

## Install

```bash
dotnet add package Monica.ProjectUnits --prerelease
dotnet add package Monica.Framework.UI --prerelease
```

The UI package is optional when the host only needs APIs or facade access.

## Register the module

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.ProjectUnits.Models;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddProjectUnits(options =>
    {
        options.ConventionOptions.EnableNameConvention = true;
        options.ConventionOptions.NameConventionMode = ENameConventionMode.Warning;
    });

    monica.AddProjectUnitsUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

## Annotate each discovered unit

```csharp
using Monica.ProjectUnits.Annotations;

[ProjectUnitMetadata(
    "Approve Order",
    Owner = "Ordering Team",
    Description = "Approves an eligible order.",
    Tags = ["ordering", "approval"])]
[ProjectUnitRequirement("ORD-REQ-001")]
public sealed class CommandHandlerApproveOrder(
    DomainOrderApproval domainService)
    : ApplicationService<CommandApproveOrder>
{
    public override async Task<Res> Handle(
        CommandApproveOrder request,
        CancellationToken cancellationToken)
    {
        await domainService.ApproveAsync(request.OrderId, cancellationToken);
        return Res.Ok();
    }
}
```

Add separate metadata to the request, domain service, entity, repository implementation, event, handler, job, and configuration involved in the same feature. Reuse stable requirement IDs where the requirement genuinely traces to each unit.

## Inspect the result

Open `/project-units`; **Status Overview** is the first tab. API clients can use:

```http
GET /framework/units/dashboard
GET /framework/units
GET /framework/units/Ordering.Application.CommandHandlerApproveOrder
```

An empty catalog reports no data. A non-empty catalog exposes each missing context dimension independently so adoption can proceed without blocking startup.
