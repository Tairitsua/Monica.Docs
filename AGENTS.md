# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Project Snapshot

Monica.Docs is both:

- the documentation project for Monica
- a live demo host for Monica modules, including UI-backed demos
- a teaching/demo repository for the `monica-application-modular-monolith` and `monica-application-project-unit-development` skills

The public documentation backend is `Monica.Docs.Api`. The broad resettable framework showcase is `Monica.Docs.Demo`; do not treat the demo host as the public deployment target.

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

- Initialize this repository with the global `docs-contributor` profile through `monica-guide`; Monica.Docs does not keep repository-owned copies of Monica development skills.
- Use `monica-application-modular-monolith` whenever the task involves solution structure, `Domains/` boundaries, `Platform.*` placement, the strict project reference chain, AppHost composition, or published-language collaboration.
- Use `monica-application-project-unit-development` whenever the task involves creating or changing `ApplicationService`, request DTOs, domain services, entities, repositories, domain events, handlers, configurations, or jobs.
- This repository should actively demonstrate those two skills in practice. Do not introduce local conventions that conflict with them.
- For business development in this repository, apply the two skills together by default: use `monica-application-modular-monolith` first to choose the bounded-context boundary, target project, dependency direction, and folder placement, then use `monica-application-project-unit-development` to implement the concrete ProjectUnits.
- Keep the directory and naming rules aligned with those skills: bounded contexts live under `src/Domains/{Subdomain}` with a single `Domains.{Subdomain}.csproj`; domain-owned application units stay under `Application/HandlersCommand`, `Application/HandlersQuery`, `Application/HandlersEvent`, and `Application/BackgroundWorkers`; repositories stay under `Repository/`; pure helper code stays under `Utilities/` and utility type names should use the `Utils*` prefix.
- Keep AppHost composition-only. Do not place business ProjectUnits, domain logic, or ad-hoc infrastructure helpers in `src/AppHost/*`.
- When a task changes business structure or ProjectUnits, the implementation should be reviewed against both skill rule sets before introducing new folders, references, or conventions.

## Architecture Rules

- Keep the strict project reference chain `AppHost -> Domains.{Subdomain} -> Platform.Infrastructure -> Platform.Protocol -> Platform.BuildingBlocks`.
- Keep project-common Monica references in `src/Shared/Platform.BuildingBlocks/Platform.BuildingBlocks.csproj`.
- Keep subdomain-only dependencies in the owning domain project.
- Keep AppHost entry projects composition-only.
- Keep Monica.Docs-owned projects grouped under the physical `src/AppHost`, `src/Shared`, and `src/Domains` layout inside the solution view, even though the solution also loads Monica dependencies from `../MoLibrary` for demo purposes.
- Keep domain-owned application units in `Application/HandlersCommand`, `Application/HandlersQuery`, `Application/HandlersEvent`, and `Application/BackgroundWorkers`.
- Keep repository implementations in `Repository/`, and keep pure helper code in `Utilities/` with `Utils*` names when adding new utility helpers.
- Keep cross-domain collaboration pointed at `src/Shared/Platform.Protocol/PublishedLanguages` or other protocol-level contracts. Do not reference another domain's internal implementation directly.
- Host composition must use `builder.Configuration` for prerequisites needed to reach the Configuration store, such as its connection string and migrations. When a Monica-managed option must drive topology before `Build()`, reuse one `MonicaConfigurationInputPlan` and load a read-only point-in-time snapshot with `BuildBootstrapConfiguration(...)` plus `LoadEffectiveOptionsSnapshot[Async](...)`; the snapshot does not persist missing documents or guarantee equality with later runtime values. Consume ordinary managed values through typed `IOptions<T>` or `IOptionsSnapshot<T>` at runtime; there is no ambient or instant-registration phase.

## Build and Run

```bash
dotnet restore Monica.Docs.slnx
dotnet build Monica.Docs.slnx
dotnet run --project src/AppHost/Monica.Docs.Api/Monica.Docs.Api.csproj
```

Run the full Monica showcase in a separate terminal when needed:

```bash
dotnet run --project src/AppHost/Monica.Docs.Demo/Monica.Docs.Demo.csproj
```

## Working Conventions

- Keep code comments and annotations in English.
- Avoid editing `bin/` or `obj/`.
- When a solution or restore problem comes from external Monica references, prefer fixing Monica itself over weakening the demo surface in Monica.Docs.
