import { createFileRoute } from '@tanstack/react-router'

import { AdminOrganizationFeatureSettingsEntry } from '@/features/admin-organization/feature/admin-organization-feature-settings-entry'

import { Route as OrganizationRoute } from './route'

export const Route = createFileRoute('/admin/organizations/$organizationId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organization } = OrganizationRoute.useRouteContext()

  if (!organization) {
    return null
  }

  return <AdminOrganizationFeatureSettingsEntry initialOrganization={organization} />
}
