import { useState } from 'react'
import { Button } from '@bun-platform/ui/components/button'

import type { AdminOrganizationGetMember } from '../data-access/use-admin-organization-get-query'

import { AdminOrganizationMembershipUiRemoveDialog } from './admin-organization-membership-ui-remove-dialog'

const roleOptions = ['owner', 'admin', 'member'] as const

export type AdminOrganizationMembershipRole = (typeof roleOptions)[number]

interface AdminOrganizationMembershipUiListProps {
  isRemovePending: boolean
  isUpdatePending: boolean
  members: AdminOrganizationGetMember[]
  onMemberRemove: (memberId: string) => Promise<boolean>
  onMemberRoleUpdate: (memberId: string, role: AdminOrganizationMembershipRole) => Promise<boolean>
}

export function AdminOrganizationMembershipUiList(props: AdminOrganizationMembershipUiListProps) {
  const { isRemovePending, isUpdatePending, members, onMemberRemove, onMemberRoleUpdate } = props
  const [memberPendingRemoval, setMemberPendingRemoval] = useState<{
    id: string
    name: string
  } | null>(null)

  if (!members.length) {
    return <p className="text-muted-foreground text-sm">This organization has no members.</p>
  }

  return (
    <>
      {members.map((member) => {
        const memberRoles = roleOptions.includes(member.role as AdminOrganizationMembershipRole)
          ? roleOptions
          : [member.role, ...roleOptions]

        return (
          <div className="grid gap-3 border p-3 md:grid-cols-[1fr_140px_auto]" key={member.id}>
            <div className="flex flex-col gap-1">
              <p className="text-sm">{member.name}</p>
              <p className="text-muted-foreground text-xs">{member.email}</p>
            </div>
            <select
              aria-label={`Role for ${member.name}`}
              className="bg-background border px-2 py-1 text-sm"
              disabled={isUpdatePending}
              onChange={(event) => {
                void onMemberRoleUpdate(member.id, event.target.value as AdminOrganizationMembershipRole)
              }}
              value={member.role}
            >
              {memberRoles.map((role) => {
                const isSupportedRole = roleOptions.includes(role as AdminOrganizationMembershipRole)

                return (
                  <option disabled={!isSupportedRole} key={role} value={role}>
                    {role}
                  </option>
                )
              })}
            </select>
            <Button
              disabled={isRemovePending}
              onClick={() =>
                setMemberPendingRemoval({
                  id: member.id,
                  name: member.name,
                })
              }
              type="button"
              variant="outline"
            >
              Remove
            </Button>
          </div>
        )
      })}
      <AdminOrganizationMembershipUiRemoveDialog
        isOpen={Boolean(memberPendingRemoval)}
        isPending={isRemovePending}
        memberName={memberPendingRemoval?.name ?? 'this member'}
        onCancel={() => setMemberPendingRemoval(null)}
        onConfirm={async () => {
          if (!memberPendingRemoval) {
            return
          }

          const didRemoveMember = await onMemberRemove(memberPendingRemoval.id)

          if (didRemoveMember) {
            setMemberPendingRemoval(null)
          }
        }}
      />
    </>
  )
}
