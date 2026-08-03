# Public deployment assets

These files define the production deployment for:

- `https://monica.dpdns.org` — Next.js documentation site and read-only documentation API
- `https://demo.monica.dpdns.org` — isolated, disposable Monica runtime playground

The Docker build context must contain sibling `Monica.Docs/` and `MoLibrary/`
directories. Copy this directory's `Dockerfile`, `.dockerignore`,
`docker-compose.yml`, and `Caddyfile` to the root of that prepared context before
running Docker Compose. The web build reads
`MoLibrary/Directory.Build.props`, and the API resolves the same version from
the compiled `Monica.Core` assembly, so the two checkouts must represent the
same release. Run
`python Monica.Docs/scripts/validate_release_version.py --verify-published`
from the prepared context before building images.

Set `MONICA_DOCS_IMAGE_TAG` to the Monica.Docs commit being released. The Compose
file defaults to `dev` for local configuration validation.

The public demo runs with `PublicDemo:Enabled=true`. Its Configuration and
JobScheduler consoles intentionally remain writable so visitors can exercise the
runtime. Configuration state, the managed JSON source, and scheduled-job metadata
are disposable and reset when the container starts. The source documentation mount
remains read-only, and the demo's only network peer is Caddy.
