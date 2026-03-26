import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'

import {
  type AdminOrganizationGetResult,
  useAdminOrganizationGetQuery,
} from '../data-access/use-admin-organization-get-query'

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString()
}

function formatOwners(owners: AdminOrganizationGetResult['owners']) {
  return owners.length ? owners.map((owner) => `${owner.name} (${owner.email})`).join(', ') : 'No owners found'
}

interface AdminOrganizationFeatureOverviewProps {
  initialOrganization: AdminOrganizationGetResult
}

export function AdminOrganizationFeatureOverview(props: AdminOrganizationFeatureOverviewProps) {
  const { initialOrganization } = props
  const { data } = useAdminOrganizationGetQuery(initialOrganization.id, {
    initialData: initialOrganization,
  })

  if (!data) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Reference values for support and auditing.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex flex-col gap-1 md:flex-row md:gap-2">
          <span className="text-muted-foreground">Organization ID:</span>
          <span>{data.id}</span>
        </div>
        <div className="flex flex-col gap-1 md:flex-row md:gap-2">
          <span className="text-muted-foreground">Created:</span>
          <span>{formatDate(data.createdAt)}</span>
        </div>
        <div className="flex flex-col gap-1 md:flex-row md:gap-2">
          <span className="text-muted-foreground">Members:</span>
          <span>{data.members.length}</span>
        </div>
        <div className="flex flex-col gap-1 md:flex-row md:gap-2">
          <span className="text-muted-foreground">Owners:</span>
          <span>{formatOwners(data.owners)}</span>
        </div>
        <div className="flex flex-col gap-1 md:flex-row md:gap-2">
          <span className="text-muted-foreground">Logo:</span>
          <span>{data.logo ?? 'No logo configured'}</span>
        </div>
      </CardContent>
    </Card>
  )
}
