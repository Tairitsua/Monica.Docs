# Monica.Docs

<p align="center">
  <a href="https://github.com/Tairitsua/Monica.Docs/blob/main/LICENSE.txt"><img src="https://img.shields.io/github/license/Tairitsua/Monica.Docs" alt="License"></a>
  <a href="https://monica.dpdns.org/"><img src="https://img.shields.io/badge/docs-online-brightgreen.svg" alt="Documentation"></a>
</p>

<p align="center">
  English | <a href="README.zh_CN.md">简体中文</a>
</p>

> The public product site and bilingual documentation for Monica: agent-governed application architecture for observable .NET backends.

This repository contains three deliberately separate products:

- a Next.js public website for <https://monica.dpdns.org/>
- a read-only documentation API intended for `api.monica.dpdns.org`
- a broad Monica modular-monolith demo host for framework exploration

The public API is isolated from the resettable demo surface, so production documentation never exposes showcase endpoints by accident.

## Run the public documentation stack

Start the read-only API:

```bash
dotnet run --project src/AppHost/Monica.Docs.PublicApi/Monica.Docs.PublicApi.csproj
```

In another terminal, start the website:

```bash
cd frontend/monica-docs-web
npm install
MONICA_DOCS_API_URL=http://localhost:5082 npm run dev
```

Open <http://localhost:3000>. Useful routes include:

- `/` and `/zh-CN` — localized product homepages
- `/docs` and `/zh-CN/docs` — documentation and search
- `/modules` — the complete Stable / Integrations / Labs catalog
- `/reference` — template and Ordering reference application
- `/roadmap` — public release gates and promises

If `MONICA_DOCS_API_URL` is not configured or the API is temporarily unreachable, the frontend serves a small built-in launch guide instead of failing with an empty screen.

## Run the broad demo host

```bash
dotnet run --project src/AppHost/Monica.Docs.Api/Monica.Docs.Api.csproj
```

The demo host exercises Monica UI, JobScheduler, documentation synchronization, and local RPC. It is intentionally broader than the public API and is not the deployment target for `api.monica.dpdns.org`.

## Host-bound Monica composition

Every host owns one explicit module graph:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.AppName = "Monica Documentation API";
        options.AppId = "monica-docs-public-api";
    });

    monica.AddMarkdown()
        .EnableMultilingualDocuments()
        .AddDocumentGroup("monica", "Monica Docs", docsBasePath);
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

There is no ambient registration singleton and no registration-time service locator. The complete graph is collected and validated for the owning host before it is built.

## Repository layout

```text
docs/                                      bilingual Markdown source
frontend/monica-docs-web/                  Next.js 16 / React 19 website
src/AppHost/Monica.Docs.PublicApi/         read-only public documentation API
src/AppHost/Monica.Docs.Api/               broad, resettable Monica demo host
src/Domains/Documentation/                 documentation bounded context
src/Domains/Showcase/                      demo-only behaviors
src/Domains/LocalRpcProvider/               local RPC example boundary
src/Shared/Platform.*                      shared protocol and infrastructure layers
```

The documentation source can be relocated with `DocumentationApi__DocsBasePath`. Without an explicit value, the hosts check the preferred `/docs` mount and then repository-relative development paths.

## Quality checks

```bash
dotnet build Monica.Docs.slnx -m

cd frontend/monica-docs-web
npm run check
npm audit --omit=dev
```

The frontend uses local npm font and icon assets; production rendering does not depend on browser-loaded CDNs.

## Related projects

- Monica framework: <https://github.com/Tairitsua/Monica>
- Live documentation: <https://monica.dpdns.org/>
- Architecture notes: [architecture-spec.md](architecture-spec.md)
- MIT license: [LICENSE.txt](LICENSE.txt)
