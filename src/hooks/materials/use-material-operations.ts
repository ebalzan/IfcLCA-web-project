import { useRouter } from 'next/navigation'
import {
  useTanStackQuery,
  useTanStackMutation,
  useTanStackInfiniteQuery,
} from '@/hooks/use-tanstack-fetch'
import { IMaterialClient } from '@/interfaces/client/materials/IMaterialClient'
import { Queries } from '@/queries'
import {
  CreateMaterialRequest,
  UpdateMaterialRequest,
} from '@/schemas/api/materials/material-requests'
import {
  CreateMaterialResponse,
  GetMaterialBulkResponse,
  GetMaterialResponse,
  UpdateMaterialResponse,
} from '@/schemas/api/materials/material-responses'

// Query hooks
export const useGetMaterial = (materialId: string) => {
  return useTanStackQuery<GetMaterialResponse>(`/api/materials/${materialId}`, {
    queryKey: [Queries.GET_MATERIAL, materialId],
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export const useGetMaterialBulk = () => {
  return useTanStackInfiniteQuery<GetMaterialBulkResponse, IMaterialClient[]>('/api/materials', {
    queryKey: [Queries.GET_MATERIALS],
    initialPageParam: 1,
    select: data => {
      return data.pages.flatMap(page => page.data.materials)
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPage.data.pagination.hasMore ? (lastPageParam as number) + 1 : undefined
    },
  })
}

export const useCreateMaterial = () => {
  const router = useRouter()

  return useTanStackMutation<CreateMaterialResponse, CreateMaterialRequest>('/api/materials', {
    method: 'POST',
    mutationKey: [Queries.GET_MATERIALS],
    showSuccessToast: true,
    successMessage: 'Material has been created successfully',
    showErrorToast: true,
    invalidateQueries: [[Queries.GET_MATERIALS]],
  })
}

// Mutation hooks
export const useUpdateMaterial = (materialId: string) => {
  const router = useRouter()

  return useTanStackMutation<UpdateMaterialResponse, UpdateMaterialRequest>(
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

  return useTanStackMutation<void, string>('/api/materials', {
    method: 'DELETE',
    mutationKey: [Queries.DELETE_MATERIAL],
    showSuccessToast: true,
    successMessage: 'The material has been successfully deleted.',
    showErrorToast: true,
    invalidateQueries: [[Queries.GET_MATERIALS]],
    onSuccess: () => {
      router.replace('/materials')
    },
  })
}
