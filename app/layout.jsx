import { Head } from 'nextra/components'
import 'nextra-theme-docs/style.css'
import 'katex/dist/katex.min.css'

export const metadata = {
  title: {
    default: 'Nextra SDD Docs',
    template: '%s – Nextra SDD Docs'
  },
  description: 'A Nextra 4 documentation site built with GitHub Spec-Kit SDD'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>{children}</body>
    </html>
  )
}
