---
title: Repository redesign migration
description: Migrate application writes to operation-owned transactions, tracked aggregates, save policies, and durable notifications.
sidebar_position: 4
---

This breaking change in Monica.Repository, Monica.Core execution, Monica.WebApi CRUD, and Monica.Testing replaces ambient context switching with one operation scope, tracked aggregate mutation, and optional durable notifications. FIPS2022 consumer-specific changes and rollout requirements belong to that application's repository; this guide describes the Monica contract.

## Operation ownership

Register application write contexts with `AddRepositoryDbContext<TContext>(...)`. Its default is now `DbContextProviderType.UnitOfWork`, which also enables the UnitOfWork module. Both provider modes return the directly registered scoped context. The `Default` mode is for independently managed infrastructure stores, such as the scheduler and configuration database.

The existing `IExecutionPipeline` owns the write boundary. A request, job, message, or test must resolve its pipeline, handler, repositories, and contexts from the same scope. A job or standalone caller creates that scope **before** resolving the handler:

```csharp
await using var scope = scopeFactory.CreateAsyncScope();
var pipeline = scope.ServiceProvider.GetRequiredService<IExecutionPipeline>();
var descriptor = ExecutionDescriptor.ForMethod<ExecutionUnit, ExecutionUnit>(
    new ExecutionPoint("Orders.Approve"), typeof(ApproveOrder), null,
    isBusinessOperation: true, transactionMode: ExecutionTransactionMode.Automatic);

await pipeline.ExecuteAsync(descriptor, ExecutionUnit.Value, null, async () =>
{
    var handler = scope.ServiceProvider.GetRequiredService<ApproveOrder>();
    await handler.ExecuteAsync(orderId, cancellationToken);
}, cancellationToken);
```

For request handlers already routed through Monica's mediator, resolve `IMediator` inside the scope and call `Send`. Do not wrap it in a second infrastructure pipeline.

The scoped `IUnitOfWorkManager.RunAsync` remains available to custom adapters. Nested calls join the current transaction. Any nested exception or failed result makes it rollback-only, even if caught. After success or failure the manager is terminal: resolve a fresh scope for the next operation or retry. Context save failures also fault the context. Native EF queries, raw SQL and set-based writes enforce the same terminal scope lifetime; verification uses a new scope. Parallel operations require separate scopes.

Use `manager.Current!.FlushAsync(token)` only when generated values or early constraint checks are needed. It does not commit. Direct `DbContext.SaveChangesAsync` inside the operation uses that same transaction.

Entity projections registered with an asynchronous callback require `SaveChangesAsync` or normal asynchronous operation completion. A synchronous save with an enabled async projection fails before database I/O. Synchronous callbacks and saves with projection capture suspended continue to support `SaveChanges()`.

Returned `IResultEnvelope` failures roll back; both `Ok` and `Created` are success. Custom result adapters implement `IExecutionOutcome.ShouldRollback`. The MVC adapter recognizes failed ObjectResult/JsonResult envelopes, error status codes, and handled exceptions. Prefer exceptions inside business operations and map errors at the public boundary.

`[ReadOnlyOperation]` on a mediator request/handler or MVC action disables the automatic write transaction. Direct MVC GET, HEAD, and OPTIONS are read-only by default; generated mediated query requests should carry the attribute. Native query enumeration must finish before its DI scope is disposed. The read-only marker is transaction policy, not database authorization.

## Local transaction guarantees

Without explicit selection the operation permits zero or one UnitOfWork-registered context. Zero supports compositions with domain effects but no relational writes; it does not make process-local dictionaries transactional.

When several write contexts are registered, pass `UnitOfWorkScopeOptions(DbContextTypes: [typeof(OrdersDbContext)])` to the manager, or set those options in the pipeline's `ExecutionFeatureCollection`. Multiple explicitly selected contexts must share the **same DbConnection object** and relational provider. Monica begins one transaction and enlists the other contexts with EF's `UseTransaction`. Independent connections, databases, and shards are rejected before the handler runs. There is no `RequiresNew` ambient switch.

The boundary must own its transaction. It rejects a transaction started before `RunAsync`; direct saves inside caller-owned EF transactions remain supported. Non-relational providers cannot claim transaction support. No distributed-transaction or ShardingCore guarantee is implied.

## Repository API

| Removed pattern | Replacement |
| --- | --- |
| `InsertAsync`, `InsertManyAsync` | `Add(entity)`; loop explicitly for a batch |
| Detached `UpdateAsync`, `AttachAsync` | Load a tracked aggregate, then change it |
| `DeleteAsync` | Load, then `Remove(entity)` |
| Repository `SaveChangesAsync` | Operation completion; `Current.FlushAsync` for an early flush |
| `IRepositoryRead`, `RepositoryBase`, `EfRepositoryRead` | Native LINQ within infrastructure |
| Repository `ExecuteDelete/ExecuteUpdate` | Explicit technical EF operations with documented invariant handling |
| `SaveChangesOnDbContextAsync` | Normal save; it has no policy bypass |
| `Initialize` / tracking-time policy overrides | `IPersistencePolicy` for explicit save-time storage extensions |
| Ambient publishers and `EnableEntityEvent` | Explicit domain queue or optional outbox |
| `OnCompleted` callback publishing | Durable outbox capture and separate delivery |

