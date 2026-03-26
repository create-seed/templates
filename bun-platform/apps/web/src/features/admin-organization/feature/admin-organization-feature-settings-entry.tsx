import {
  type AdminOrganizationGetResult,
  useAdminOrganizationGetQuery,
} from '../data-access/use-admin-organization-get-query'
import { AdminOrganizationFeatureSettings } from './admin-organization-feature-settings'
import { AdminOrganizationFeatureSettingsDelete } from './admin-organization-feature-settings-delete'

interface AdminOrganizationFeatureSettingsEntryProps {
  initialOrganization: AdminOrganizationGetResult
}

export function AdminOrganizationFeatureSettingsEntry(props: AdminOrganizationFeatureSettingsEntryProps) {
  const { initialOrganization } = props
  const { data } = useAdminOrganizationGetQuery(initialOrganization.id, {
    initialData: initialOrganization,
  })

  if (!data) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminOrganizationFeatureSettings organization={data} />
      <AdminOrganizationFeatureSettingsDelete organization={data} />
    </div>
  )
}
