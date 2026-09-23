# Monica documentation frontend

The public Monica homepage and documentation web application. It uses Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Local development

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>. The canonical English homepage is `/`; the Simplified Chinese homepage is `/zh-CN`.

`predev` and `prebuild` generate the reading catalog from `../../docs/` and the sibling `../../../MoLibrary/skills/` source. Set `MONICA_SOURCE_ROOT` for a different Monica checkout. Preview output identifies its source commit and uncommitted changes. Generated `src/generated/` files are ignored and must never be edited.

Stable editorial guides render under `/docs`; canonical skills and their references render under `/skills`. `/api/skills/{name}/{path}` preserves exact raw Markdown bytes and `/llms.txt` provides discovery for agents. Search covers both corpora. The optional `MONICA_DOCS_API_URL` powers asset proxying only.

## Publication

Set `MONICA_PUBLIC_RELEASE_BUILD=1` and `MONICA_AGENT_SKILL_REF=v<framework-version>` for a public build. The generator fetches `monica-knowledge.json` and `SHA256SUMS` from that immutable Monica release, then verifies the framework version, catalog digest, content digest, and individual resource digests. Missing or mismatched releases fail the build. A new Monica release containing the knowledge artifact is required before deploying this migration.

`MONICA_KNOWLEDGE_BUNDLE_PATH` can provide a local artifact. Public builds still check it against the selected release's checksum manifest. Nonstandard layouts can set `MONICA_AGENT_SKILL_CATALOG_PATH`, `MONICA_VERSION_PROPS_PATH`, and `MONICA_GUIDE_PROMPTS_PATH` for the remaining build inputs. The Docker build supplies those inputs from its pinned Monica checkout.

## Quality checks

```bash
npm run check
```

Fonts and icons are installed as local npm dependencies. The production page does not rely on browser-loaded CDN assets.
