import { createFileRoute } from '@tanstack/react-router'

import { AdminOrganizationFeatureMembership } from '@/features/admin-organization/feature/admin-organization-feature-membership'

import { Route as OrganizationRoute } from './route'

export const Route = createFileRoute('/admin/organizations/$organizationId/members')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organization } = OrganizationRoute.useRouteContext()

  if (!organization) {
    return null
  }

  return <AdminOrganizationFeatureMembership initialOrganization={organization} />
}
