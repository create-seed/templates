import { Outlet, createFileRoute } from '@tanstack/react-router'

import { getAdminOrganizationGetRouteQueryOptions } from '@/features/admin-organization/data-access/use-admin-organization-get-query'
import { AdminOrganizationFeatureShell } from '@/features/admin-organization/feature/admin-organization-feature-shell'

export const Route = createFileRoute('/admin/organizations/$organizationId')({
  beforeLoad: async ({ context, params }) => {
    try {
      const organization = await context.queryClient.ensureQueryData(
        getAdminOrganizationGetRouteQueryOptions(params.organizationId),
      )

      return { organization }
    } catch {
      return { organization: null }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { organization } = Route.useRouteContext()

  return (
    <AdminOrganizationFeatureShell initialOrganization={organization}>
      <Outlet />
    </AdminOrganizationFeatureShell>
  )
}