`IRepository<TEntity>` exposes only Add/Remove. Its keyed variant adds tracked FindAsync/GetAsync. `EfRepository<TContext,TEntity,TKey>` takes the scoped context directly. A domain-specific interface may extend this small contract or define its own purposeful aggregate-loading methods.

`IEfEntityStore<TEntity,TKey>` is for infrastructure CRUD/query adapters. It exposes Context, a native no-tracking Query, and the sharding query flag. Use explicit `AsTracking()` for infrastructure mutation queries. Return projections from business query interfaces; do not return live IQueryable across scope boundaries.

Generated CRUD create flushes within its transaction before mapping generated identifiers. CRUD bulk deletion now loads and removes tracked rows, honoring soft deletion and audit rules. Physical purge and large set-based repair remain explicit EF operations: they bypass save policies, aggregate invariants, concurrency stamps, and notification capture. The caller must implement the intended semantics.

## Save policies

The sealed save methods run a fixed sequence: detect/cascade changes, retain owned data for soft deletion, rewrite deletes, stamp audit/version/concurrency, run explicit storage policy extensions, persist business rows, then capture finalized outbox projections and persist them.

- The real audit policy uses `ICurrentUser` and `TimeProvider`. New timestamps default to **UTC**, a behavior change from the previous host wall clock; existing stored dates are not rewritten. Hosts that store local wall-clock audit timestamps configure the deployment timezone once through the Clock module (`monica.AddClock(options => options.LocalTimeZone = CommonTimeZone.China)`). The value is converted from UTC on every stamp and never reads the host's operating-system timezone; every host writing the same database must configure the same zone, and outbox/inbox bookkeeping stays UTC regardless.
- Repeated successful flushes advance versions and accept the new concurrency token. Original tokens survive until persistence succeeds. If an API accepts a client version/ETag, validate it explicitly against the loaded aggregate; EF's token only detects concurrent database changes after that load.
- `DbUpdateConcurrencyException` retains its concrete type and entries.
- The caller's AutoDetectChangesEnabled setting is restored. When disabled, the caller must explicitly mark its own changes; policy changes are still persisted.
- Immediate/deferred cascade changes are captured before applying policies. `CascadeTiming.Never` remains a protection against implicit orphan deletion. Combining `Never` with `OnSaveChanges` across the two timing settings is rejected before writing; use `Immediate` for the enabled behavior in that combination. EF's public `CascadeChanges()` forces both behaviors, so silently resolving that mixed setting would remove the protection. See [EF cascade guidance](https://learn.microsoft.com/en-us/ef/core/change-tracking/relationship-changes#fixup-for-added-or-deleted-entities).
- `SaveChanges(false)` and its async equivalent throw before writing. Retrying uses a new scope, not an unaccepted tracker.
- Removing a soft-delete root discards its unflushed scalar edits and retains/restores its owned dependents. Cascading a physical deletion into another tracked non-owned aggregate is rejected; configure Restrict and express deletion explicitly. Database-side cascades for unloaded dependents remain the application's mapping responsibility.
- `query.IncludeSoftDeleted()` disables only the named `Monica.SoftDelete` filter. Tenant/security filters remain active.
- `IPersistencePolicy.Apply(context, changes)` may stamp the captured entries after built-in policies. It must not change the graph, recurse into SaveChanges, enqueue domain effects, or publish messages. Assign routing keys required by a sharding provider before routing.

## Domain effects and durable notifications

`IDomainEventQueue.Enqueue<TEvent>` is for explicit business effects. Register scoped `IDomainEventHandler<TEvent>` implementations with `AddUnitOfWork().AddDomainEventHandler<TEvent,THandler>()`. They run in the publisher's scope before the final flush. Newly queued effects are drained too; MaximumDomainEvents defaults to 1024 and aborts cycles. These handlers must avoid external side effects.

Opt into outbox storage per relational context:

```csharp
[Outbox]
[EventName("orders.approved.v1")]
public sealed record OrderApprovedV1(long OrderId);

builder.AddMonica(monica =>
{
    monica.AddRepository()
        .AddRepositoryDbContext<OrdersDbContext>((_, db) => db.UseSqlite(connectionString))
        .AddOutbox<OrdersDbContext>();
});

// In an operation that uses OrdersDbContext:
await bus.PublishAsync(new OrderApprovedV1(order.Id), cancellationToken: cancellationToken);
```

Configure the existing EventBus provider alongside Repository. Create an application EF migration for `MonicaOutbox` before deployment. Repository does not own a concrete application's migrations or update a production database.

