import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

type AdminLink = {
  label: string
  to: '/admin/dashboard' | '/admin/organizations'
}

const links = [
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
  },
  {
    label: 'Organizations',
    to: '/admin/organizations',
  },
] satisfies AdminLink[]

export function AdminFeatureShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-muted-foreground">Platform administration tools.</p>
      </div>
      <nav className="flex flex-wrap gap-2 border-b pb-3 text-sm">
        {links.map((link) => (
          <Link
            activeProps={{
              className: 'border-foreground text-foreground',
            }}
            className="text-muted-foreground hover:text-foreground border px-2 py-1 transition-colors"
            key={link.to}
            to={link.to}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  )
}
