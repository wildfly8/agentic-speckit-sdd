import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import type { ReactNode } from 'react'

const navbar = (
  <Navbar
    logo={<b>Nextra SDD Docs</b>}
    projectLink="https://github.com/wildfly8/agentic-speckit-sdd"
  />
)

const footer = (
  <Footer>
    MIT {new Date().getFullYear()} © Nextra SDD Docs — Built with{' '}
    <a href="https://github.com/github/spec-kit" target="_blank" rel="noreferrer">
      Spec-Kit SDD
    </a>
  </Footer>
)

export default async function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <Layout
      navbar={navbar}
      pageMap={await getPageMap()}
      docsRepositoryBase="https://github.com/wildfly8/agentic-speckit-sdd/tree/main"
      footer={footer}
      sidebar={{ defaultMenuCollapseLevel: 1 }}
    >
      {children}
    </Layout>
  )
}
