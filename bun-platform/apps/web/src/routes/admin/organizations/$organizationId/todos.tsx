import { createFileRoute } from '@tanstack/react-router'

import { AdminOrganizationFeatureTodos } from '@/features/admin-organization/feature/admin-organization-feature-todos'

import { Route as OrganizationRoute } from './route'

export const Route = createFileRoute('/admin/organizations/$organizationId/todos')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organization } = OrganizationRoute.useRouteContext()

  if (!organization) {
    return null
  }

  return <AdminOrganizationFeatureTodos initialOrganization={organization} />
}
