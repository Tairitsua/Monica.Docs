---
title: Configuration
description: Configure entity events and explicit unit-of-work scope semantics.
sidebar_position: 3
---

# Configuration

## Module option

| Property | Type | Default | When to change it |
|---|---|---:|---|
| `EnableEntityEvent` | `bool` | `false` | Enable only when entity-change events are part of the application's explicit domain contract. |

## Scope options

`UnitOfWorkScopeOptions` belongs to each explicit scope:

| Parameter | Default | Meaning |
|---|---:|---|
| `IsTransactional` | `true` | Starts transactions for participating DbContexts. |
| `IsolationLevel` | `null` | Uses the database-provider default when omitted. |
| `RequiresNew` | `false` | Joins the ambient scope; `true` creates an independent outer scope. |
| `Timeout` | `null` | Optional relational command timeout in milliseconds. |

```csharp
await unitOfWorkManager.RunAsync(
    ExecuteBatchAsync,
    new UnitOfWorkScopeOptions(
        RequiresNew: true,
        Timeout: 30_000),
    cancellationToken);
```

Use `RequiresNew` only when the inner operation must commit or roll back independently of an ambient transaction.
