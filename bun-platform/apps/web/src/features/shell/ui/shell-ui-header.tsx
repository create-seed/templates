import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

interface ShellUiHeaderProps {
  actions: ReactNode
  children?: ReactNode
  homeLink: '/' | '/dashboard' | '/onboard'
}

export function ShellUiHeader({ actions, children, homeLink }: ShellUiHeaderProps) {
  return (
    <header className="border-b">
      <div className="flex min-h-14 w-full flex-wrap items-center justify-between gap-3 px-4 py-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4 md:gap-6">
          <Link
            className="hover:text-primary text-sm font-semibold tracking-[0.24em] uppercase transition-colors"
            to={homeLink}
          >
            Bun Platform
          </Link>
          {children}
        </div>
        <div className="flex items-center gap-3">{actions}</div>
      </div>
    </header>
  )
}
