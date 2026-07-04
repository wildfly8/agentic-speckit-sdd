# Feature Specification: Social Syndication Pipeline

**Feature Branch**: `002-social-syndication-pipeline`

**Created**: 2026-07-03

**Status**: Approved

**Input**: User description: "When a new post is published on the Vercel-deployed site, automatically feed it to X (Twitter), Substack, Facebook, Ko-fi, and Patreon."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auto-post to X on new content (Priority: P1)

As the site owner, when I merge a new post to `main`, a teaser + link is automatically posted to my X account without any manual step.

**Why this priority**: X has a stable, official write API and the highest posting cadence value — this is the core automation payoff.

**Independent Test**: Add a new file under `content/posts/`, push to `main`, and confirm a new post appears on the connected X account within a few minutes.

**Acceptance Scenarios**:

1. **Given** a new `content/posts/*.mdx` file with valid frontmatter is merged to `main`, **When** the workflow runs, **Then** a tweet containing the title, summary, and canonical URL is published.
2. **Given** the post's title + summary would exceed X's character limit, **When** the tweet is composed, **Then** the text is truncated with an ellipsis and the link is preserved in full.
3. **Given** an existing post file is only edited (not newly added), **When** it is merged, **Then** no new tweet is posted.

---

### User Story 2 - Auto-post to Facebook Page on new content (Priority: P2)

As the site owner, the same new post is automatically published to my Facebook Page feed.

**Why this priority**: Facebook also has an official write API and pairs naturally with the X automation; second-highest audience reach of the automatable platforms.

**Independent Test**: Same trigger as User Story 1; confirm a new Page post with message + link appears on Facebook.

**Acceptance Scenarios**:

1. **Given** a new post is merged, **When** the workflow runs, **Then** a Facebook Page post is created containing the title, summary, and canonical link.
2. **Given** Facebook credentials are invalid or expired, **When** the post attempt fails, **Then** the workflow reports a failure for Facebook specifically without blocking the X post or the draft issue.

---

### User Story 3 - Auto-publish full post to Medium (Priority: P2)

As the site owner, the full text of the new post is automatically published to my
Medium account, with a canonical link back to the original site.

**Why this priority**: Medium can host the full article (not just a teaser+link like X/Facebook), giving it real standalone reach — but it rides on Medium's officially deprecated integration-token API, so it's scoped at the same priority tier as Facebook rather than above it, and treated as best-effort.

**Independent Test**: Same trigger as User Story 1; confirm a new Medium post appears containing the full post body and a canonical URL pointing back to the site.

**Acceptance Scenarios**:

1. **Given** a new post is merged and a valid Medium integration token is configured, **When** the workflow runs, **Then** a Medium post is created with the post's title, full markdown body, and `canonicalUrl` set to the post's URL on the primary site.
2. **Given** the Medium integration token is missing, invalid, or Medium's deprecated API has stopped accepting the request, **When** the publish attempt fails, **Then** the workflow reports a Medium-specific failure without blocking X, Facebook, or the draft issue.
3. **Given** a post's body contains MDX-specific components (not plain Markdown), **When** it's published to Medium, **Then** those components will not render correctly — this is a known limitation, not a bug.

---

### User Story 4 - Ready-to-paste drafts for Substack, Ko-fi, Patreon (Priority: P3)

As the site owner, since Substack, Ko-fi, and Patreon do not offer a reliable public API for creating posts, I instead get a GitHub Issue with copy-paste-ready drafts for each of those platforms so I can publish natively without composing anything from scratch.

**Why this priority**: Lower priority than the automatable platforms since it still requires a manual step, but it removes the "what do I even write" friction and keeps all five platforms in the loop from a single trigger.

**Independent Test**: After the same trigger, confirm a new GitHub Issue labeled `cross-post` is opened containing distinct, ready-to-paste copy for Substack, Ko-fi, and Patreon, each with a checkbox.

**Acceptance Scenarios**:

1. **Given** a new post is merged, **When** the workflow runs, **Then** a GitHub Issue titled `Cross-post draft: <title>` is created with a checklist item and draft copy for each of Substack, Ko-fi, and Patreon.
2. **Given** the issue already exists for a given post (re-run scenario), **When** the workflow runs again for the same file, **Then** [NEEDS CLARIFICATION: duplicate-issue prevention was not specified — current implementation will open a new issue on every re-run of the workflow for the same commit, which should not normally happen since the trigger is push-based].

### Edge Cases

