import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bun-platform/ui/components/card'

import type { AdminOrganizationDirectoryItem } from '../data-access/use-admin-organization-directory-query'

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString()
}

function formatOwners(owners: AdminOrganizationDirectoryItem['owners']) {
  return owners.length ? owners.map((owner) => `${owner.name} (${owner.email})`).join(', ') : 'No owners found'
}

interface AdminOrganizationDirectoryUiListProps {
  isSearchActive?: boolean
  organizations: AdminOrganizationDirectoryItem[]
  renderManageAction: (organization: AdminOrganizationDirectoryItem) => ReactNode
  renderTitle?: (organization: AdminOrganizationDirectoryItem) => ReactNode
}

export function AdminOrganizationDirectoryUiList(props: AdminOrganizationDirectoryUiListProps) {
  const { isSearchActive = false, organizations, renderManageAction, renderTitle } = props

  if (!organizations.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{isSearchActive ? 'No results found' : 'No Organizations'}</CardTitle>
          <CardDescription>
            {isSearchActive
              ? 'Try adjusting your search terms.'
              : 'Create the first organization from this admin section.'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {organizations.map((organization) => (
        <Card key={organization.id}>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <CardTitle>{renderTitle ? renderTitle(organization) : organization.name}</CardTitle>
                <CardDescription>{organization.slug}</CardDescription>
              </div>
              {renderManageAction(organization)}
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex flex-col gap-1 md:flex-row md:gap-2">
              <span className="text-muted-foreground">Owners:</span>
              <span>{formatOwners(organization.owners)}</span>
            </div>
            <div className="flex flex-col gap-1 md:flex-row md:gap-2">
              <span className="text-muted-foreground">Members:</span>
              <span>{organization.memberCount}</span>
            </div>
            <div className="flex flex-col gap-1 md:flex-row md:gap-2">
              <span className="text-muted-foreground">Created:</span>
              <span>{formatDate(organization.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
