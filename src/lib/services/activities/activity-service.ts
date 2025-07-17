import ActivityResponse from '@/interfaces/activities/ActivityResponse'
import { PaginationParams } from '@/interfaces/PaginationParams'
import { api } from '@/lib/fetch'

export class ActivityService {
  static async getActivities(params: PaginationParams): Promise<ActivityResponse> {
    const response = await api.get<ActivityResponse>(
      `/api/activities?page=${params.page}&limit=${params.limit}`
    )
    return response
  }
}
