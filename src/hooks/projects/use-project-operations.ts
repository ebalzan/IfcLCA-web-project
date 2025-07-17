import { useRouter } from 'next/navigation'
import {
  useTanStackQuery,
  useTanStackMutation,
  useTanStackInfiniteQuery,
} from '@/hooks/use-tanstack-fetch'
import IProjectWithStatsClient from '@/interfaces/client/projects/IProjectWithStatsClient'
import { ProjectResponse, ProjectWithStatsResponse } from '@/interfaces/projects/ProjectResponse'
import { ProjectsWithStatsResponse } from '@/interfaces/projects/ProjectsResponse'
import { Queries } from '@/queries'
import { CreateProjectSchema } from '@/schemas/projects/createProjectSchema'
import { UpdateProjectSchema } from '@/schemas/projects/updateProjectSchema'

// Query hooks
export const useProjectById = (projectId: string) => {
  return useTanStackQuery<ProjectResponse>(`/api/projects/${projectId}`, {
    queryKey: [Queries.GET_PROJECT_BY_ID, projectId],
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export const useProjectWithStatsById = (projectId: string) => {
  return useTanStackQuery<ProjectWithStatsResponse>(`/api/projects/${projectId}?withStats=true`, {
    queryKey: [Queries.GET_PROJECT_BY_ID, projectId],
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export const useProjectsWithStats = () => {
  return useTanStackInfiniteQuery<ProjectsWithStatsResponse, IProjectWithStatsClient[]>(
    '/api/projects',
    {
      queryKey: [Queries.GET_PROJECTS],
      limit: 3,
      select: data => {
        return data.pages.flatMap(page => page.projects)
      },
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        return lastPage.hasMore ? lastPageParam + 1 : undefined
      },
    }
  )
}

export const useCreateProject = () => {
  const router = useRouter()

  return useTanStackMutation<ProjectResponse, CreateProjectSchema>('/api/projects', {
    method: 'POST',
    mutationKey: [Queries.GET_PROJECTS],
    showSuccessToast: true,
    successMessage: 'Project has been created successfully',
    showErrorToast: true,
    invalidateQueries: [[Queries.GET_PROJECTS]],
    onSuccess: data => {
      router.push(`/projects/${data._id}`)
    },
  })
}

// Mutation hooks
export const useUpdateProject = (projectId: string) => {
  const router = useRouter()

  return useTanStackMutation<ProjectWithStatsResponse, UpdateProjectSchema>(
    `/api/projects/${projectId}`,
    {
      method: 'PATCH',
      mutationKey: [Queries.GET_PROJECT_BY_ID, projectId],
      showSuccessToast: true,
      successMessage: 'Project has been updated successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_PROJECTS], [Queries.GET_PROJECT_BY_ID]],
      onSuccess: data => {
        router.push(`/projects/${data._id}`)
      },
    }
  )
}

export const useDeleteProject = () => {
  const router = useRouter()

  return useTanStackMutation<void, string>('/api/projects', {
    method: 'DELETE',
    mutationKey: [Queries.DELETE_PROJECT],
    showSuccessToast: true,
    successMessage: 'The project has been successfully deleted.',
    showErrorToast: true,
    invalidateQueries: [[Queries.GET_PROJECTS]],
    onSuccess: () => {
      router.replace('/projects')
    },
  })
}
