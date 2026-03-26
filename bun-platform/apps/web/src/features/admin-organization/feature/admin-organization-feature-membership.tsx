import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'

import {
  type AdminOrganizationGetResult,
  useAdminOrganizationGetQuery,
} from '../data-access/use-admin-organization-get-query'
import { useAdminOrganizationMemberRemove } from '../data-access/use-admin-organization-member-remove'
import { useAdminOrganizationMemberRoleUpdate } from '../data-access/use-admin-organization-member-role-update'
import {
  AdminOrganizationMembershipUiList,
  type AdminOrganizationMembershipRole,
} from '../ui/admin-organization-membership-ui-list'

interface AdminOrganizationFeatureMembershipProps {
  initialOrganization: AdminOrganizationGetResult
}

export function AdminOrganizationFeatureMembership(props: AdminOrganizationFeatureMembershipProps) {
  const { initialOrganization } = props
  const removeMember = useAdminOrganizationMemberRemove(initialOrganization.id)
  const updateMemberRole = useAdminOrganizationMemberRoleUpdate(initialOrganization.id)
  const { data } = useAdminOrganizationGetQuery(initialOrganization.id, {
    initialData: initialOrganization,
  })

  async function handleMemberRemove(memberId: string) {
    return await removeMember
      .mutateAsync({
        memberId,
      })
      .then(() => true)
      .catch(() => false)
  }

  async function handleMemberRoleUpdate(memberId: string, role: AdminOrganizationMembershipRole) {
    return await updateMemberRole
      .mutateAsync({
        memberId,
        role,
      })
      .then(() => true)
      .catch(() => false)
  }

  if (!data) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>Update roles or remove members from the organization.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <AdminOrganizationMembershipUiList
          isRemovePending={removeMember.isPending}
          isUpdatePending={updateMemberRole.isPending}
          members={data.members}
          onMemberRemove={handleMemberRemove}
          onMemberRoleUpdate={handleMemberRoleUpdate}
        />
      </CardContent>
    </Card>
  )
}
