import { createFileRoute } from '@tanstack/react-router'

import { AdminOrganizationFeatureOverview } from '@/features/admin-organization/feature/admin-organization-feature-overview'

import { Route as OrganizationRoute } from './route'

export const Route = createFileRoute('/admin/organizations/$organizationId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organization } = OrganizationRoute.useRouteContext()

  if (!organization) {
    return null
  }

  return <AdminOrganizationFeatureOverview initialOrganization={organization} />
}
