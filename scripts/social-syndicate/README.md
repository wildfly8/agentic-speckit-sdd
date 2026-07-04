# Social Syndication Pipeline

Automatically cross-posts new blog posts to **X**, **Facebook**, and **Medium** when a
new file is merged into `content/posts/` on `main`. Since Substack, Ko-fi, and Patreon
don't offer a reliable public API for creating posts, this pipeline instead opens a
**GitHub Issue** with ready-to-paste drafts for those three so publishing there is
still fast — just manual.

## How it works

1. You add a new file: `content/posts/my-post.mdx` (with frontmatter — see below) and merge to `main`.
2. This triggers Vercel's normal deploy **and** the `.github/workflows/social-syndicate.yml` GitHub Action, in parallel, off the same push.
3. The Action diffs the commit, finds newly **added** `.mdx` files under `content/posts/`, and for each one:
   - Posts a teaser + link to your **X** account
   - Posts a teaser + link to your **Facebook Page**
   - Publishes the **full post** to **Medium**, with `canonicalUrl` pointing back to your site (avoids duplicate-content SEO issues)
   - Opens a GitHub Issue titled `Cross-post draft: <title>` with copy-paste-ready text for Substack, Ko-fi, and Patreon

Editing an existing post won't re-trigger a post — only newly added files do.

## Post frontmatter

```md
---
title: "Your Post Title"
summary: "One or two sentence teaser used in the social copy."
tags: ["optional", "tags"]
slug: "optional-custom-slug"   # defaults to the filename
---

Your post content here...
```

`title` is required. `summary` falls back to the first line of body text if omitted.

## One-time setup

### 1. Repo variable
Add a repository **variable** (Settings → Secrets and variables → Actions → Variables):
- `SITE_URL` — e.g. `https://your-domain.com` (no trailing slash)

### 2. X (Twitter) credentials
1. Create a project + app at [developer.x.com](https://developer.x.com).
2. Under the app's **User authentication settings**, enable **OAuth 1.0a** with **Read and Write** permissions.
3. Generate: API Key & Secret, and Access Token & Secret (make sure the access token is generated *after* write permission is enabled, or regenerate it).
4. Add as repo **secrets**:
   - `X_APP_KEY`
   - `X_APP_SECRET`
   - `X_ACCESS_TOKEN`
   - `X_ACCESS_SECRET`

Note: the free API tier has a monthly write-post cap — check your current limits at developer.x.com if you plan to post frequently.

### 3. Facebook credentials
1. Create an app at [developers.facebook.com](https://developers.facebook.com) (type: Business).
2. Add the **Pages** product, connect the Page you want to post to.
3. Generate a **Page Access Token** with `pages_manage_posts` permission (Graph API Explorer is the fastest way for a single page), then exchange it for a **long-lived token** (60 days) via the `oauth/access_token` endpoint with `grant_type=fb_exchange_token`.
4. Add as repo **secrets**:
   - `FB_PAGE_ID`
   - `FB_PAGE_ACCESS_TOKEN`

Long-lived Page tokens expire after ~60 days unless refreshed — you'll want a calendar reminder or a small refresh script if this runs long-term.

### 4. Medium credentials

⚠️ **Medium's public API is officially deprecated** — Medium stopped issuing new
integration tokens/OAuth clients in 2023. Existing tokens keep working, but this is
unsupported and could stop working at any time without notice. Some accounts have
also reported the "Integration tokens" setting no longer appearing at all. Treat this
as best-effort, not a guaranteed channel.

1. Go to [medium.com/me/settings](https://medium.com/me/settings), scroll to the bottom, and look for **"Integration tokens"**.
2. If present: enter a name (e.g. "agentic-speckit-sdd syndication") and click **Get integration token**. Copy it immediately — it's shown once.
3. If the option isn't there for your account, Medium auto-publishing isn't available to you; skip this and the pipeline will just log a Medium failure per run without blocking X/Facebook/the draft issue.
4. Add as a repo **secret**:
   - `MEDIUM_INTEGRATION_TOKEN`

Note: Medium publishes the **full post body** (as markdown) with `canonicalUrl` set to
your site's post URL, so Google treats your site as the original source rather than
flagging duplicate content. MDX-specific components (e.g. custom React components)
won't render on Medium — only plain Markdown content will look correct there.

### 5. GitHub Issue drafts
No setup needed — uses the automatically-provided `GITHUB_TOKEN`, scoped to `issues: write` in the workflow file.

## Testing it

Add a post under `content/posts/`, commit, and push to `main`. Check the **Actions** tab
for the `Social Syndicate` run, and look for a new Issue labeled `cross-post`.
