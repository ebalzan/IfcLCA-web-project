import { useRouter } from 'next/navigation'
import {
  useTanStackInfiniteQuery,
  useTanStackMutation,
  useTanStackQuery,
} from '@/hooks/use-tanstack-fetch'
import { IUploadClient } from '@/interfaces/client/uploads/IUploadClient'
import { Queries } from '@/queries'
import {
  CreateUploadBulkRequestApi,
  CreateUploadRequestApi,
  DeleteUploadBulkRequestApi,
  DeleteUploadRequestApi,
  UpdateUploadBulkRequestApi,
  UpdateUploadRequestApi,
} from '@/schemas/api/uploads/upload-requests'
import {
  CreateUploadBulkResponseApi,
  CreateUploadResponseApi,
  DeleteUploadBulkResponseApi,
  DeleteUploadResponseApi,
  GetUploadBulkByProjectResponseApi,
  GetUploadBulkResponseApi,
  GetUploadResponseApi,
  UpdateUploadBulkResponseApi,
  UpdateUploadResponseApi,
} from '@/schemas/api/uploads/upload-responses'
import {
  DeleteUploadBulkSchema,
  DeleteUploadSchema,
  GetUploadBulkByProjectSchema,
  GetUploadSchema,
  UpdateUploadBulkSchema,
  UpdateUploadSchema,
} from '@/schemas/client/upload-schemas'

// CREATE
export const useCreateUpload = () => {
  return useTanStackMutation<CreateUploadRequestApi['data'], CreateUploadResponseApi>(
    '/api/uploads/create',
    {
      method: 'POST',
      mutationKey: [Queries.GET_UPLOADS],
      showSuccessToast: true,
      successMessage: 'Upload has been created successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_UPLOADS], [Queries.GET_PROJECTS_NESTED_USER]],
    }
  )
}
export const useCreateUploadBulk = () => {
  return useTanStackMutation<CreateUploadBulkRequestApi['data'], CreateUploadBulkResponseApi>(
    '/api/uploads',
    {
      method: 'POST',
      mutationKey: [Queries.GET_UPLOADS],
      showSuccessToast: true,
      successMessage: 'Uploads have been created successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_UPLOADS]],
    }
  )
}

// GET
export const useGetUpload = ({ id: uploadId }: GetUploadSchema) => {
  return useTanStackQuery<GetUploadResponseApi, IUploadClient>(`/api/uploads/${uploadId}`, {
    queryKey: [Queries.GET_UPLOAD, uploadId],
    staleTime: 1000 * 60 * 2, // 2 minutes
    select: ({ data }) => data,
  })
}
export const useGetUploadBulk = () => {
  return useTanStackInfiniteQuery<GetUploadBulkResponseApi, IUploadClient[]>('/api/uploads', {
    queryKey: [Queries.GET_UPLOADS],
    initialPageParam: 1,
    select: data => {
      return data.pages.flatMap(page => page.data.uploads)
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.data.pagination.hasMore ? (lastPageParam as number) + 1 : undefined
    },
  })
}
export const useGetUploadBulkByProject = ({ projectId }: GetUploadBulkByProjectSchema) => {
  return useTanStackQuery<GetUploadBulkByProjectResponseApi, IUploadClient[]>(
    `/api/uploads/project?projectId=${projectId}`,
    {
      queryKey: [Queries.GET_UPLOADS_BY_PROJECT, projectId],
      staleTime: 1000 * 60 * 2, // 2 minutes
      select: ({ data }) => data.uploads,
    }
  )
}

// UPDATE
export const useUpdateUpload = ({ id: uploadId }: UpdateUploadSchema) => {
  return useTanStackMutation<UpdateUploadRequestApi['data'], UpdateUploadResponseApi>(
    `/api/uploads/${uploadId}`,
    {
      method: 'PUT',
      mutationKey: [Queries.UPDATE_UPLOAD],
      showSuccessToast: true,
      successMessage: 'The upload has been successfully updated.',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_UPLOADS]],
    }
  )
}
export const useUpdateUploadBulk = ({ uploadIds }: UpdateUploadBulkSchema) => {
  return useTanStackMutation<UpdateUploadBulkRequestApi['data'], UpdateUploadBulkResponseApi>(
    `/api/uploads?uploadIds=${uploadIds.join(',')}`,
    {
      method: 'PUT',
      mutationKey: [Queries.UPDATE_UPLOAD_BULK],
      showSuccessToast: true,
      successMessage: 'The uploads have been successfully updated.',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_UPLOADS]],
    }
  )
}

// DELETE
export const useDeleteUpload = ({ id: uploadId }: DeleteUploadSchema) => {
  return useTanStackMutation<DeleteUploadRequestApi['data'], DeleteUploadResponseApi>(
    `/api/uploads/${uploadId}`,
    {
      method: 'DELETE',
      mutationKey: [Queries.DELETE_UPLOAD],
      showSuccessToast: true,
      successMessage: 'The upload has been successfully deleted.',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_UPLOADS]],
    }
  )
}
export const useDeleteUploadBulk = ({ uploadIds }: DeleteUploadBulkSchema) => {
  return useTanStackMutation<DeleteUploadBulkRequestApi['data'], DeleteUploadBulkResponseApi>(
    `/api/uploads?uploadIds=${uploadIds.join(',')}`,
    {
      method: 'DELETE',
      mutationKey: [Queries.DELETE_UPLOAD_BULK],
      showSuccessToast: true,
      successMessage: 'The uploads have been successfully deleted.',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_UPLOADS]],
    }
  )
}
