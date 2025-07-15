import {
  ProjectResponse,
  ProjectWithStatsResponse,
} from "@/interfaces/projects/ProjectResponse";
import { ProjectsWithStatsResponse } from "@/interfaces/projects/ProjectsResponse";
import { fetchApi } from "@/lib/fetch";
import { PaginationParams } from "@/interfaces/PaginationParams";
import { UpdateProjectSchema } from "@/schemas/projects/updateProjectSchema";

export class ProjectService {
  static async getProjects(
    params: PaginationParams
  ): Promise<ProjectsWithStatsResponse> {
    const response = await fetchApi<ProjectsWithStatsResponse>(
      `/api/projects?page=${params.page}&limit=${params.limit}`,
      {
        cache: "no-store",
        method: "GET",
      }
    );
    return response;
  }

  static async getProjectsWithStats(
    params: PaginationParams
  ): Promise<ProjectsWithStatsResponse> {
    const response = await fetchApi<ProjectsWithStatsResponse>(
      `/api/projects?withStats=true&page=${params.page}&limit=${params.limit}`,
      {
        cache: "no-store",
        method: "GET",
      }
    );
    return response;
  }

  static async getProject(projectId: string): Promise<ProjectResponse> {
    const response = await fetchApi<ProjectResponse>(
      `/api/projects/${projectId}`,
      {
        cache: "no-store",
        method: "GET",
      }
    );
    return response;
  }

  static async getProjectWithStatsById(
    projectId: string
  ): Promise<ProjectWithStatsResponse> {
    const response = await fetchApi<ProjectWithStatsResponse>(
      `/api/projects/${projectId}?withStats=true`,
      {
        cache: "no-store",
        method: "GET",
      }
    );
    return response;
  }

  static async deleteProject(projectId: string): Promise<void> {
    await fetchApi<void>(`/api/projects/${projectId}`, {
      cache: "no-store",
      method: "DELETE",
    });
  }

  static async updateProject(
    projectId: string,
    project: UpdateProjectSchema
  ): Promise<ProjectResponse> {
    const response = await fetchApi<ProjectResponse>(
      `/api/projects/${projectId}`,
      {
        cache: "no-store",
        method: "PATCH",
        body: JSON.stringify(project),
      }
    );
    return response;
  }
}
