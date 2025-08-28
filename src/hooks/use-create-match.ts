import { Queries } from '@/queries'
import {
  CreateEC3BulkMatchRequestApi,
  CreateEC3MatchRequestApi,
} from '@/schemas/api/materials/material-requests'
import {
  CreateEC3BulkMatchResponseApi,
  CreateEC3MatchResponseApi,
} from '@/schemas/api/materials/material-responses'
import { CreateMatchSchema } from '@/schemas/client/match-schemas'
import { useTanStackMutation } from './use-tanstack-fetch'

export const useCreateMatch = ({ id: materialId }: CreateMatchSchema) => {
  return useTanStackMutation<CreateEC3MatchRequestApi['data'], CreateEC3MatchResponseApi>(
    `/api/materials/${materialId}/match`,
    {
      method: 'POST',
      mutationKey: [Queries.GET_MATERIAL, materialId],
      showSuccessToast: true,
      successMessage: 'Material has been matched successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_MATERIALS], [materialId]],
    }
  )
}
export const useCreateBulkMatch = () => {
  return useTanStackMutation<CreateEC3BulkMatchRequestApi['data'], CreateEC3BulkMatchResponseApi>(
    `/api/materials/match`,
    {
      method: 'POST',
      mutationKey: [Queries.GET_MATERIALS],
      showSuccessToast: true,
      successMessage: 'Materials have been matched successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_MATERIALS]],
    }
  )
}
