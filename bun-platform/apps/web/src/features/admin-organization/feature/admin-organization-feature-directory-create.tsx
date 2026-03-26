import { useDeferredValue, useState } from 'react'

import { useAdminOrganizationDirectoryCreate } from '../data-access/use-admin-organization-directory-create'
import {
  type AdminOrganizationOwnerCandidate,
  useAdminOrganizationOwnerCandidatesQuery,
} from '../data-access/use-admin-organization-owner-candidates-query'
import { AdminOrganizationDirectoryUiCreateDialog } from '../ui/admin-organization-directory-ui-create-dialog'

const defaultCreateValues = {
  logo: '',
  name: '',
  slug: '',
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

interface AdminOrganizationFeatureDirectoryCreateProps {
  currentUser: AdminOrganizationOwnerCandidate
  onCreated: (organizationId: string) => void
}

export function AdminOrganizationFeatureDirectoryCreate(props: AdminOrganizationFeatureDirectoryCreateProps) {
  const { currentUser, onCreated } = props
  const createOrganization = useAdminOrganizationDirectoryCreate()
  const [createValues, setCreateValues] = useState(defaultCreateValues)
  const [isOpen, setIsOpen] = useState(false)
  const [ownerSearch, setOwnerSearch] = useState('')
  const [selectedOwner, setSelectedOwner] = useState(currentUser)
  const deferredOwnerSearch = useDeferredValue(ownerSearch)
  const normalizedOwnerSearch = deferredOwnerSearch.trim()
  const ownerCandidates = useAdminOrganizationOwnerCandidatesQuery({
    enabled: isOpen,
    search: normalizedOwnerSearch || undefined,
  })

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    setOwnerSearch('')
    setSelectedOwner(currentUser)
  }

  function handleNameBlur() {
    setCreateValues((currentValues) => {
      if (currentValues.slug.trim()) {
        return currentValues
      }

      return {
        ...currentValues,
        slug: slugify(currentValues.name),
      }
    })
  }

  async function handleSubmit() {
    const organization = await createOrganization
      .mutateAsync({
        logo: createValues.logo || undefined,
        name: createValues.name,
        ownerUserId: selectedOwner.id,
        slug: createValues.slug,
      })
      .catch(() => null)

    if (!organization) {
      return
    }

    setCreateValues(defaultCreateValues)
    setIsOpen(false)
    setOwnerSearch('')
    setSelectedOwner(currentUser)
    onCreated(organization.id)
  }

  return (
    <AdminOrganizationDirectoryUiCreateDialog
      createValues={createValues}
      isOpen={isOpen}
      isOwnerCandidatesPending={ownerCandidates.isPending}
      isPending={createOrganization.isPending}
      onLogoChange={(logo) =>
        setCreateValues((currentValues) => ({
          ...currentValues,
          logo,
        }))
      }
      onNameBlur={handleNameBlur}
      onNameChange={(name) =>
        setCreateValues((currentValues) => ({
          ...currentValues,
          name,
        }))
      }
      onOpenChange={handleOpenChange}
      onOwnerSearchChange={setOwnerSearch}
      onOwnerSelect={setSelectedOwner}
      onSlugChange={(slug) =>
        setCreateValues((currentValues) => ({
          ...currentValues,
          slug,
        }))
      }
      onSubmit={() => {
        void handleSubmit()
      }}
      ownerCandidates={ownerCandidates.data ?? []}
      ownerSearch={ownerSearch}
      selectedOwner={selectedOwner}
    />
  )
}
