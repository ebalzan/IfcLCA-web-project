'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReloadIcon } from '@radix-ui/react-icons'
import { UploadCloud } from 'lucide-react'
import { Types } from 'mongoose'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCreateUpload } from '@/hooks/uploads/use-upload-operations'
import { useToast } from '@/hooks/use-toast'
import { IFCParseResult } from '@/interfaces/ifc'
import { logger } from '@/lib/logger'

interface UploadModalProps {
  open: boolean
  projectId: string
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UploadModal({ open, onOpenChange, projectId, onSuccess }: UploadModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { mutateAsync: createUpload, isLoading } = useCreateUpload()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        const file = acceptedFiles[0]
        logger.debug('Starting file upload', {
          filename: file.name,
          size: file.size,
          type: file.type,
        })

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Upload timed out after 60 seconds')), 60000)
        })

        const uploadPromise = await createUpload({
          data: {
            file,
            projectId: new Types.ObjectId(projectId),
          },
        })
        const results = (await Promise.race([uploadPromise, timeoutPromise])) as IFCParseResult
        const { projectId: resultProjectId, shouldRedirectToLibrary } = results

        onOpenChange(false)

        if (shouldRedirectToLibrary) {
          logger.debug('Redirecting to materials library')
          router.push(`/materials-library?projectId=${resultProjectId}`)
          router.refresh()
        } else {
          logger.debug('No redirection needed, refreshing page')
          router.refresh()
          onSuccess?.()
        }
      } catch (error: unknown) {
        logger.error('Upload failed:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        })

        // Check if it's an IFC4X1 schema issue and provide helpful message
        const errorMessage = error instanceof Error ? error.message : String(error)
        let userFriendlyMessage =
          'There was an error processing your file. Please try again or contact support if the issue persists.'

        if (errorMessage.includes('IFC4X1') || errorMessage.includes('No schema named')) {
          userFriendlyMessage =
            'Your IFC file uses the IFC4X1 schema which requires special processing. The system will automatically use an external service to handle this format.'
        } else if (errorMessage.includes('Upload timed out')) {
          userFriendlyMessage = 'The upload timed out. Please try again with a smaller file.'
        } else if (errorMessage.includes('No elements found')) {
          userFriendlyMessage =
            'No building elements found in the IFC file. Please ensure the file contains building elements and try again.'
        }

        toast({
          title: 'Upload Failed',
          description: userFriendlyMessage,
          variant: 'destructive',
        })
        onOpenChange(false)
      }
    },
    [createUpload, projectId, onOpenChange, router, onSuccess, toast]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/ifc': ['.ifc'],
      'application/x-step': ['.ifc'],
    },
    disabled: isLoading,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Load Ifc File</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <ReloadIcon className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              This may take a few moments depending on file size. For IFC4X1 files, external
              processing will be used automatically.
            </p>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}
            `}>
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag and drop an Ifc file, or click to select'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports IFC2x3, IFC4, and IFC4X1 schemas
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
