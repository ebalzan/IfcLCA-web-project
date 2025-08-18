import { useRouter } from 'next/navigation'
import {
  useTanStackInfiniteQuery,
  useTanStackMutation,
  useTanStackQuery,
} from '@/hooks/use-tanstack-fetch'
import { IUploadClient } from '@/interfaces/client/uploads/IUploadClient'
import { Queries } from '@/queries'
import { ParseIFCFileRequest, ParseIFCFileResponse } from '@/schemas/api/ifc'
import { DeleteUploadRequest } from '@/schemas/api/uploads/upload-requests'
import {
  DeleteUploadResponse,
  GetUploadBulkResponse,
  GetUploadResponse,
} from '@/schemas/api/uploads/upload-responses'

// Query hooks
export const useGetUpload = (uploadId: string) => {
  return useTanStackQuery<GetUploadResponse, IUploadClient>(`/api/uploads/${uploadId}`, {
    queryKey: [Queries.GET_UPLOAD, uploadId],
    staleTime: 1000 * 60 * 2, // 2 minutes
    select: ({ data }) => data,
  })
}

export const useGetUploadBulk = () => {
  return useTanStackInfiniteQuery<GetUploadBulkResponse, IUploadClient[]>('/api/uploads', {
    queryKey: [Queries.GET_UPLOADS],
    select: data => {
      return data.pages.flatMap(page => page.data.uploads)
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPage.data.pagination.hasMore ? lastPageParam + 1 : undefined
    },
  })
}

export const useCreateUpload = () => {
  const router = useRouter()

  return useTanStackMutation<ParseIFCFileResponse, Omit<ParseIFCFileRequest['data'], 'userId'>>(
    '/api/uploads',
    {
      method: 'POST',
      mutationKey: [Queries.GET_UPLOADS],
      showSuccessToast: true,
      successMessage: 'Upload has been created successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_UPLOADS]],
      onSuccess: ({ data }) => {
        router.push(`/projects/${data.projectId}`)
      },
    }
  )
}

export const useDeleteUpload = () => {
  return useTanStackMutation<DeleteUploadResponse, DeleteUploadRequest>('/api/uploads', {
    method: 'DELETE',
    mutationKey: [Queries.DELETE_UPLOAD],
    showSuccessToast: true,
    successMessage: 'The upload has been successfully deleted.',
    showErrorToast: true,
    invalidateQueries: [[Queries.GET_UPLOADS]],
  })
}
