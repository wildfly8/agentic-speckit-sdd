# Quickstart: Social Syndication Pipeline

## Prerequisites

- Existing repo already deploying to Vercel on push to `main`
- A GitHub repository with Actions enabled
- An X Developer App, a Facebook Business App + Page — see full credential setup in
  [`scripts/social-syndicate/README.md`](../../scripts/social-syndicate/README.md)

## One-time setup

1. Add repo **variable** `SITE_URL` (Settings → Secrets and variables → Actions → Variables).
2. Add repo **secrets**: `X_APP_KEY`, `X_APP_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`, `FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN`.
3. No extra setup needed for the GitHub Issue draft step — it uses the built-in `GITHUB_TOKEN`.

## Publishing a new post

```bash
# 1. Create the post with required frontmatter
cat > content/posts/my-new-post.mdx << 'EOF'
---
title: "My New Post"
summary: "A short teaser for the social copy."
---

Full post body here...
EOF

# 2. Commit and push to main
git add content/posts/my-new-post.mdx
git commit -m "post: my new post"
git push origin main
```

This single push:

- Triggers the existing Vercel deploy (site goes live at `/posts/my-new-post`)
- Triggers `.github/workflows/social-syndicate.yml`, which:
  - Posts a tweet to X
  - Posts to the configured Facebook Page
  - Opens a GitHub Issue labeled `cross-post` with draft copy for Substack, Ko-fi, and Patreon

## Verifying it worked

- Check the **Actions** tab for the `Social Syndicate` run and its logs.
- Check your X account and Facebook Page for the new posts.
- Check the repo's **Issues** tab, filtered by the `cross-post` label.

## Local dry-run (no live credentials needed)

```bash
cd scripts/social-syndicate
npm install
SITE_URL="https://example.com" node --input-type=module -e "
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
const raw = fs.readFileSync('../../content/posts/hello-world.mdx', 'utf-8');
console.log(matter(raw).data);
"
```

## SDD Workflow (Spec-Kit)

```text
/speckit-constitution → /speckit-specify → /speckit-plan → /speckit-tasks → /speckit-implement
```

Artifacts for this feature live in `specs/002-social-syndication-pipeline/`.
