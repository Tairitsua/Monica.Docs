# Public deployment assets

These files define the production deployment for:

- `https://monica.dpdns.org` — Next.js documentation site and read-only documentation API
- `https://demo.monica.dpdns.org` — isolated, read-only Monica runtime showcase

The Docker build context must contain sibling `Monica.Docs/` and `MoLibrary/`
directories. Copy this directory's `Dockerfile`, `.dockerignore`,
`docker-compose.yml`, and `Caddyfile` to the root of that prepared context before
running Docker Compose.

Set `MONICA_DOCS_IMAGE_TAG` to the Monica.Docs commit being released. The Compose
file defaults to `dev` for local configuration validation.

The public demo runs with `PublicDemo:Enabled=true`. That mode keeps the
inspectable runtime surfaces but removes the writable Configuration and
JobScheduler consoles. Its state is disposable, its source documentation mount is
read-only, and its only network peer is Caddy.
