import { Link } from '@tanstack/react-router'

import type { OrganizationListMineData } from '@/features/organization/data-access/get-organization-list-mine'
import { hasActiveOrganization } from '@/features/organization/feature/organization-feature-active-access'
import { OrganizationFeatureSelectActive } from '@/features/organization/feature/organization-feature-select-active'

import { useShellHealthCheckQuery } from '../data-access/use-shell-health-check-query'
import { ShellUiHeader } from '../ui/shell-ui-header'
import { ShellUiStatusIndicator } from '../ui/shell-ui-status-indicator'
import { ShellUiThemeToggle } from '../ui/shell-ui-theme-toggle'

import { ShellFeatureUserMenu } from './shell-feature-user-menu'

interface ShellFeatureHeaderSession {
  session?: {
    activeOrganizationId?: string | null
  } | null
  user: {
    role?: string | null
  }
}

export interface ShellFeatureHeaderProps {
  initialOrganizations: OrganizationListMineData | null
  session: ShellFeatureHeaderSession | null
}

export function ShellFeatureHeader({ initialOrganizations, session }: ShellFeatureHeaderProps) {
  const healthCheck = useShellHealthCheckQuery()
  const isOnboarded = hasActiveOrganization(session) || Boolean(initialOrganizations?.activeOrganizationId)
  const homeLink = session ? (isOnboarded ? '/dashboard' : '/onboard') : '/'
  const links = session
    ? [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Todos', to: '/todos' },
        { label: 'AI Chat', to: '/ai' },
        ...(session.user.role === 'admin' ? [{ label: 'Admin', to: '/admin' }] : []),
      ]
    : []
  const status = healthCheck.isLoading ? 'loading' : healthCheck.data ? 'connected' : 'disconnected'

  return (
    <ShellUiHeader
      actions={
        <>
          <ShellUiStatusIndicator status={status} />
          <ShellUiThemeToggle />
          <ShellFeatureUserMenu />
        </>
      }
      homeLink={homeLink}
    >
      {session && isOnboarded ? (
        <>
          <OrganizationFeatureSelectActive initialData={initialOrganizations} />
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-4 text-sm">
            {links.map(({ label, to }) => {
              return (
                <Link
                  activeOptions={{
                    exact: false,
                    includeSearch: false,
                  }}
                  activeProps={{
                    className: 'text-foreground',
                  }}
                  className="transition-colors"
                  inactiveProps={{
                    className: 'text-muted-foreground hover:text-foreground',
                  }}
                  key={to}
                  to={to}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </>
      ) : null}
    </ShellUiHeader>
  )
}
