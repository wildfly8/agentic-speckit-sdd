# Research: Social Syndication Pipeline

**Date**: 2026-07-03

## Publish-API capability by platform

Confirmed via live web search (current as of 2026-07-03) before committing to a design:

| Platform | Official write API? | Finding |
|---|---|---|
| X (Twitter) | ✅ Yes | API v2 supports posting via OAuth 1.0a (user context) or OAuth 2.0 user-context. Free tier has a monthly post cap; sufficient for a personal blog's cadence. |
| Facebook | ✅ Yes | Graph API `/{page-id}/feed` endpoint accepts a message + link with a Page Access Token. Long-lived tokens last ~60 days. |
| Substack | ❌ No | Substack's only public "Developer API" (added ~April 2026) is read-only public profile lookup by LinkedIn handle — nothing about creating posts. Actual posting is only possible via unofficial, cookie/session-based reverse-engineered libraries, which is a ToS/stability risk, not an integration to build production automation on. |
| Ko-fi | ❌ No | Ko-fi's only API surface is an *outgoing* webhook fired on a completed donation/payment. There is no endpoint to create a Ko-fi post. |
| Patreon | ⚠️ Partial | The maintained v2 API is scoped to campaigns/members/tiers/webhooks (membership + gating use cases). A "create post" endpoint exists only as an undocumented, unfinished internal API — not something to depend on. |

**Decision**: Automate X and Facebook directly. For Substack, Ko-fi, and Patreon,
generate ready-to-paste draft copy and surface it via a GitHub Issue rather than
attempting fragile, unofficial auto-publish.

## X API v2 posting

- Endpoint: `POST /2/tweets` via `client.v2.tweet(text)` (twitter-api-v2 SDK handles OAuth 1.0a request signing).
- Requires a Developer App with **OAuth 1.0a, Read and Write** permission enabled *before* generating the Access Token/Secret (regenerating tokens after changing permissions is required).
- Character limit: 280 for standard accounts; links are auto-shortened to ~23 chars by t.co but the pre-shortened URL still counts toward the budget conservatively in this implementation.

## Facebook Graph API posting

- Endpoint: `POST https://graph.facebook.com/v21.0/{page-id}/feed` with `message`, `link`, `access_token` as form params.
- Requires a Business-type Meta App with the Pages product added, and a Page Access Token with `pages_manage_posts`.
- Long-lived Page tokens last ~60 days; no auto-refresh is implemented in this feature (documented as a manual operational task).

## GitHub Issue as the "manual platform" draft mechanism

- Uses the auto-provided `GITHUB_TOKEN` (no extra secret) with `issues: write` workflow permission.
- `POST /repos/{owner}/{repo}/issues` via GitHub REST API, labeled `cross-post` for easy filtering.

## Trigger mechanism

- GitHub Actions `on: push: branches: [main], paths: ['content/posts/**.mdx']`.
- This fires on the same push event Vercel already watches for deployment — confirmed with the user that their existing GitHub → Vercel integration auto-deploys on push, so no separate Vercel deploy-hook polling is needed; the syndication workflow and the Vercel deploy run in parallel off the same commit.
- `git diff --name-status HEAD^ HEAD -- content/posts` filtered to status `A` distinguishes newly added files from edits, satisfying FR-002.

## Dependency isolation

- `gray-matter` and `twitter-api-v2` are installed only inside `scripts/social-syndicate/package.json`, not the root `package.json`, so the Vercel build for the Next.js app is completely unaffected (Constitution Principle III: Static-First Deployment).
