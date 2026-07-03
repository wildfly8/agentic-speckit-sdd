# Nextra SDD Docs

A modern documentation site built with **[Nextra 4](https://nextra.site/)** and **[GitHub Spec-Kit](https://github.com/github/spec-kit)** Spec-Driven Development (SDD).

## Features

- **Home page** with links to demo pages
- **Mermaid diagrams** rendered from Markdown code blocks
- **LaTeX math** pre-rendered with KaTeX
- **Nextra Docs Theme** with sidebar navigation and search
- **Vercel-ready** — deploy with zero configuration

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Push to GitHub

```bash
# Create a new public repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/agentic-speckit-sdd.git
git add .
git commit -m "Initial commit: Nextra SDD docs site"
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username and update `projectLink` / `docsRepositoryBase` in `app/layout.jsx`.

## Deploy to Vercel

1. Push this repository to GitHub (see above).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Accept the defaults:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: (default)
4. Click **Deploy**.

Your site will be live at `https://your-project.vercel.app`.

## Spec-Driven Development

This project was built using Spec-Kit SDD:

| Phase | Artifact | Location |
|-------|----------|----------|
| Constitution | Project principles | `.specify/memory/constitution.md` |
| Specify | Feature spec | `specs/001-nextra-docs-site/spec.md` |
| Plan | Implementation plan | `specs/001-nextra-docs-site/plan.md` |
| Tasks | Actionable tasks | `specs/001-nextra-docs-site/tasks.md` |
| Implement | This codebase | `app/`, `content/` |

### SDD Commands (Cursor)

With Spec-Kit skills installed in `.cursor/skills/`:

```
/speckit-constitution
/speckit-specify
/speckit-plan
/speckit-tasks
/speckit-implement
```

## Project Structure

```text
├── app/
│   ├── layout.jsx              # Nextra Docs Theme root layout
│   └── [[...mdxPath]]/page.jsx # MDX catch-all route
├── content/
│   ├── index.mdx               # Home page
│   ├── mermaid.mdx             # Mermaid demo
│   └── math.mdx                # LaTeX demo
├── specs/                      # SDD artifacts
├── .specify/                   # Spec-Kit templates & scripts
├── .cursor/skills/             # Spec-Kit Cursor skills
├── mdx-components.jsx
└── next.config.mjs
```

## License

MIT
