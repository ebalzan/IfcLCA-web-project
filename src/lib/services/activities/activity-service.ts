import ActivityResponse from "@/interfaces/activities/ActivityResponse";
import { fetchApi } from "@/lib/fetch";
import { PaginationParams } from "@/interfaces/PaginationParams";

export class ActivityService {
  static async getActivities(params: PaginationParams): Promise<ActivityResponse> {
    const response = await fetchApi<ActivityResponse>(`/api/activities?page=${params.page}&limit=${params.limit}`);
    return response;
  }
}