import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'
import { Tabs, TabsList, TabsTrigger } from '@bun-platform/ui/components/tabs'

import {
  type AdminOrganizationGetResult,
  useAdminOrganizationGetQuery,
} from '../data-access/use-admin-organization-get-query'

const organizationTabs = [
  {
    label: 'Overview',
    to: '/admin/organizations/$organizationId',
    value: 'overview',
  },
  {
    label: 'Members',
    to: '/admin/organizations/$organizationId/members',
    value: 'members',
  },
  {
    label: 'Settings',
    to: '/admin/organizations/$organizationId/settings',
    value: 'settings',
  },
  {
    label: 'Todos',
    to: '/admin/organizations/$organizationId/todos',
    value: 'todos',
  },
] as const

function getCurrentTab(pathname: string) {
  if (pathname.endsWith('/members')) {
    return 'members'
  }

  if (pathname.endsWith('/settings')) {
    return 'settings'
  }

  if (pathname.endsWith('/todos')) {
    return 'todos'
  }

  return 'overview'
}

export function AdminOrganizationFeatureShell({
  children,
  initialOrganization,
}: {
  children: ReactNode
  initialOrganization: AdminOrganizationGetResult | null
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = getCurrentTab(location.pathname)
  const organizationId = initialOrganization?.id ?? ''
  const { data, isPending } = useAdminOrganizationGetQuery(organizationId, {
    enabled: Boolean(initialOrganization),
    initialData: initialOrganization ?? undefined,
  })

  if (!initialOrganization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Not Found</CardTitle>
          <CardDescription>The requested organization could not be loaded.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isPending && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Not Found</CardTitle>
          <CardDescription>The requested organization could not be loaded.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <Link className="text-muted-foreground hover:text-foreground text-sm" to="/admin/organizations">
            Back to organizations
          </Link>
          {data ? (
            <>
              <h2 className="text-lg font-medium">{data.name}</h2>
              <p className="text-muted-foreground text-sm">{data.slug}</p>
            </>
          ) : (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading organization
            </div>
          )}
        </div>
      </div>

      <Tabs
        onValueChange={(value) => {
          const nextTab = organizationTabs.find((tab) => tab.value === value)

          if (!nextTab || nextTab.value === currentTab) {
            return
          }

          void navigate({
            params: { organizationId },
            to: nextTab.to,
          })
        }}
        value={currentTab}
      >
        <TabsList className="w-full justify-start">
          {organizationTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              nativeButton={false}
              render={<Link params={{ organizationId }} to={tab.to} />}
              value={tab.value}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {data ? (
        children
      ) : (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading organization
        </div>
      )}
    </div>
  )
}
