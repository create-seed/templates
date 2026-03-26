import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { Button } from '@bun-platform/ui/components/button'

import { useAdminOrganizationDirectoryQuery } from '../data-access/use-admin-organization-directory-query'
import { AdminOrganizationDirectoryUiList } from '../ui/admin-organization-directory-ui-list'
import { AdminOrganizationDirectoryUiSearch } from '../ui/admin-organization-directory-ui-search'
import { AdminOrganizationFeatureDirectoryCreate } from './admin-organization-feature-directory-create'

interface AdminOrganizationFeatureDirectoryProps {
  session: {
    user: {
      email: string
      id: string
      name: string
    }
  }
}

export function AdminOrganizationFeatureDirectory(props: AdminOrganizationFeatureDirectoryProps) {
  const { session } = props
  const navigate = useNavigate()
  const [organizationSearch, setOrganizationSearch] = useState('')
  const deferredOrganizationSearch = useDeferredValue(organizationSearch)
  const normalizedOrganizationSearch = deferredOrganizationSearch.trim()
  const organizations = useAdminOrganizationDirectoryQuery({
    search: normalizedOrganizationSearch || undefined,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-medium">Organizations</h2>
          <p className="text-muted-foreground text-sm">
            Manage organizations, ownership, and membership from one place.
          </p>
        </div>
        <AdminOrganizationFeatureDirectoryCreate
          currentUser={session.user}
          onCreated={(organizationId) => {
            void navigate({
              params: {
                organizationId,
              },
              to: '/admin/organizations/$organizationId',
            })
          }}
        />
      </div>

      <AdminOrganizationDirectoryUiSearch onChange={setOrganizationSearch} value={organizationSearch} />

      {organizations.isPending ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading organizations
        </div>
      ) : (
        <AdminOrganizationDirectoryUiList
          isSearchActive={Boolean(normalizedOrganizationSearch)}
          organizations={organizations.data?.organizations ?? []}
          renderManageAction={(organization) => (
            <Link
              params={{
                organizationId: organization.id,
              }}
              to="/admin/organizations/$organizationId"
            >
              <Button variant="outline">Manage</Button>
            </Link>
          )}
          renderTitle={(organization) => (
            <Link
              className="hover:text-primary transition-colors"
              params={{
                organizationId: organization.id,
              }}
              to="/admin/organizations/$organizationId"
            >
              {organization.name}
            </Link>
          )}
        />
      )}
    </div>
  )
}
