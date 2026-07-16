# Monica.Docs Architecture Spec

Monica.Docs is both Monica's public documentation product and an executable example of a Monica modular monolith. This specification describes the architecture that is implemented in this repository.

## Product boundaries

The repository contains three deliberately separate deployable surfaces:

1. `frontend/monica-docs-web` is the public product site and documentation reader.
2. `src/AppHost/Monica.Docs.Api` is the read-only public documentation API.
3. `src/AppHost/Monica.Docs.Demo` is a broad, resettable demo host for exploring Monica modules and UI.

The public API must never acquire demo, admin, mutation, local-RPC, or operational-dashboard endpoints. Demo behavior belongs to the demo host and the `Showcase` bounded context.

## Technology baseline

- Next.js 16 and React 19
- TypeScript and Tailwind CSS 4
- .NET 10 and ASP.NET Core
- Monica host-bound composition through `builder.AddMonica(...)`
- Repository Markdown under `docs/` as the content source of truth

The website and API are independently deployable. The frontend consumes only HTTP contracts and never references backend projects or types.

## Repository shape

```text
docs/                                      localized Markdown source
frontend/monica-docs-web/                  public Next.js website
src/
├── AppHost/
│   ├── Monica.Docs.Api/                   read-only production API
│   └── Monica.Docs.Demo/                  broad demo host
├── Domains/
│   ├── Documentation/                     public documentation behavior
│   ├── Showcase/                          demo-only jobs and examples
│   └── LocalRpcProvider/                  demo-only local RPC boundary
└── Shared/
    ├── Platform.BuildingBlocks/
    ├── Platform.Infrastructure/
    └── Platform.Protocol/
        └── PublishedLanguages/
            └── DomainDocumentation/       stable public requests and DTOs
```

AppHost projects are composition roots. Query handlers, domain services, repositories, and content rules remain in `Domains/Documentation`. Stable external contracts remain in `Platform.Protocol`.

## Content delivery flow

```text
docs/**/*.md
    -> Monica Markdown catalog
    -> Documentation repository and processors
    -> read-only HTTP contracts
    -> Next.js server components and asset proxy
    -> localized public routes
```

The backend owns source discovery, locale resolution, navigation ordering, slug normalization, Markdown metadata, heading extraction, search ranking, and safe asset resolution. The frontend owns presentation, interaction, fallback content, SEO metadata, and route localization.

The documentation root is resolved in this order:

1. `DocumentationApi:DocsBasePath`
2. `DocumentationApi:PreferredDocsMountPath` (default `/docs`)
3. repository-relative development paths

In container deployments, mount the repository documentation at `/docs` or set `DocumentationApi__DocsBasePath` explicitly.

## Public API

The public API exposes only read operations:

- `GET /api/v1/Documentation/locales`
- `GET /api/v1/Documentation/tree?locale={culture}`
- `GET /api/v1/Documentation/doc?locale={culture}&slug={slug}`
- `GET /api/v1/Documentation/search?locale={culture}&query={query}`
- `GET /api/v1/Documentation/assets?assetPath={path}`
- `GET /healthz`

Document responses include canonical public paths, locale alternates, headings, breadcrumbs, and previous/next navigation. Asset responses are traversal-protected, MIME-aware, range-enabled, and emit `ETag` and `Last-Modified` validators.

Production constraints:

- CORS allows only configured website origins.
- Requests are rate limited by the trusted client address.
- Forwarded headers are accepted only from configured/trusted proxy networks.
- Successful documentation JSON and asset responses receive explicit public cache policy.
- Problem details handle unhandled failures without exposing demo behavior.

The public host composes only the modules needed for documentation delivery:

```csharp
builder.AddMonica(monica =>
{
    monica.ConfigureTypeDiscovery(options =>
        options
            .ExcludeDefault()
            .Add(typeof(QueryHandlerGetDocTree).Assembly));

    monica.AddResultEnvelope();
    monica.AddDependencyInjection();
    monica.AddMediator();
    monica.AddAutoControllers();
    monica.AddSwagger();
    monica.AddCors();
    monica.AddMarkdown(options => options.ParseFrontMatter = true)
        .EnableMultilingualDocuments()
        .AddDocumentGroup("monica", "Monica Docs", docsBasePath);
});
```

## Demo host

`Monica.Docs.Demo` is an integration showcase, not a production API. It may compose Monica UI, Configuration, JobScheduler, synchronization workers, local RPC, and other exploratory surfaces. Its state can be reset and its dependency graph can be intentionally broad.

Moving a capability into the demo host does not authorize exposing it through `Monica.Docs.Api`. Shared code must remain read-oriented unless it is owned by a demo-only bounded context.

## Frontend routes

The website provides first-class English and Simplified Chinese launch routes:

- `/` and `/zh-CN`
- `/docs` and `/zh-CN/docs`
- `/docs/[...slug]` and `/zh-CN/docs/[...slug]`
- `/modules` and `/zh-CN/modules`
- `/reference` and `/zh-CN/reference`
- `/roadmap` and `/zh-CN/roadmap`

The homepage uses a technical-editorial visual system and interactive architecture evidence rather than a generic feature grid. Runtime snapshots are labeled as examples and align with the executable Ordering reference application.

When `MONICA_DOCS_API_URL` is configured, server-side readers use the public API with bounded request timeouts and revalidation. When it is absent or temporarily unavailable, a small curated launch guide keeps critical routes usable. The fallback is a resilience layer, not a second complete content source.

The frontend also owns:

- localized metadata, canonical routes, language alternates, sitemap, and robots policy
- accessible keyboard interaction and reduced-motion behavior
- local font and icon assets with no browser-loaded CDN dependency
- documentation search proxying with no-store result responses
- a validated asset proxy that preserves byte ranges and cache validators
- redirects for the previous documentation URLs

## Content language policy

English is the default language for the public launch routes and core adoption guides. Simplified Chinese remains a first-class, broader documentation corpus. Host composition, package maturity, templates, the reference application, and Stable user-facing capabilities must not contradict each other across languages.

An untranslated page is preferable to an inaccurate machine-shaped duplicate. New pages must be grounded in current source, use the host-bound composition API, and avoid presenting Labs contracts as Stable.

## Architecture guardrails

- Keep both AppHost projects composition-only.
- Keep public documentation behavior inside the Documentation bounded context.
- Keep demo jobs and mutations outside the public API graph.
- Keep external contracts in `Platform.Protocol`; do not leak entities or repositories.
- Keep the frontend coupled only to HTTP contracts.
- Preserve one-way project references and do not create fake microservices inside one deployment.
- Treat Stable, Integrations, and Labs as release promises, not marketing adjectives.
- Keep the framework package manifest authoritative; review the mirrored website catalog whenever it changes.
- Use `app.UseMonica()` and `app.MapMonica()` only after `builder.Build()`.

## Verification

Backend:

```bash
dotnet build Monica.Docs.slnx -m
```

Frontend:

```bash
cd frontend/monica-docs-web
npm run check
npm audit --omit=dev
```

Release review also exercises localized tree/document/search routes, asset validators and ranges, CORS, cache headers, the public API's absence of Showcase endpoints, responsive layouts, keyboard interaction, and the separate demo host.

## Future boundaries

Create another bounded context only when it owns distinct language and lifecycle. Examples might include author feedback, identity, or a separately operated search index. Editing, authentication, comments, and authoring workflows are intentionally outside the current public product.
