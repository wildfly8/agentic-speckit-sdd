# Nextra SDD Docs Constitution

## Core Principles

### I. Spec-First Delivery
Every feature begins with a written specification in `specs/` before implementation. Code must trace back to functional requirements and user stories.

### II. Simplicity (YAGNI)
Use the smallest stack that satisfies requirements. Prefer Nextra defaults over custom components. No backend, database, or auth unless explicitly specified.

### III. Static-First Deployment
The site MUST build as a static or server-rendered Next.js app deployable to Vercel with zero custom infrastructure.

### IV. Content as Source of Truth
Documentation pages live in `content/` as MDX. Diagrams and math are authored in Markdown (Mermaid code blocks, LaTeX) — not embedded images.

### V. Production Readiness
The repository MUST include README, `.gitignore`, working `build` script, and be ready to push to a public GitHub remote.

## Technology Constraints

- **Framework**: Nextra 4.x with Docs Theme on Next.js App Router
- **Node**: LTS-compatible (Node 20+)
- **Hosting**: Vercel (default Next.js preset)
- **Package manager**: npm

## Quality Gates

- `npm run build` must succeed before merge
- All linked pages must render without runtime errors
- SDD artifacts (spec, plan, tasks) must stay aligned with delivered features

## Governance

This constitution guides all `/speckit-*` workflows. Amendments require updating this file with version and date.

**Version**: 1.0.0 | **Ratified**: 2026-07-03 | **Last Amended**: 2026-07-03