- What happens when a new `content/posts/*.mdx` file is missing the required `title` frontmatter field? → The workflow logs an error for that file and continues processing any other newly added files, then exits non-zero so the Action run is flagged as failed.
- What happens when multiple posts are added in a single push? → Each file is syndicated independently in sequence; a failure on one file does not stop the others from being processed.
- How does the system handle X or Facebook API rate limits / auth expiry? → The specific platform's step fails and is reported in the Action logs; other platforms and the draft issue still proceed (failures are isolated per-platform via `Promise.allSettled`).
- What happens if `SITE_URL` is not configured? → The generated links will be malformed (missing domain); this is a configuration prerequisite, not a runtime fallback.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST detect newly added files under `content/posts/*.mdx` on every push to `main`, distinguishing "added" from "modified" files.
- **FR-002**: The system MUST NOT trigger a syndication action for edits to existing posts, only for newly added post files.
- **FR-003**: The system MUST read `title` (required) and `summary` (optional, falls back to first body line) frontmatter fields from each new post.
- **FR-004**: The system MUST compose and publish a post to X via the official X API v2, containing the title, summary, and canonical post URL.
- **FR-005**: The system MUST truncate the X post text to fit X's character limit while preserving the full canonical URL.
- **FR-006**: The system MUST compose and publish a post to a configured Facebook Page via the official Graph API, containing the title, summary, and canonical post URL.
- **FR-007**: The system MUST publish the full post body to Medium via Medium's integration-token API, setting `canonicalUrl` to the post's URL on the primary site so Medium is not treated as the canonical source for SEO purposes.
- **FR-008**: The system MUST treat the Medium publish step as best-effort — since Medium's API is officially deprecated and unsupported, a Medium failure (missing token, revoked token, or API unavailability) MUST be reported without blocking any other platform.
- **FR-009**: The system MUST open a GitHub Issue containing distinct, ready-to-paste draft copy for Substack, Ko-fi, and Patreon, since none of these three offer a reliable public API for creating posts.
- **FR-010**: The system MUST treat each platform's publish/draft step as independent — a failure on one platform MUST NOT prevent the others from being attempted.
- **FR-011**: The system MUST read all platform credentials (X, Facebook, Medium) from CI secrets — no credentials are stored in the repository.
- **FR-012**: The system MUST construct the canonical post URL from a configured `SITE_URL` base plus a `/posts/<slug>` path, where slug defaults to the filename and can be overridden via frontmatter.

### Key Entities

- **Post**: A single `content/posts/*.mdx` file. Attributes: `title`, `summary`, `slug`, `tags`, canonical `url`.
- **Syndication Run**: One execution of the workflow for a single push, covering one or more newly added Posts.
- **Draft Issue**: A GitHub Issue capturing manual-publish copy for Substack, Ko-fi, and Patreon for one Post.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new post merged to `main` results in a live X post within 5 minutes, with zero manual steps.
- **SC-002**: A new post merged to `main` results in a live Facebook Page post within 5 minutes, with zero manual steps.
- **SC-003**: When a valid Medium integration token is configured, a new post merged to `main` results in a live Medium post (full body, correct canonical URL) within 5 minutes; when Medium's deprecated API rejects the request or no token is configured, this is visible as an isolated failure in the Action logs without affecting X, Facebook, or the draft issue.
- **SC-004**: A new post merged to `main` results in a GitHub Issue containing usable, distinct draft copy for all three of Substack, Ko-fi, and Patreon, requiring only copy-and-paste (no original writing) to publish natively.
- **SC-005**: Editing an existing post never produces a duplicate social post, Medium post, or draft issue.
- **SC-006**: A credential failure on one platform (e.g., an expired Facebook token, a revoked Medium token) is visible in the Action run logs and does not prevent the other platforms from being attempted in the same run.

## Assumptions

- The site owner manages exactly one X account, one Facebook Page, one Medium account, and one each of Substack/Ko-fi/Patreon — no multi-account fan-out.
- Medium's integration-token API continues to function; since it is officially deprecated, this is treated as best-effort rather than a guarantee, and the pipeline is designed to degrade gracefully (isolated failure) if Medium stops accepting requests entirely.
- `SITE_URL` points at the production domain and is stable (not per-preview-deployment).
- Publishing to Substack, Ko-fi, and Patreon natively (via their own dashboards) is acceptable as the "final step" for those three platforms — full automation there was explicitly descoped due to lack of official publish APIs.
- The GitHub Actions runner has outbound network access to `api.x.com` (or `api.twitter.com`), `graph.facebook.com`, `api.medium.com`, and `api.github.com`.
- Token refresh/rotation for X, Facebook, and Medium credentials is a manual, out-of-band operational task (not automated by this feature).
