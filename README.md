# Monica.Docs

Monica.Docs is intended to serve two roles at the same time:

1. The documentation site for Monica.
2. A real Monica example project that demonstrates how to build a business system as a modular monolith with a decoupled frontend and backend.

This README defines the target architecture for that direction. The backend has already been extracted into a domain-first `src/` layout, and this document describes the shape that layout should continue to converge toward.

## Project Goals

- Keep this repository useful as Monica product documentation.
- Make the backend a Monica-native modular monolith, not a generic layered app.
- Keep the frontend and backend fully decoupled.
- Start with a small, defensible v1: the frontend reads docs from backend APIs and presents them well.
- Let the repository act as a living example of how Monica should be used in a real solution.

## Current State

Today the repository already has the first modular-monolith backend extraction in place:

- `src/AppHost/Monica.Docs.Api` is the API entry project.
- `src/Domains/Documentation` is the current bounded context.
- `src/Shared/Platform.Protocol` and `src/Shared/Platform.Infrastructure` hold the shared platform language and runtime wiring.
- `docs/` contains the markdown documentation source.
- The solution still depends on Monica framework libraries from `../MoLibrary`.

That is a valid transitional step, but the structure still needs to stay disciplined as the repository grows. In particular, AppHost should remain composition-only and domain-owned application units should stay inside the owning bounded context.

## Target Architecture

### Backend

The backend should become a Monica modular monolith that follows the `monica-business-modular-monolith` rules:

- Domain-first layout, not global `Application` / `Domain` / `Infrastructure` buckets.
- Shared language in `Shared/Platform.Protocol/PublishedLanguages`.
- Domain-owned application units live under `Domains/{Subdomain}/Application/...`.
- AppHost entry projects stay composition-only.
- Clear persistence ownership per bounded context.
- No direct cross-domain references to another domain's internal implementation.

### Frontend

The frontend should be a separate web app. I recommend:

