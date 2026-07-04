# Implementation Plan: Social Syndication Pipeline

**Branch**: `002-social-syndication-pipeline` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-social-syndication-pipeline/spec.md`

## Summary

On every push to `main` that adds a new `content/posts/*.mdx` file, a GitHub Actions
workflow diffs the commit, extracts frontmatter (`title`, `summary`, optional `slug`/`tags`)
from each newly added post, and:

1. Publishes a tweet via the official X API v2 (OAuth 1.0a user context).
2. Publishes a Facebook Page post via the official Graph API.
3. Opens a GitHub Issue with ready-to-paste draft copy for Substack, Ko-fi, and Patreon,
   since none of the three currently offer a reliable, public "create post" API (confirmed
   via research — see `research.md`).

The syndication script lives outside the Next.js app's own dependency tree
(`scripts/social-syndicate/`) so it never affects the Vercel build or bundle size.

## Technical Context

**Language/Version**: Node.js 22 (ES modules)

**Primary Dependencies**: `gray-matter` (frontmatter parsing), `twitter-api-v2` (X OAuth 1.0a signing + posting), native `fetch` for Facebook Graph API, Medium's integration-token API, and the GitHub REST API — no other runtime deps.

**Storage**: N/A (stateless script; source of truth is the git diff of `content/posts/`)

**Testing**: Local dry-run of frontmatter parsing + tweet-composition logic (no live credentials required); full validation happens on first real workflow run in CI.

**Target Platform**: GitHub Actions (`ubuntu-latest` runner)

**Project Type**: CI automation script + workflow, isolated from the main Next.js app

**Performance Goals**: N/A (low-frequency, human-scale trigger — new blog posts, not high-throughput)

**Constraints**: Must not modify the Next.js app's `package.json`/deploy footprint; must not store any credentials in the repository; each platform's publish step must fail independently without blocking the others.

**Scale/Scope**: Single X account, single Facebook Page, single Substack/Ko-fi/Patreon each — no multi-tenant fan-out.

## Constitution Check

*GATE: Must pass before implementation.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Spec-First | ✅ | spec.md written before implementation; this plan documents the (already-prototyped) implementation retroactively per user request |
| Simplicity (YAGNI) | ✅ | No new backend/database; syndication script uses only 2 small deps and native `fetch`; kept out of the app's own dependency tree |
| Static-First Deployment | ✅ | No changes to the Next.js app itself; the Vercel-deployed site is untouched by this feature |
| Content as Source of Truth | ✅ | New posts are still authored as MDX in `content/posts/`, following the existing `content/` convention |
| Production Readiness | ✅ | README with full setup steps included at `scripts/social-syndicate/README.md`; workflow YAML validated |

## Project Structure

### Documentation (this feature)

```text
specs/002-social-syndication-pipeline/
├── spec.md
├── plan.md
├── research.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
agentic-speckit-sdd/
├── .github/
│   └── workflows/
│       └── social-syndicate.yml       # trigger + orchestration
├── content/
│   └── posts/
│       └── hello-world.mdx            # example post w/ required frontmatter
├── scripts/
│   └── social-syndicate/
│       ├── package.json               # isolated deps: gray-matter, twitter-api-v2
│       ├── post.mjs                   # main syndication logic
│       └── README.md                  # setup + credential instructions
```

**Structure Decision**: The syndication logic is a standalone script tree under
`scripts/social-syndicate/` with its own `package.json`, rather than living inside
the Next.js app. This keeps the Vercel build/deploy path (Constitution Principle III)
completely unaffected — the script only runs inside the GitHub Actions job, never as
part of `next build`.

## Configuration Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Trigger | `push` to `main`, path-filtered to `content/posts/**.mdx` | Matches the same event that already triggers the Vercel deploy — no extra webhook needed |
| Added-vs-modified detection | `git diff --name-status HEAD^ HEAD` filtered to status `A` | Satisfies FR-002: edits must not re-trigger a post |
| X auth | OAuth 1.0a user context via `twitter-api-v2` | Required for posting via API v2; simpler than managing OAuth2 refresh-token rotation for a low-frequency bot |
| Facebook auth | Long-lived Page Access Token | Simplest stable credential for a single-page poster; documented 60-day renewal in README |
| Medium auth | Legacy integration token | Only working publish mechanism Medium offers, despite official deprecation; wired in as best-effort with isolated failure handling rather than skipped entirely, since it can publish full content (unlike X/Facebook's teaser+link) |
| Substack/Ko-fi/Patreon | GitHub Issue with draft copy, no auto-publish | Confirmed via research: none of the three expose a public, stable "create post" API — full automation would mean unofficial, cookie-based, ToS-risk libraries, which was explicitly descoped by the user |
| Per-platform isolation | `Promise.allSettled` across the four publish/draft calls | Satisfies FR-010: one platform's failure must not block the others — this matters especially for Medium, whose deprecated API can fail unpredictably |
| Dependency isolation | Separate `scripts/social-syndicate/package.json` | Keeps `twitter-api-v2`/`gray-matter` out of the Next.js app's dependency graph and Vercel build |

## Complexity Tracking

No constitution violations. The only deviation from a "pure" single-project layout is
the isolated `scripts/social-syndicate/` dependency tree, which is a direct consequence
of Constitution Principle III (Static-First Deployment) — keeping CI-only tooling out
of the deployable app is the simpler choice, not a violation of it.
