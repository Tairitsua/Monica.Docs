---
title: Guide and providers
description: Connect repository DbContexts and understand the execution-pipeline dependency.
sidebar_position: 4
---

# Guide and providers

## Guide method

| Method | What it enables | Typical use |
|---|---|---|
| `AddDbContextProvider<TDbContext>()` | Registers the adaptive Unit of Work provider for one `RepositoryDbContext<TDbContext>`. | Connect an already registered repository context manually. |

The common path is `AddRepositoryDbContext(..., DbContextProviderType.UnitOfWork)`, which claims the Unit of Work module and adds the provider together.

## Execution Pipeline integration

The module claims `ModuleExecutionPipeline` and registers `UnitOfWorkExecutionBehavior<,>` at `ExecutionBehaviorOrder.UnitOfWork`. The behavior applies only when `ExecutionDescriptor.TransactionMode` is `Automatic`.

`Automatic` means eligible, not guaranteed: a custom execution boundary receives automatic transaction behavior only when the host has registered Unit of Work. Job and hosted-service lifecycle descriptors use `None`, so their implementations own transaction chunking.

The module does not use MVC filters or container-wide method interception. Native subsystem adapters establish the boundaries.
