import { useRouter } from 'next/navigation'
import {
  useTanStackQuery,
  useTanStackMutation,
  useTanStackInfiniteQuery,
} from '@/hooks/use-tanstack-fetch'
import { IMaterialClient } from '@/interfaces/client/materials/IMaterialClient'
import { Queries } from '@/queries'
import {
  CreateMaterialRequestApi,
  DeleteMaterialRequestApi,
} from '@/schemas/api/materials/material-requests'
import { UpdateMaterialRequestApi } from '@/schemas/api/materials/material-requests'
import {
  DeleteMaterialResponseApi,
  GetMaterialBulkResponseApi,
  GetMaterialResponseApi,
} from '@/schemas/api/materials/material-responses'
import { CreateMaterialResponseApi } from '@/schemas/api/materials/material-responses'
import { UpdateMaterialResponseApi } from '@/schemas/api/materials/material-responses'

// Query hooks
export const useGetMaterial = (materialId: string) => {
  return useTanStackQuery<GetMaterialResponseApi, IMaterialClient>(`/api/materials/${materialId}`, {
    queryKey: [Queries.GET_MATERIAL, materialId],
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export const useGetMaterialBulk = (projectId?: string) => {
  const queryParams = projectId ? `?projectId=${projectId}` : ''

  return useTanStackInfiniteQuery<GetMaterialBulkResponseApi, IMaterialClient[]>(
    `/api/materials${queryParams}`,
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

export const useCreateMaterial = () => {
  const router = useRouter()

  return useTanStackMutation<CreateMaterialResponseApi, CreateMaterialRequestApi>(
    '/api/materials',
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

// Mutation hooks
export const useUpdateMaterial = (materialId: string) => {
  const router = useRouter()

  return useTanStackMutation<UpdateMaterialResponseApi, UpdateMaterialRequestApi>(
    `/api/materials/${materialId}`,
    {
      method: 'PATCH',
      mutationKey: [Queries.GET_MATERIAL, materialId],
      showSuccessToast: true,
      successMessage: 'Material has been updated successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_MATERIALS], [Queries.GET_MATERIAL]],
    }
  )
}

export const useDeleteMaterial = () => {
  const router = useRouter()

  return useTanStackMutation<DeleteMaterialResponseApi, DeleteMaterialRequestApi>(
    '/api/materials',
    {
      method: 'DELETE',
      mutationKey: [Queries.DELETE_MATERIAL],
      showSuccessToast: true,
      successMessage: 'The material has been successfully deleted.',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_MATERIALS]],
      onSuccess: () => {
        router.replace('/materials')
      },
    }
  )
}
