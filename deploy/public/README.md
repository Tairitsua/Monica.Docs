# Public deployment assets

These files define the production deployment for:

- `https://monica.dpdns.org` — Next.js documentation site and read-only documentation API
- `https://demo.monica.dpdns.org` — isolated, disposable Monica runtime playground

The Docker build context must contain sibling `Monica.Docs/` and `MoLibrary/`
directories. Copy this directory's `Dockerfile`, `.dockerignore`,
`docker-compose.yml`, and `Caddyfile` to the root of that prepared context before
running Docker Compose. The web build reads
`MoLibrary/Directory.Build.props` and the canonical
`MoLibrary/.monica/agent-skill-catalog.json` plus
`MoLibrary/skills/monica-guide/assets/bootstrap-prompts.json`; the API resolves
the same framework version from the compiled `Monica.Core` assembly. The two
checkouts must therefore represent the same release. Set
`MONICA_AGENT_SKILL_REF` to the immutable Monica tag that passed the
install-and-discovery smoke test. The disposable web build stage independently
verifies the exact advertised tag against `Directory.Build.props`, downloads and
hashes the published catalog/index/manifest/archive contracts, checks the local
canonical prompt bytes, and performs a fresh `monica-guide` install and Codex
and Claude Code discovery plus unblocked initialization-preview smoke tests
before Next.js can build.

The public web image fails closed when `MONICA_AGENT_SKILL_REF` is missing, does
not exactly equal `v<Directory.Build.props Version>`, is not a published GitHub
release with valid artifacts, or fails fresh discovery. Local frontend builds
may render a visibly labeled, non-installable development fallback instead.

Before public promotion, run `npm run verify:manual-dotnet` from
`frontend/monica-docs-web` on a host with the .NET 10 SDK. This installs the
advertised `Monica.Templates@<version>` in an isolated template hive, creates
the documented `Orders` project, verifies the displayed `Program.cs` byte-for-byte,
and requires a zero-warning production build.

Then configure the Cloudflare zone as follows:

- Turn **Email Address Obfuscation** off for `monica.dpdns.org` (or apply a
  hostname-wide Configuration Rule with `email_obfuscation: false`). The
  feature mistakes executable package strings such as `skills@<version>` for
  email addresses. Purge the edge cache after changing the setting.
- Preserve the origin `robots.txt` instead of injecting crawler-specific
  blanket blocks. Its Content Signal permits search, AI-assisted retrieval,
  and reference use while reserving model-training use.
- In AI Crawl Control, allow search and assistant crawlers used for
  documentation retrieval and keep training use disallowed. Content Signals
  express the usage policy; crawler actions remain the enforcement layer.

After deployment, run the smoke test from `frontend/monica-docs-web` with the
exact immutable tag being promoted:

```bash
MONICA_AGENT_SKILL_REF=v1.0.0-rc.9 npm run verify:deployed -- https://monica.dpdns.org
```

`MONICA_AGENT_SKILL_REF` is required. The smoke test rejects a missing,
non-release, or mismatched tag; Cloudflare email-protection markup; altered
package specifiers; missing Content Signals; and blanket blocks for common
answer and assistant crawlers. Retain the prior Cloudflare settings and image
tag until this check succeeds so both can be rolled back together.

Set `MONICA_DOCS_IMAGE_TAG` to the Monica.Docs commit being released. The Compose
file defaults to `dev` for local configuration validation.

The public demo runs with `PublicDemo:Enabled=true`. Its Configuration and
JobScheduler consoles intentionally remain writable so visitors can exercise the
runtime. Configuration state, the managed JSON source, and scheduled-job metadata
are disposable and reset when the container starts. The source documentation mount
remains read-only, and the demo's only network peer is Caddy.
