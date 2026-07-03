# Quickstart: Nextra SDD Docs

## Prerequisites

- Node.js 20+
- npm

## Local Development

```bash
git clone <your-repo-url>
cd agentic-speckit-sdd
npm install
npm run dev
```

Open http://localhost:3000

## Production Build

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push this repo to a public GitHub repository.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Accept defaults (Framework: Next.js, Build: `npm run build`).
4. Deploy.

## SDD Workflow (Spec-Kit)

```text
/speckit-constitution → /speckit-specify → /speckit-plan → /speckit-tasks → /speckit-implement
```

Artifacts live in `specs/` and `.specify/`.
