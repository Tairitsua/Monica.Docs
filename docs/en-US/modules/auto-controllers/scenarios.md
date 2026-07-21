---
title: Scenarios
description: Choose published or local endpoint contracts and avoid common generation mistakes.
sidebar_position: 5
---

# Scenarios

## Published RPC endpoint

Place a command or query under `Platform.Protocol.PublishedLanguages.Domain{Domain}.Requests`, apply `[ApiEndpoint]`, and enable the required `RpcClientTargets` in the protocol assembly. Monica generates the HTTP controller plus `I{Domain}CommandApi` or `I{Domain}QueryApi` and the selected transport implementations.

Use this only for a deliberate cross-domain or cross-process contract.

## HTTP-only endpoint

Keep the attributed request beside its handler when no other domain should depend on it. Monica still generates the controller, but the protocol generator cannot publish an RPC API for that request.

This is the preferred boundary for binary downloads, multipart uploads, and internal operational endpoints. Monica.Docs keeps `QueryGetDocAsset` local because its result is an ASP.NET `PhysicalFileResult`, not a portable RPC response.

## Route parameters

Route placeholders must match request properties. For example, `"orders/{OrderId}"` requires an `OrderId` member. Monica validates and substitutes placeholders for every supported HTTP verb.

## Conventional CRUD beside explicit handlers

Use `ICrudApplicationService` for standard resources and request-owned `ApplicationService` handlers for domain actions. Ordinary handwritten `ControllerBase` classes remain supported for streaming or highly specialized HTTP behavior.

## Common mistakes

- Putting `[HttpGet]` or `[HttpPost]` on the handler instead of `[ApiEndpoint]` on its request.
- Leaving a domain-private request under `PublishedLanguages`, which unintentionally publishes an RPC client.
- Publishing file/form/object endpoints without a typed transport contract.
- Using a namespace that does not match `PublishedLanguages.Domain{Domain}.Requests`.
- Expecting generated HTTP and local implementations to select the runtime transport automatically.
