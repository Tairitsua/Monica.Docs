# Public deployment assets

These files define the production deployment for:

- `https://monica.dpdns.org` — Next.js documentation site and read-only documentation API
- `https://demo.monica.dpdns.org` — isolated, disposable Monica runtime playground

Run Docker Compose directly from this committed `deploy/public` directory. Its
build context is `../../..`, which must contain sibling `Monica.Docs/` and
`MoLibrary/` checkouts. Do not copy the deployment files into a separate build
root. Use pristine committed checkouts and record both full commit SHAs.
`MONICA_RELEASE_ID` must be
`<full-Monica.Docs-commit>-<full-Monica-commit>`, while
`MONICA_AGENT_SKILL_REF` must be the verified immutable Monica tag. Every image
uses the composite release ID, because the API, demo, and frontend all consume
both repositories. The build bakes the Markdown tree and Caddy configuration
into those versioned images, so switching the composite image tag restores the
frontend, APIs, demo content, and proxy configuration together. The
Dockerfile-specific ignore contract excludes build outputs, local environment
files, and unrelated sibling repositories from the context. The web build reads
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

Build and start the exact release only after the Monica tag smoke test and the
Manual .NET verifier pass:

```bash
cd Monica.Docs/deploy/public
DOCS_COMMIT="$(git -C ../.. rev-parse HEAD)"
MONICA_COMMIT="$(git -C ../../../MoLibrary rev-parse HEAD)"
export MONICA_RELEASE_ID="${DOCS_COMMIT}-${MONICA_COMMIT}"
export MONICA_AGENT_SKILL_REF=v1.0.0-rc.9
node verify-release-context.mjs ../../..
docker compose config --quiet
docker compose build --pull
docker compose up --detach --remove-orphans --wait --wait-timeout 180
curl --fail --silent --show-error \
  --resolve monica.dpdns.org:443:127.0.0.1 \
  https://monica.dpdns.org/healthz
curl --fail --silent --show-error \
  --resolve demo.monica.dpdns.org:443:127.0.0.1 \
  https://demo.monica.dpdns.org/healthz
```

The context verifier rejects tracked changes, untracked files, and ignored files
in either checkout before it validates the exact tag, package version, and
composite release ID. Use fresh release checkouts instead of cleaning a working
development tree for deployment.

The public-release workflow builds the same Caddy image and committed
`Caddyfile`, then supplies HTTP site addresses only to its disposable runner.
It probes both host routes and always tears the stack down. Production leaves
the site-address variables unset, so the same validated configuration defaults
to the public HTTPS origins.

All application images expose container health checks. Caddy starts only after
the API, web frontend, and demo are healthy; the two origin probes above bypass
Cloudflare and remain mandatory because container health alone cannot validate
the origin TLS certificates or proxy routing. The later deployed-site smoke test
validates public DNS and edge behavior separately.

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

Before promotion, retain the previous composite release ID, Monica Agent Skill
ref, Cloudflare settings, and sibling release checkouts. If any origin or edge
check fails, restore the previous values without rebuilding:

```bash
MONICA_RELEASE_ID=<previous-docs-commit>-<previous-monica-commit> \
MONICA_AGENT_SKILL_REF=<previous-monica-tag> \
docker compose up --detach --remove-orphans --no-build --wait --wait-timeout 180
```

The Compose file defaults to `dev` only for local configuration validation; do
not use that default for public promotion.

The public demo runs with `PublicDemo:Enabled=true`. Its Configuration and
JobScheduler consoles intentionally remain writable so visitors can exercise the
runtime. Configuration state, the managed JSON source, and scheduled-job metadata
are disposable and reset when the container starts. Documentation is immutable
inside the release image, and the demo's only network peer is Caddy.
