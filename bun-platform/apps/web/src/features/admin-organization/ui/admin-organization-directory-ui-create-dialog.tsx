import { Loader2, Plus } from 'lucide-react'
import { Button } from '@bun-platform/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@bun-platform/ui/components/dialog'
import { Input } from '@bun-platform/ui/components/input'
import { cn } from '@bun-platform/ui/lib/utils'

import type { AdminOrganizationOwnerCandidate } from '../data-access/use-admin-organization-owner-candidates-query'

interface AdminOrganizationDirectoryUiCreateDialogValues {
  logo: string
  name: string
  slug: string
}

interface AdminOrganizationDirectoryUiCreateDialogProps {
  createValues: AdminOrganizationDirectoryUiCreateDialogValues
  isOpen: boolean
  isOwnerCandidatesPending: boolean
  isPending: boolean
  onLogoChange: (logo: string) => void
  onNameBlur: () => void
  onNameChange: (name: string) => void
  onOpenChange: (isOpen: boolean) => void
  onOwnerSearchChange: (search: string) => void
  onOwnerSelect: (owner: AdminOrganizationOwnerCandidate) => void
  onSlugChange: (slug: string) => void
  onSubmit: () => void
  ownerCandidates: AdminOrganizationOwnerCandidate[]
  ownerSearch: string
  selectedOwner: AdminOrganizationOwnerCandidate
}

export function AdminOrganizationDirectoryUiCreateDialog(props: AdminOrganizationDirectoryUiCreateDialogProps) {
  const {
    createValues,
    isOpen,
    isOwnerCandidatesPending,
    isPending,
    onLogoChange,
    onNameBlur,
    onNameChange,
    onOpenChange,
    onOwnerSearchChange,
    onOwnerSelect,
    onSlugChange,
    onSubmit,
    ownerCandidates,
    ownerSearch,
    selectedOwner,
  } = props

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogTrigger render={<Button data-icon="inline-start" />}>
        <Plus />
        Create Organization
      </DialogTrigger>
      <DialogContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Pick an existing user as the initial owner, then create the organization with core defaults.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm" htmlFor="organization-name">
                Name
              </label>
              <Input
                id="organization-name"
                onBlur={onNameBlur}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Acme Studios"
                required
                value={createValues.name}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm" htmlFor="organization-slug">
                Slug
              </label>
              <Input
                id="organization-slug"
                onChange={(event) => onSlugChange(event.target.value)}
                placeholder="acme-studios"
                required
                value={createValues.slug}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm" htmlFor="organization-logo">
                Logo URL
              </label>
              <Input
                id="organization-logo"
                onChange={(event) => onLogoChange(event.target.value)}
                placeholder="https://example.com/logo.png"
                value={createValues.logo}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm" htmlFor="owner-search">
                Owner
              </label>
              <Input
                id="owner-search"
                onChange={(event) => onOwnerSearchChange(event.target.value)}
                placeholder="Search by name or email"
                value={ownerSearch}
              />
              <div className="border">
                {isOwnerCandidatesPending ? (
                  <div className="text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm">
                    <Loader2 className="size-4 animate-spin" />
                    Loading users
                  </div>
                ) : ownerCandidates.length ? (
                  <div className="max-h-56 overflow-y-auto">
                    {ownerCandidates.map((candidate) => {
                      const isSelected = candidate.id === selectedOwner.id

                      return (
                        <button
                          aria-pressed={isSelected}
                          className={cn(
                            'hover:bg-muted/50 flex w-full flex-col gap-1 border-b px-3 py-2 text-left transition-colors last:border-b-0',
                            isSelected ? 'bg-muted' : undefined,
                          )}
                          key={candidate.id}
                          onClick={() => onOwnerSelect(candidate)}
                          type="button"
                        >
                          <span className="text-sm">{candidate.name}</span>
                          <span className="text-muted-foreground text-xs">{candidate.email}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-muted-foreground px-3 py-4 text-sm">No matching users found.</div>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Selected owner: {selectedOwner.name} ({selectedOwner.email})
              </p>
            </div>
          </div>
          <DialogFooter className="border-t pt-3">
            <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
