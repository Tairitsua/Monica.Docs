# Monica.Docs

<p align="center">
  <a href="https://github.com/Tairitsua/Monica.Docs/blob/main/LICENSE.txt"><img src="https://img.shields.io/github/license/Tairitsua/Monica.Docs" alt="License"></a>
  <a href="https://monica.dpdns.org/"><img src="https://img.shields.io/badge/docs-online-brightgreen.svg" alt="Documentation"></a>
</p>

<p align="center">
  English | <a href="README.zh_CN.md">简体中文</a>
</p>

> Official Monica docs site, and a working modular-monolith example built with Monica itself.

## What This Repo Is

- The source for <https://monica.dpdns.org/>
- A live Monica example that shows a domain-first modular monolith in practice
- A repository where the docs product and the backend example live together

If you are here to read the docs, start at the site. If you are here to learn the Monica solution shape, start at `src/`.

## Quick Start

### Read the docs locally

```bash
dotnet run --project src/AppHost/Monica.Docs.Api/Monica.Docs.Api.csproj
```

Then open:

- `http://localhost:5298`
- `/markdown-docs` for the markdown viewer

### Mount your own docs folder

```bash
docker run -p 8080:8080 \
  -v $(pwd)/docs:/docs \
  monica-docs
```

The AppHost resolves docs in this order: explicit path, preferred mount path, AppHost-local `docs/`, then the repository `docs/` folder.

## Monica Global Configuration

Host-level Monica defaults should be configured through root `Mo.Config*()` methods before module registration:

```csharp
Mo.ConfigApplication(options =>
{
    options.AppName = "Monica Docs";
    options.AppId = "monica-docs";
});

Mo.ConfigModuleSystem(options =>
{
    options.DefaultApiGroupName = "Documentation";
});
```

Module-specific options remain the highest-priority configuration source.

## In This Repo

- `src/AppHost/Monica.Docs.Api` - composition-only AppHost
- `src/Domains/Documentation` - the documentation bounded context
- `src/Domains/LocalRpcProvider` - local RPC support for the example host
- `src/Shared/Platform.*` - shared protocol and infrastructure layers
- `docs/` - the markdown source that powers the docs site
- `frontend/` - reserved for the future decoupled frontend

## Monica in This Host

The AppHost runs real Monica modules alongside the docs site:

- ModuleSystem and ProjectUnits expose how the host is assembled and which ProjectUnits are available.
- JobScheduler runs the docs sync worker through Monica scheduling infrastructure.
- The result is both the official docs source and a runnable Monica modular-monolith example.

## Architecture Spec

The full architecture memo now lives in [architecture-spec.md](architecture-spec.md).

## Related Repos

- Monica framework: <https://github.com/Tairitsua/Monica>
- Live docs: <https://monica.dpdns.org/>
- MIT license: see [LICENSE.txt](LICENSE.txt)
