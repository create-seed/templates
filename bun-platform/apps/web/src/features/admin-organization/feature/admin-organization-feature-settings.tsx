import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'

import type { AdminOrganizationGetResult } from '../data-access/use-admin-organization-get-query'

import { useAdminOrganizationUpdate } from '../data-access/use-admin-organization-update'
import { AdminOrganizationSettingsUiForm } from '../ui/admin-organization-settings-ui-form'

interface AdminOrganizationFeatureSettingsProps {
  organization: AdminOrganizationGetResult
}

export function AdminOrganizationFeatureSettings(props: AdminOrganizationFeatureSettingsProps) {
  const { organization } = props
  const updateOrganization = useAdminOrganizationUpdate(organization.id)

  async function handleSubmit(values: { logo: string; name: string; slug: string }) {
    return await updateOrganization
      .mutateAsync({
        data: {
          logo: values.logo || undefined,
          name: values.name,
          slug: values.slug,
        },
        organizationId: organization.id,
      })
      .then(() => true)
      .catch(() => false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Details</CardTitle>
        <CardDescription>Edit the core organization fields.</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminOrganizationSettingsUiForm
          initialValues={{
            logo: organization.logo ?? '',
            name: organization.name,
            slug: organization.slug,
          }}
          isPending={updateOrganization.isPending}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  )
}
