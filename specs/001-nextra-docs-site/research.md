# Research: Nextra Documentation Site

**Date**: 2026-07-03

## Nextra 4 Setup

- Latest: nextra@4.6.1, nextra-theme-docs@4.6.1, next@16.2.10
- Uses App Router with `content/` directory and catch-all `[[...mdxPath]]/page.jsx`
- Docs: https://nextra.site/docs/docs-theme/start

## Mermaid

- Enabled out of the box via `@theguild/remark-mermaid`
- Use fenced code block with language `mermaid`
- Docs: https://nextra.site/docs/advanced/mermaid

## LaTeX / KaTeX

- Enable with `latex: true` in nextra config
- Import `katex/dist/katex.min.css` in root layout
- Docs: https://nextra.site/docs/advanced/latex

## Vercel Deployment

- Auto-detects Next.js; no custom `vercel.json` required
- Build command: `npm run build`
- Output: Next.js default

## Spec-Kit SDD

- Initialized with `specify init --integration cursor-agent`
- Workflow: constitution → specify → plan → tasks → implement
