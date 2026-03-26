import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@bun-platform/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@bun-platform/ui/components/dialog'

interface AdminOrganizationSettingsUiDeleteDialogProps {
  isPending: boolean
  onDelete: () => Promise<boolean>
}

export function AdminOrganizationSettingsUiDeleteDialog(props: AdminOrganizationSettingsUiDeleteDialogProps) {
  const { isPending, onDelete } = props
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button disabled={isPending} onClick={() => setIsOpen(true)} variant="destructive">
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Deleting
          </>
        ) : (
          'Delete Organization'
        )}
      </Button>
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>Delete this organization and all of its memberships?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t pt-3">
            <Button onClick={() => setIsOpen(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={async () => {
                const didDelete = await onDelete()

                if (didDelete) {
                  setIsOpen(false)
                }
              }}
              type="button"
              variant="destructive"
            >
              Delete Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
