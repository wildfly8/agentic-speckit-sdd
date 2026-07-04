// Cross-posts newly-added blog posts (content/posts/*.mdx) to X and Facebook,
// and opens a GitHub Issue with ready-to-paste drafts for Substack, Ko-fi, and Patreon
// (those three don't have a reliable public "create post" API, so we don't auto-publish there).
//
// Expected env vars (set as GitHub Actions secrets/variables):
//   X_APP_KEY, X_APP_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET   - X (Twitter) OAuth 1.0a user-context app
//   FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN                            - Facebook Page + long-lived Page token
//   SITE_URL                                                    - e.g. https://your-domain.com (no trailing slash)
//   GITHUB_TOKEN, GITHUB_REPOSITORY                              - provided automatically by Actions
//   CHANGED_FILES                                               - newline-separated list of added .mdx paths

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { TwitterApi } from 'twitter-api-v2'

const REPO_ROOT = path.resolve(process.cwd(), '../../')

function getChangedFiles() {
  const raw = process.env.CHANGED_FILES || ''
  return raw
    .split('\n')
    .map(f => f.trim())
    .filter(Boolean)
}

function loadPost(relativePath) {
  const fullPath = path.join(REPO_ROOT, relativePath)
  const raw = fs.readFileSync(fullPath, 'utf-8')
  const { data, content } = matter(raw)

  if (!data.title) {
    throw new Error(`"${relativePath}" is missing required frontmatter field: title`)
  }

  const slug = data.slug || path.basename(relativePath, '.mdx')
  const summary = data.summary || content.trim().split('\n').find(Boolean)?.slice(0, 200) || ''
  const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '')
  const url = `${siteUrl}/posts/${slug}`

  return { title: data.title, summary, slug, url, tags: data.tags || [] }
}

function buildTweetText({ title, summary, url }) {
  // Leave room for the auto-shortened t.co link (~24 chars) + a little buffer.
  const budget = 280 - 30
  let text = `${title}\n\n${summary}`
  if (text.length > budget) {
    text = text.slice(0, budget - 1).trimEnd() + '…'
  }
  return `${text}\n\n${url}`
}

async function postToX(post) {
  const { X_APP_KEY, X_APP_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env
  if (!X_APP_KEY || !X_APP_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) {
    throw new Error('Missing X credentials (X_APP_KEY / X_APP_SECRET / X_ACCESS_TOKEN / X_ACCESS_SECRET)')
  }
  const client = new TwitterApi({
    appKey: X_APP_KEY,
    appSecret: X_APP_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_SECRET
  })
  const text = buildTweetText(post)
  const { data } = await client.v2.tweet(text)
  return `https://x.com/i/web/status/${data.id}`
}

async function postToFacebook(post) {
  const { FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN } = process.env
  if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
    throw new Error('Missing Facebook credentials (FB_PAGE_ID / FB_PAGE_ACCESS_TOKEN)')
  }
  const message = `${post.title}\n\n${post.summary}`
  const params = new URLSearchParams({
    message,
    link: post.url,
    access_token: FB_PAGE_ACCESS_TOKEN
  })
  const res = await fetch(`https://graph.facebook.com/v21.0/${FB_PAGE_ID}/feed`, {
    method: 'POST',
    body: params
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(`Facebook API error: ${JSON.stringify(json)}`)
  }
  return `https://www.facebook.com/${json.id}`
}

async function openDraftIssue(post) {
  const { GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env
  if (!GITHUB_TOKEN || !GITHUB_REPOSITORY) {
    console.warn('Skipping draft issue: missing GITHUB_TOKEN / GITHUB_REPOSITORY')
    return null
  }

  const body = `New post published: **${post.title}**
${post.url}

Copy-paste drafts for the platforms without a publish API. Publish natively, then check them off.

- [ ] **Substack**
  \`\`\`
  ${post.title}

  ${post.summary}

  Read the full post: ${post.url}
  \`\`\`
- [ ] **Ko-fi** (Post → Blog Post)
  \`\`\`
  ${post.title}

  ${post.summary}

  ${post.url}
  \`\`\`
- [ ] **Patreon**
  \`\`\`
  ${post.title}

  ${post.summary}

  Full post here: ${post.url}
  \`\`\`
`

  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: `Cross-post draft: ${post.title}`,
      body,
      labels: ['cross-post']
    })
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(`GitHub issue creation failed: ${JSON.stringify(json)}`)
  }
  return json.html_url
}

async function main() {
  const files = getChangedFiles()
  if (files.length === 0) {
    console.log('No newly added posts found. Nothing to syndicate.')
    return
  }

  let hadError = false

  for (const file of files) {
    console.log(`\n=== Syndicating ${file} ===`)
    let post
    try {
      post = loadPost(file)
    } catch (err) {
      console.error(`Failed to read post: ${err.message}`)
      hadError = true
      continue
    }

    const results = await Promise.allSettled([
      postToX(post),
      postToFacebook(post),
      openDraftIssue(post)
    ])

    const [xResult, fbResult, issueResult] = results
    if (xResult.status === 'fulfilled') {
      console.log(`✅ X posted: ${xResult.value}`)
    } else {
      console.error(`❌ X failed: ${xResult.reason.message}`)
      hadError = true
    }

    if (fbResult.status === 'fulfilled') {
      console.log(`✅ Facebook posted: ${fbResult.value}`)
    } else {
      console.error(`❌ Facebook failed: ${fbResult.reason.message}`)
      hadError = true
    }

    if (issueResult.status === 'fulfilled') {
      console.log(`✅ Draft issue opened: ${issueResult.value}`)
    } else {
      console.error(`❌ Draft issue failed: ${issueResult.reason.message}`)
      hadError = true
    }
  }

  if (hadError) {
    process.exitCode = 1
  }
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
