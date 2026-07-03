# Tasks: Nextra Documentation Site

**Input**: Design documents from `/specs/001-nextra-docs-site/`

**Prerequisites**: plan.md ✅, spec.md ✅

## Phase 1: Setup

- [x] T001 Initialize npm project with Next.js, Nextra, and theme dependencies in `package.json`
- [x] T002 [P] Add `.gitignore` for Node.js/Next.js
- [x] T003 [P] Configure `next.config.mjs` with Nextra, `latex: true`, and turbopack alias

## Phase 2: Foundational

- [x] T004 Create `mdx-components.jsx` merging Nextra theme components
- [x] T005 Create `app/layout.jsx` with Docs Theme layout, navbar, footer, KaTeX CSS
- [x] T006 Create `app/[[...mdxPath]]/page.jsx` catch-all MDX route
- [x] T007 Create `content/_meta.js` for sidebar navigation labels

## Phase 3: User Story 1 - Home Page (P1) 🎯 MVP

- [x] T008 [US1] Create `content/index.mdx` with welcome text and links to `/mermaid` and `/math`

## Phase 4: User Story 2 - Mermaid Page (P2)

- [x] T009 [US2] Create `content/mermaid.mdx` with a sample architecture flowchart

## Phase 5: User Story 3 - Math Page (P3)

- [x] T010 [US3] Create `content/math.mdx` with inline and block LaTeX formulas

## Phase 6: Polish & Deploy Readiness

- [x] T011 [P] Write `README.md` with setup, SDD workflow, GitHub, and Vercel instructions
- [x] T012 Run `npm run build` and fix any build errors
- [x] T013 Verify all pages render correctly in dev mode
