import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'

import type { AdminOrganizationGetResult } from '../data-access/use-admin-organization-get-query'

import { useAdminOrganizationDelete } from '../data-access/use-admin-organization-delete'
import { AdminOrganizationSettingsUiDeleteDialog } from '../ui/admin-organization-settings-ui-delete-dialog'

interface AdminOrganizationFeatureSettingsDeleteProps {
  organization: AdminOrganizationGetResult
}

export function AdminOrganizationFeatureSettingsDelete(props: AdminOrganizationFeatureSettingsDeleteProps) {
  const { organization } = props
  const navigate = useNavigate()
  const deleteOrganization = useAdminOrganizationDelete()

  async function handleDelete() {
    return await deleteOrganization
      .mutateAsync({
        organizationId: organization.id,
      })
      .then(async () => {
        await navigate({
          to: '/admin/organizations',
        })

        return true
      })
      .catch(() => false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danger Zone</CardTitle>
        <CardDescription>Delete the organization and all of its memberships.</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminOrganizationSettingsUiDeleteDialog isPending={deleteOrganization.isPending} onDelete={handleDelete} />
      </CardContent>
    </Card>
  )
}
