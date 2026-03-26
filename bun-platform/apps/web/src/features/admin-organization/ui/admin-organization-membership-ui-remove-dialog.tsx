import { Button } from '@bun-platform/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@bun-platform/ui/components/dialog'

interface AdminOrganizationMembershipUiRemoveDialogProps {
  isOpen: boolean
  isPending: boolean
  memberName: string
  onCancel: () => void
  onConfirm: () => void
}

export function AdminOrganizationMembershipUiRemoveDialog(props: AdminOrganizationMembershipUiRemoveDialogProps) {
  const { isOpen, isPending, memberName, onCancel, onConfirm } = props

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel()
        }
      }}
      open={isOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>Remove {memberName} from this organization?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t pt-3">
          <Button onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isPending} onClick={onConfirm} type="button" variant="destructive">
            Remove Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