- `Next.js 15`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`

Reasoning:

- It is a strong fit for a polished docs experience.
- It supports clean route-based pages for docs.
- It stays fully decoupled from the backend and talks only over HTTP.
- It gives room for future SEO, search, and static optimization without changing the backend model.

### Content Source

For v1, the source of truth remains the existing repository content:

- `docs/**/*.md`
- `docs/attachments/**`

The backend owns parsing, normalization, and API exposure of that content. The frontend owns presentation only.

## Proposed Repository Shape

```text
src/
├── AppHost/
│   └── Monica.Docs.Api/
│       ├── Monica.Docs.Api.csproj
│       └── Program.cs
├── Shared/
│   ├── Platform.BuildingBlocks/
│   │   └── Platform.BuildingBlocks.csproj
│   ├── Platform.Infrastructure/
│   │   └── Platform.Infrastructure.csproj
│   └── Platform.Protocol/
│       ├── Platform.Protocol.csproj
│       └── PublishedLanguages/
│           └── DomainDocumentation/
│               ├── Requests/
│               ├── Models/
│               ├── Events/
│               └── AppInterfaces/          # optional, only if really needed
├── Domains/
│   └── Documentation/
│       ├── Domains.Documentation.csproj
│       ├── Application/
│       │   ├── HandlersCommand/
│       │   ├── HandlersQuery/
│       │   ├── HandlersEvent/
│       │   └── BackgroundWorkers/
│       ├── Entities/
│       ├── ValueObjects/
│       ├── Interfaces/
│       ├── Configurations/
│       ├── DomainServices/
│       ├── Repository/
│       ├── Persistence/
│       └── Providers/
└── Database/
    └── DbMigrator/
        └── DbMigrator.csproj

frontend/
└── monica-docs-web/

docs/
└── ... markdown source files ...
```

Notes:

- `frontend/` is intentionally outside the backend `src/` tree.
- `AppHost/Monica.Docs.Api` shows the preferred naming style: use the solution-specific project name directly, typically ending with `Api`.
- AppHost entry projects stay composition-only and should be kept down to the project file plus `Program.cs`.
- Domain-owned handlers and jobs live inside `Domains/Documentation/Application/HandlersCommand`, `HandlersQuery`, `HandlersEvent`, and `BackgroundWorkers`.
- `Shared/Platform.*` folders own their `Platform.*.csproj` directly. No extra `Monica.Docs.*Platform` nesting is needed there.
- `Monica.Docs.slnx` should mirror the physical `src/AppHost`, `src/Shared`, and `src/Domains` folders in solution view.
- `Database/DbMigrator` can exist even if v1 is mostly file-system based. If relational persistence appears later, ownership still stays with the owning domain.
- Do not create a separate `Documentation.Contracts` project. Shared contracts belong in `Shared/Platform.Protocol/PublishedLanguages/DomainDocumentation`.

## V1 Bounded Context

V1 should start with one real bounded context only:

- `Documentation`

This matches the Monica rule of not creating a new domain package for every page or CRUD screen. Right now the business language is centered on documentation content, navigation, metadata, and delivery. That is one bounded context.

Future bounded contexts should only be added when they have distinct language and ownership, for example:

- `Search` if search indexing and ranking become their own concern
- `Identity` if login, permissions, and authorship become real business concerns
- `Feedback` if comments, reactions, or review workflows become meaningful

## Documentation Responsibilities

### `Domains.Documentation`

Own the business concepts and rules for docs:

- query handlers and background workflows under `Application/`
- doc identity and slug rules
- doc metadata and front matter normalization
- navigation order and grouping rules
- attachment reference rules
- visibility or publication rules if introduced later
- repository implementations
- markdown providers and other technical integrations that belong only to this bounded context

### `Monica.Docs.Api`

Own the host-level composition only:

- register Monica modules
- load controllers and OpenAPI
- compose the Documentation domain into the running application

## Published Language

Cross-domain and external-facing contracts should live here:

`src/Shared/Platform.Protocol/PublishedLanguages/DomainDocumentation/`

Suggested v1 contracts:

- `Requests/GetDocTreeRequest`
- `Requests/GetDocBySlugRequest`
- `Models/DocTreeItemDto`
- `Models/DocContentDto`
- `Models/DocHeadingDto`
- `Models/DocBreadcrumbDto`

Rules:

- Keep only stable requests, DTOs, enums, events, and optional app interfaces here.
- Do not leak entities, repositories, EF mappings, or file-system details into this layer.
- The frontend must consume backend HTTP contracts, not backend internal projects.

## Backend API V1

The backend only needs a small read-only API at first.

Suggested endpoints:

- `GET /api/docs/tree`
- `GET /api/docs/{slug}`
- `GET /api/docs/assets/{**path}`

Suggested response responsibilities:

- resolve markdown from `docs/`
- expose normalized metadata from front matter
- expose heading or table-of-contents data
- resolve attachment URLs
- return a frontend-friendly document shape

The API should be documented with OpenAPI from the backend host.

## Frontend V1

Frontend v1 is intentionally simple in scope:

- call the backend API only
- render a polished docs shell
- show sidebar navigation from the backend tree
- show document content page
- show headings or table of contents
- support mobile and desktop layouts
- render code blocks and markdown content cleanly

Not required in v1:

- editing docs in browser
- authentication
- authoring workflow
- comments
- advanced search indexing

## Architecture Guardrails

These rules matter because this repository is also supposed to be a Monica example project:

- Keep the solution domain-first.
- Keep AppHost entry projects focused on composition and delivery wiring only.
- Keep domain models, repositories, providers, and persistence ownership out of AppHost.
- Keep domain-owned handlers and jobs inside the owning domain package under `Application/`.
- Keep shared business language in `Platform.Protocol`.
- Keep persistence ownership inside the owning domain.
- Do not let the frontend couple to backend implementation details.
- Do not create fake microservices inside one repository. This is one deployment, not distributed services.

## Migration Plan

1. Keep `docs/` as the source of truth.
2. Extract the backend into the domain-first modular-monolith `src/` layout.
3. Create the `Documentation` domain package and `DomainDocumentation` published language.
4. Expose the read-only docs API from `AppHost/Monica.Docs.Api`.
5. Build the separate frontend app in `frontend/monica-docs-web`.
6. Remove direct backend UI coupling once the frontend is in place.

## What This Repository Should Demonstrate

When this migration is complete, Monica.Docs should show two things clearly:

- how Monica documentation is delivered as a real product
- how a Monica business solution should be structured as a modular monolith with explicit boundaries

That is the right direction for this repository: not just docs about Monica, but a working Monica example solution that happens to be the docs product itself.
