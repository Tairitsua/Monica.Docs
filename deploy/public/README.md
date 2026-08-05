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
discovery smoke test before Next.js can build.

The public web image fails closed when `MONICA_AGENT_SKILL_REF` is missing, does
not exactly equal `v<Directory.Build.props Version>`, is not a published GitHub
release with valid artifacts, or fails fresh discovery. Local frontend builds
may render a visibly labeled, non-installable development fallback instead.

Set `MONICA_DOCS_IMAGE_TAG` to the Monica.Docs commit being released. The Compose
file defaults to `dev` for local configuration validation.

The public demo runs with `PublicDemo:Enabled=true`. Its Configuration and
JobScheduler consoles intentionally remain writable so visitors can exercise the
runtime. Configuration state, the managed JSON source, and scheduled-job metadata
are disposable and reset when the container starts. The source documentation mount
remains read-only, and the demo's only network peer is Caddy.
