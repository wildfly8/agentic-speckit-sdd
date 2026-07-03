# Implementation Plan: Nextra Documentation Site

**Branch**: `001-nextra-docs-site` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-nextra-docs-site/spec.md`

## Summary

Build a minimal Nextra 4 Docs Theme site using the `content/` directory convention. Three MDX pages (home, mermaid, math) with LaTeX and Mermaid enabled in `next.config.mjs`. Deploy-ready for Vercel with standard Next.js build.

## Technical Context

**Language/Version**: JavaScript (Node.js 20+, ES modules)

**Primary Dependencies**: next@16, react@19, nextra@4.6, nextra-theme-docs@4.6, katex

**Storage**: N/A (static content files)

**Testing**: Manual verification + production build

**Target Platform**: Web (Vercel)

**Project Type**: Static documentation site (Next.js App Router)

**Performance Goals**: Fast static generation, sub-3s page loads

**Constraints**: No backend; minimal custom code

**Scale/Scope**: 3 pages, single feature branch

## Constitution Check

*GATE: Must pass before implementation.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Spec-First | ✅ | spec.md complete |
| Simplicity | ✅ | Nextra defaults only |
| Static-First | ✅ | Next.js SSG |
| Content as Source | ✅ | MDX in content/ |
| Production Ready | ✅ | README + build script planned |

## Project Structure

### Documentation (this feature)

```text
specs/001-nextra-docs-site/
├── spec.md
├── plan.md
├── research.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
agentic-speckit-sdd/
├── app/
│   ├── layout.jsx
│   └── [[...mdxPath]]/
│       └── page.jsx
├── content/
│   ├── _meta.js
│   ├── index.mdx
│   ├── mermaid.mdx
│   └── math.mdx
├── mdx-components.jsx
├── next.config.mjs
├── package.json
├── .gitignore
└── README.md
```

**Structure Decision**: Single Next.js project with Nextra `content/` directory convention — the recommended Nextra 4 approach for MDX-heavy sites.

## Configuration Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Theme | nextra-theme-docs | User asked for Nextra docs site |
| Content routing | content/ + [[...mdxPath]] | Hot reload, no page.tsx per route |
| Math | KaTeX (`latex: true`) | Nextra default, pre-rendered |
| Mermaid | Built-in remark plugin | No extra deps |
| Turbopack alias | mdx-components path | Required for Next.js 16 dev |
| Layout structure | Nested `(docs)` route group | Avoids Nextra Layout on `/_not-found` |
| Zod 4.4 patch | patch-package on nextra-theme-docs | Fixes `children` validation bug |

## Complexity Tracking

No constitution violations.
