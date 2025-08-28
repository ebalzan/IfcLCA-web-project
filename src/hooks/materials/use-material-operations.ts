import {
  useTanStackQuery,
  useTanStackMutation,
  useTanStackInfiniteQuery,
} from '@/hooks/use-tanstack-fetch'
import { IMaterialClient } from '@/interfaces/client/materials/IMaterialClient'
import { Queries } from '@/queries'
import {
  CreateMaterialBulkRequestApi,
  CreateMaterialRequestApi,
  DeleteMaterialBulkRequestApi,
  DeleteMaterialRequestApi,
  UpdateMaterialBulkRequestApi,
} from '@/schemas/api/materials/material-requests'
import { UpdateMaterialRequestApi } from '@/schemas/api/materials/material-requests'
import {
  CreateMaterialBulkResponseApi,
  DeleteMaterialBulkResponseApi,
  DeleteMaterialResponseApi,
  GetMaterialBulkByProjectResponseApi,
  GetMaterialBulkResponseApi,
  GetMaterialResponseApi,
  UpdateMaterialBulkResponseApi,
} from '@/schemas/api/materials/material-responses'
import { CreateMaterialResponseApi } from '@/schemas/api/materials/material-responses'
import { UpdateMaterialResponseApi } from '@/schemas/api/materials/material-responses'
import {
  DeleteMaterialBulkSchema,
  DeleteMaterialSchema,
  GetMaterialBulkByProjectSchema,
  GetMaterialBulkSchema,
  GetMaterialSchema,
  UpdateMaterialBulkSchema,
  UpdateMaterialSchema,
} from '@/schemas/client/material-schemas'

// CREATE
export const useCreateMaterial = () => {
  return useTanStackMutation<CreateMaterialRequestApi['data'], CreateMaterialResponseApi>(
    '/api/materials/create',
    {
      method: 'POST',
      mutationKey: [Queries.GET_MATERIALS],
      showSuccessToast: true,
      successMessage: 'Material has been created successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_MATERIALS]],
    }
  )
}
export const useCreateMaterialBulk = () => {
  return useTanStackMutation<CreateMaterialBulkRequestApi['data'], CreateMaterialBulkResponseApi>(
    '/api/materials/create',
    {
      method: 'POST',
      mutationKey: [Queries.GET_MATERIALS],
      showSuccessToast: true,
      successMessage: 'Materials have been created successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_MATERIALS]],
    }
  )
}

// GET
export const useGetMaterial = ({ id: materialId }: GetMaterialSchema) => {
  return useTanStackQuery<GetMaterialResponseApi, IMaterialClient>(`/api/materials/${materialId}`, {
    queryKey: [Queries.GET_MATERIAL, materialId],
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
export const useGetMaterialBulk = ({ materialIds }: GetMaterialBulkSchema) => {
  return useTanStackInfiniteQuery<GetMaterialBulkResponseApi, IMaterialClient[]>(
    `/api/materials?materialIds=${materialIds.join(',')}`,
    {
      queryKey: [Queries.GET_MATERIALS, materialIds],
      initialPageParam: 1,
      select: data => {
        return data.pages.flatMap(page =>
          page.data.materials.map(material => ({
            ...material,
            totalVolume: 0,
            elements: [],
          }))
        )
      },
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        return lastPage.data.pagination.hasMore ? (lastPageParam as number) + 1 : undefined
      },
    }
  )
}
export const useGetMaterialBulkByProject = ({ projectId }: GetMaterialBulkByProjectSchema) => {
  return useTanStackInfiniteQuery<GetMaterialBulkByProjectResponseApi, IMaterialClient[]>(
    `/api/materials/project?projectId=${projectId}`,
    {
      queryKey: [Queries.GET_MATERIALS, projectId],
      initialPageParam: 1,
      select: data => {
        return data.pages.flatMap(page =>
          page.data.materials.map(material => ({
            ...material,
            totalVolume: 0,
            elements: [],
          }))
        )
      },
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        return lastPage.data.pagination.hasMore ? (lastPageParam as number) + 1 : undefined
      },
    }
  )
}

// UPDATE
export const useUpdateMaterial = ({ id: materialId }: UpdateMaterialSchema) => {
  return useTanStackMutation<UpdateMaterialRequestApi['data'], UpdateMaterialResponseApi>(
    `/api/materials/${materialId}`,
    {
      method: 'PUT',
      mutationKey: [Queries.GET_MATERIAL, materialId],
      showSuccessToast: true,
      successMessage: 'Material has been updated successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_MATERIALS], [Queries.GET_MATERIAL]],
    }
  )
}
export const useUpdateMaterialBulk = ({ materialIds }: UpdateMaterialBulkSchema) => {
  return useTanStackMutation<UpdateMaterialBulkRequestApi['data'], UpdateMaterialBulkResponseApi>(
    `/api/materials?materialIds=${materialIds.join(',')}`,
    {
      method: 'PUT',
      mutationKey: [Queries.GET_MATERIALS],
      showSuccessToast: true,
      successMessage: 'Materials have been updated successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_MATERIALS]],
    }
  )
}

// DELETE
export const useDeleteMaterial = ({ id: materialId }: DeleteMaterialSchema) => {
  return useTanStackMutation<DeleteMaterialRequestApi['data'], DeleteMaterialResponseApi>(
    `/api/materials/${materialId}`,
    {
      method: 'DELETE',
      mutationKey: [Queries.DELETE_MATERIAL],
      showSuccessToast: true,
      successMessage: 'The material has been successfully deleted.',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_MATERIALS]],
    }
  )
}
export const useDeleteMaterialBulk = ({ materialIds }: DeleteMaterialBulkSchema) => {
  return useTanStackMutation<DeleteMaterialBulkRequestApi['data'], DeleteMaterialBulkResponseApi>(
    `/api/materials?materialIds=${materialIds.join(',')}`,
    {
      method: 'DELETE',
      mutationKey: [Queries.GET_MATERIALS],
      showSuccessToast: true,
      successMessage: 'Materials have been deleted successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_MATERIALS]],
    }
  )
}
