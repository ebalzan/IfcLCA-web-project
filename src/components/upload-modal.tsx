'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ReloadIcon } from '@radix-ui/react-icons'
import { UploadCloud } from 'lucide-react'
import { Types } from 'mongoose'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCreateUpload } from '@/hooks/uploads/use-upload-operations'
import { useIfcParser } from '@/hooks/use-ifc-parser'
import { logger } from '@/lib/logger'

interface UploadModalProps {
  open: boolean
  projectId: string
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UploadModal({ open, onOpenChange, projectId, onSuccess }: UploadModalProps) {
  const router = useRouter()
  const { parseIfcFileWasm, isLoading: isParsing } = useIfcParser()
  const { mutateAsync: createUpload } = useCreateUpload()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        const file = acceptedFiles[0]
        logger.debug('Starting file upload', {
          filename: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
          type: file.type,
        })

        // Step 1: Parse IFC file on client-side
        logger.debug('Parsing IFC file on client-side')
        const parsedData = await parseIfcFileWasm(file)
        const { elements } = parsedData
        logger.debug('IFC WASM parsing completed', { elements: elements.length })

        // Step 2: Send parsed data to server for processing
        logger.debug('Sending parsed data to server for processing')

        const response = await createUpload({
          data: {
            projectId: new Types.ObjectId(projectId),
            elements,
            filename: file.name,
            userId: '',
          },
        })

        console.log('🔄 Response:', response)

        if (!response.success) {
          throw new Error('Failed to process IFC data on server')
        }

        const { projectId: resultProjectId, shouldRedirectToLibrary } = response.data

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

        onOpenChange(false)
      }
    },
    [parseIfcFileWasm, createUpload, projectId, onOpenChange, router, onSuccess]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/ifc': ['.ifc'],
      'application/x-step': ['.ifc'],
    },
    disabled: isParsing,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload IFC File</DialogTitle>
        </DialogHeader>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          } ${isParsing ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input {...getInputProps()} />
          {isParsing ? (
            <div className="flex flex-col items-center space-y-2">
              <ReloadIcon className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {isParsing ? 'Parsing IFC file...' : 'Processing data...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? 'Drop the IFC file here'
                  : 'Drag and drop an IFC file here, or click to select'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
