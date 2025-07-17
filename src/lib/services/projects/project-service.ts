import { PaginationParams } from '@/interfaces/PaginationParams'
import { ProjectResponse, ProjectWithStatsResponse } from '@/interfaces/projects/ProjectResponse'
import { ProjectsWithStatsResponse } from '@/interfaces/projects/ProjectsResponse'
import { api } from '@/lib/fetch'
import { UpdateProjectSchema } from '@/schemas/projects/updateProjectSchema'

export class ProjectService {
  static async getProjects(params: PaginationParams): Promise<ProjectsWithStatsResponse> {
    const response = await api.get<ProjectsWithStatsResponse>(
      `/api/projects?page=${params.page}&limit=${params.limit}`,
      {
        cache: 'no-store',
      }
    )
    return response
  }

  static async getProjectsWithStats(params: PaginationParams): Promise<ProjectsWithStatsResponse> {
    const response = await api.get<ProjectsWithStatsResponse>(
      `/api/projects?withStats=true&page=${params.page}&limit=${params.limit}`,
      {
        cache: 'no-store',
      }
    )
    return response
  }

  static async getProject(projectId: string): Promise<ProjectResponse> {
    const response = await api.get<ProjectResponse>(`/api/projects/${projectId}`, {
      cache: 'no-store',
    })
    return response
  }

  static async getProjectWithStatsById(projectId: string): Promise<ProjectWithStatsResponse> {
    const response = await api.get<ProjectWithStatsResponse>(
      `/api/projects/${projectId}?withStats=true`,
      {
        cache: 'no-store',
      }
    )
    return response
  }

  static async deleteProject(projectId: string): Promise<void> {
    await api.delete<void>(`/api/projects/${projectId}`, {
      cache: 'no-store',
    })
  }

  static async updateProject(
    projectId: string,
    project: UpdateProjectSchema
  ): Promise<ProjectResponse> {
    const response = await api.patch<ProjectResponse>(`/api/projects/${projectId}`, project, {
      cache: 'no-store',
    })
    return response
  }
}
