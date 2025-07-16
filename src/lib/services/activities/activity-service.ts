import ActivityResponse from '@/interfaces/activities/ActivityResponse'
import { PaginationParams } from '@/interfaces/PaginationParams'
import { fetchApi } from '@/lib/fetch'

export class ActivityService {
  static async getActivities(params: PaginationParams): Promise<ActivityResponse> {
    const response = await fetchApi<ActivityResponse>(
      `/api/activities?page=${params.page}&limit=${params.limit}`
    )
    return response
  }
}
