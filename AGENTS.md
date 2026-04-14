# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Project Snapshot

Monica.Docs is both:

- the documentation project for Monica
- a live demo host for Monica modules, including UI-backed demos
- a teaching/demo repository for the `monica-business-modular-monolith` and `monica-project-unit-development` skills

The repository intentionally depends on sibling Monica source projects in `../MoLibrary`.

Key facts for navigation:

- `Monica.Docs.slnx` is the only solution file. It includes the Monica.Docs projects and the top-level Monica projects from `../MoLibrary`, including UI projects such as `Monica.Framework.UI`, so the repository can run as a full docs-and-demo workspace.
- User-facing communication in this repository should be in English.

## Monica Integration

- This repository is expected to exercise Monica features directly, including framework demos and UI demos.
- Direct `ProjectReference` links into `../MoLibrary` are intentional. Do not remove Monica UI references merely to suppress IDE restore errors.
- If the root cause is in Monica, prefer fixing it in `../MoLibrary` instead of adding a Monica.Docs-only workaround.
- You may inspect and modify `../MoLibrary` when the real issue lives there.

## Skill Usage

- Use `monica-business-modular-monolith` whenever the task involves solution structure, `Domains/` boundaries, `Platform.*` placement, the strict project reference chain, AppHost composition, or published-language collaboration.
- Use `monica-project-unit-development` whenever the task involves creating or changing `ApplicationService`, request DTOs, domain services, entities, repositories, domain events, handlers, configurations, or jobs.
- This repository should actively demonstrate those two skills in practice. Do not introduce local conventions that conflict with them.

## Architecture Rules

- Keep the strict project reference chain `AppHost -> Domains.{Subdomain} -> Platform.Infrastructure -> Platform.Protocol -> Platform.BuildingBlocks`.
- Keep project-common Monica references in `src/Shared/Platform.BuildingBlocks/Platform.BuildingBlocks.csproj`.
- Keep subdomain-only dependencies in the owning domain project.
- Keep AppHost entry projects composition-only.
- Keep Monica.Docs-owned projects grouped under the physical `src/AppHost`, `src/Shared`, and `src/Domains` layout inside the solution view, even though the solution also loads Monica dependencies from `../MoLibrary` for demo purposes.
- Keep domain-owned application units in `Application/HandlersCommand`, `Application/HandlersQuery`, `Application/HandlersEvent`, and `Application/BackgroundWorkers`.
- Keep repository implementations in `Repository/`, and keep pure helper code in `Utilities/` with `Utils*` names when adding new utility helpers.

## Build and Run

```bash
dotnet restore Monica.Docs.slnx
dotnet build Monica.Docs.slnx
dotnet run --project src/AppHost/Monica.Docs.Api/Monica.Docs.Api.csproj
```

## Working Conventions

- Keep code comments and annotations in English.
- Avoid editing `bin/` or `obj/`.
- When a solution or restore problem comes from external Monica references, prefer fixing Monica itself over weakening the demo surface in Monica.Docs.