`[Outbox]` is a delivery policy on a normal EventBus payload. The scoped bus prepares immutable JSON at publish time and stages it on the operation's selected primary context. Publish completion means staged acceptance; the message becomes visible after commit. Publishing without an active, healthy local transaction or an Outbox-enabled primary context throws. Plain unmarked messages retain immediate delivery. The transport and handlers receive the ordinary event type, with optional scoped `IEventDeliveryContext` for identity. Durable local events use the same marker and `ILocalEventBus`.

The transactional sink validates ownership, prepares the complete publish batch, and stages its snapshots as one operation. A preparation or staging failure marks the operation rollback-only even if application code catches the exception.

When a handler host registers several write contexts, put `[UnitOfWorkContext(typeof(OrdersDbContext))]` on its automatically transactional handler (or entry method) to select the primary store. Additional context types may follow when they share that physical connection and transaction. An explicit `UnitOfWorkScopeOptions` execution feature overrides the attribute. This lets `[Inbox]` receipts, business writes, and outgoing `[Outbox]` events share the selected transaction.

For entity notifications, configure `AddEntityEventProjections<TContext>(options => options.RegisterEntity<TEntity,TEvent>(...))` separately from `AddOutbox`. The callback receives `PersistenceChange` after generated values exist; it must return an ordinary `[Outbox]` event with stable EventBus naming and a detached DTO payload. An async callback may query or stage source-side bookkeeping through `change.Entry.Context`, but must not save, commit, or publish. The saving context and primary Outbox owner flush inside the same physical transaction, including when another participant captures a projection after the owner was first flushed. Seed scopes explicitly suppress projections. The transaction-local `IDomainEventQueue` remains separate from durable transport delivery.

Monica starts one hosted Outbox worker for configured stores. Each store is scanned on its own `PollInterval` in a fresh scope. The worker atomically claims due rows, invokes the selected provider or local receive dispatcher directly, and acknowledges only the matching lease. A failed row gets bounded backoff and does not block unrelated rows. Pending count, oldest age, and last failure appear in the hosted-service state. Pending messages remain until delivered; only acknowledged rows older than `DeliveredRetention` are pruned. `DeliveryLease`, `BatchSize`, `PollInterval`, retry delays, and retention are operational options on `AddOutbox<TContext>`.

Delivery is **at least once**. Message ID, source, topic, provider key, and body stay stable through retry; a transport may accept a send before acknowledgment is lost. The Outbox sequence is a storage key, not an application revision or ordering promise.

Consumers that need database deduplication can mark ordinary handlers `[Inbox("orders.projection.v1")]` and configure `AddInbox<OrdersDbContext>()`. Inbox requires stable incoming source and message identity. The receipt's `(consumer, source, message ID)` key is unique and commits with business changes and outgoing Outbox rows in the same operation. A concurrent duplicate that loses the database uniqueness race rolls back and retries in a fresh scope. Retain receipts for the full replay horizon; pruning them permits reprocessing. External effects still need their own idempotency controls.

Transport failure does not undo committed business state. Unsupported transaction ownership or provider capabilities fail clearly; there is no direct-publish fallback for marked events.

## Test migration

Use one `MonicaTestApplication` per scenario. `UseTestDatabase<TContext>()` overrides provider options while retaining production context/provider registration; one named SQLite memory database is kept alive per scenario/context type. Each scope uses its own connection. Supply any additional EF options/interceptors through its configureOptions callback. UseRealTestDatabase replaces options without creating or cleaning schema.

Arrange with `application.SeedAsync<TContext,TResult>`, saving explicitly inside the callback and returning IDs/DTOs. Act with `application.ExecuteAsync`, which creates a fresh scope and invokes the production IExecutionPipeline. Assert with `application.VerifyAsync<TContext>` in a third scope. Do not clear trackers to make application tests pass.

The old scope.InvokeAsync, scope.SeedAsync, per-scope database modes, and synthetic test save loop are removed. Default test seams retain production audit behavior; replace clock/user/ID inputs instead. Assert outbox capture separately, then use `application.DrainOutboxAsync<TContext>()` to test delivery deterministically.

The in-memory reference application remains a non-durable demonstration and publishes its local event directly after its dictionary update. It makes no rollback or outbox claim.

## Validation record

The integrated change was validated on 2026-09-23 with .NET SDK 10.0.302 and EF Core 10.0.12. The complete Monica Release solution build produced zero warnings and zero errors; 1,922 tests passed across 30 projects with no failures or skips. Canonical skill validation, projection synchronization checks, and skill tests passed.

A downstream consumer additionally validated the actual ShardingCore 7.10.2.2 package, including direct outbox saves and operation commit/rollback with SQLite; its full suite passed with only external-database tests skipped. Those production-provider tests require an explicitly configured disposable database, and the consumer's own repository records its limits, migration SQL, and deployment prerequisites.
