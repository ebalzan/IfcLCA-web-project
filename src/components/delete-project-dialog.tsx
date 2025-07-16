import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
}

export function DeleteProjectDialog({ isOpen, onClose, onDelete }: DeleteProjectDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you really sure you don&apos;t need it anymore?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            We can get it back but it involves us digging into our database, which we would rather
            avoid. So better be sure you don&apos;t need it anymore...
          </AlertDialogDescription>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the project and all
            associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onDelete}>
            Delete Project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
