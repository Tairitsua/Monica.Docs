# Monica documentation frontend

The public Monica homepage and documentation web application. It uses Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The canonical English homepage is `/`; the Simplified Chinese homepage is `/zh-CN`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

Fonts and icons are installed as local npm dependencies. The production page does not rely on browser-loaded CDN assets.
