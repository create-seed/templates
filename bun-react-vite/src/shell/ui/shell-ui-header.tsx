import { Link, NavLink } from 'react-router'

import { ThemeToggle } from '@/core/ui/theme-toggle'
import { cn } from '@/core/util/utils'

export interface HeaderLink {
  label: string
  to: string
}
export function ShellUiHeader({ links }: { links: HeaderLink[] }) {
  return (
    <header className="border-b border-border/60 bg-background px-4 py-3">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
          <Link className="text-xl font-semibold tracking-tight" to="/">
            Bun React Vite
          </Link>
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-4">
            {links.map((link) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'border-b-2 border-transparent px-1 py-2 text-sm font-medium transition-colors',
                    isActive ? 'border-foreground text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )
                }
                key={link.to}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
