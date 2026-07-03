import nextra from 'nextra'
import type { NextConfig } from 'next'

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false
  }
})

const config: NextConfig = withNextra({
  output: 'standalone'
})

export default config