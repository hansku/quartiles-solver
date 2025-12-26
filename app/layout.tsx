import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quartiles Solver',
  description: 'Solve Quartiles word puzzles by finding valid word combinations from tiles',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

