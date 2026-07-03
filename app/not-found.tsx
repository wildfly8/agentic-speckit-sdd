import Link from 'next/link'
import type { ReactElement } from 'react'

export default function NotFound(): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        gap: '1rem'
      }}
    >
      <h1 style={{ fontSize: '2rem', margin: 0 }}>404 — Page Not Found</h1>
      <p style={{ color: '#666' }}>The page you are looking for does not exist.</p>
      <Link href="/" style={{ color: '#0070f3' }}>
        ← Back to Home
      </Link>
    </div>
  )
}
