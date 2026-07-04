# Tasks: Social Syndication Pipeline

**Input**: Design documents from `/specs/002-social-syndication-pipeline/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅

## Phase 1: Setup

- [x] T001 Create isolated dependency tree `scripts/social-syndicate/package.json` (`gray-matter`, `twitter-api-v2`) so the Vercel-deployed app's dependencies stay untouched
- [x] T002 [P] Add `content/posts/` directory for post-with-frontmatter convention
- [x] T003 [P] Add `.gitignore` entry for `scripts/social-syndicate/node_modules`

## Phase 2: Foundational

- [x] T004 Implement frontmatter loader (`loadPost`) reading `title`/`summary`/`slug`/`tags` and building the canonical `SITE_URL`-based URL in `scripts/social-syndicate/post.mjs`
- [x] T005 Implement `.github/workflows/social-syndicate.yml` trigger: `push` to `main`, path-filtered to `content/posts/**.mdx`
- [x] T006 Implement added-vs-modified file detection via `git diff --name-status HEAD^ HEAD -- content/posts` filtered to status `A`, satisfying FR-002

**Checkpoint**: Foundation ready — each platform's publish step can now be added independently

## Phase 3: User Story 1 - Auto-post to X (Priority: P1) 🎯 MVP

- [x] T007 [US1] Implement `buildTweetText` with 280-char budget + ellipsis truncation, preserving the full URL in `scripts/social-syndicate/post.mjs`
- [x] T008 [US1] Implement `postToX` using `twitter-api-v2` OAuth 1.0a user-context client
- [x] T009 [US1] Document X Developer App + OAuth 1.0a credential setup in `scripts/social-syndicate/README.md`

**Checkpoint**: X auto-posting is independently functional and testable

## Phase 4: User Story 2 - Auto-post to Facebook (Priority: P2)

- [x] T010 [US2] Implement `postToFacebook` via Graph API `/{page-id}/feed` using native `fetch`
- [x] T011 [US2] Document Facebook Business App + Page Access Token setup (incl. long-lived token exchange) in `scripts/social-syndicate/README.md`
- [x] T012 [US2] Verify X and Facebook publish steps run via `Promise.allSettled` so a failure on one does not block the other (FR-008)

**Checkpoint**: X and Facebook both auto-post independently; a credential failure on one is isolated

## Phase 5: User Story 3 - Draft issue for Substack/Ko-fi/Patreon (Priority: P3)

- [x] T013 [US3] Implement `openDraftIssue` composing distinct copy blocks for Substack, Ko-fi, and Patreon
- [x] T014 [US3] Create the issue via GitHub REST API using the built-in `GITHUB_TOKEN`, labeled `cross-post`
- [x] T015 [US3] Grant `issues: write` permission in the workflow YAML

**Checkpoint**: All three user stories are independently functional; a single push produces X + Facebook posts and a draft issue

## Phase 6: Polish & Deploy Readiness

- [x] T016 [P] Write `scripts/social-syndicate/README.md` with full one-time setup steps for all credentials
- [x] T017 [P] Add example post `content/posts/hello-world.mdx` demonstrating the required frontmatter shape
- [x] T018 Validate workflow YAML syntax and script syntax (`node --check`)
- [x] T019 Dry-run `loadPost` + `buildTweetText` logic locally without live credentials to confirm URL/slug/truncation behavior
- [x] T020 Retroactively write spec.md, plan.md, research.md, quickstart.md, tasks.md per Constitution Principle I (Spec-First Delivery)

## Notes

- Tests were not explicitly requested in the spec, so no automated test suite was added — verification was done via local dry-run scripts (T019) and workflow/script syntax validation (T018), per the `tasks-template.md` guidance that tests are optional unless requested.
- T020 reflects that this feature's implementation preceded its formal spec-kit documentation; going forward, new features under this pipeline (e.g. adding a new platform) should follow constitution → specify → plan → tasks → implement in that order from the start.
