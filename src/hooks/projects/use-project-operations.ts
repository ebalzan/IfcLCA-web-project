import { useRouter } from 'next/navigation'
import {
  useTanStackQuery,
  useTanStackMutation,
  useTanStackInfiniteQuery,
} from '@/hooks/use-tanstack-fetch'
import { IProjectClient } from '@/interfaces/client/projects/IProjectClient'
import { IProjectWithNestedDataClient } from '@/interfaces/client/projects/IProjectWithNestedData'
import { Queries } from '@/queries'
import { CreateProjectRequest, UpdateProjectRequest } from '@/schemas/api/projects/project-requests'
import {
  GetProjectBulkResponse,
  GetProjectResponse,
  GetProjectWithNestedDataBulkResponse,
  GetProjectWithNestedDataResponse,
} from '@/schemas/api/projects/project-responses'

// Query hooks
export const useGetProject = (projectId: string) => {
  return useTanStackQuery<GetProjectResponse, IProjectClient>(`/api/projects/${projectId}`, {
    queryKey: [Queries.GET_PROJECT, projectId],
    staleTime: 1000 * 60 * 2, // 2 minutes
    select: ({ data }) => data,
  })
}

export const useGetProjectWithNestedData = (projectId: string) => {
  return useTanStackQuery<GetProjectWithNestedDataResponse, IProjectWithNestedDataClient>(
    `/api/projects/${projectId}/nested`,
    {
      queryKey: [Queries.GET_PROJECTS_NESTED, projectId],
      staleTime: 1000 * 60 * 2, // 2 minutes
      select: ({ data }) => data,
    }
  )
}

export const useGetProjectBulk = () => {
  return useTanStackInfiniteQuery<GetProjectBulkResponse, IProjectClient[]>('/api/projects', {
    queryKey: [Queries.GET_PROJECTS],
    initialPageParam: 1,
    select: data => {
      return data.pages.flatMap(page => page.data.projects)
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPage.data.pagination.hasMore ? (lastPageParam as number) + 1 : undefined
    },
  })
}

export const useGetProjectWithNestedDataBulk = () => {
  return useTanStackInfiniteQuery<
    GetProjectWithNestedDataBulkResponse,
    IProjectWithNestedDataClient[]
  >('/api/projects/nested', {
    queryKey: [Queries.GET_PROJECTS_NESTED],
    initialPageParam: 1,
    select: data => {
      return data.pages.flatMap(page => page.data.projects)
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPage.data.pagination.hasMore ? (lastPageParam as number) + 1 : undefined
    },
  })
}

export const useCreateProject = () => {
  const router = useRouter()

  return useTanStackMutation<GetProjectResponse, Omit<CreateProjectRequest, 'userId'>>(
    '/api/projects',
    {
      method: 'POST',
      mutationKey: [Queries.GET_PROJECTS],
      showSuccessToast: true,
      successMessage: 'Project has been created successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_PROJECTS]],
      onSuccess: ({ data }) => {
        router.push(`/projects/${data._id}`)
      },
    }
  )
}

// Mutation hooks
export const useUpdateProject = (projectId: string) => {
  const router = useRouter()

  return useTanStackMutation<GetProjectWithNestedDataResponse, UpdateProjectRequest>(
    `/api/projects/${projectId}`,
    {
      method: 'PATCH',
      mutationKey: [Queries.GET_PROJECT, projectId],
      showSuccessToast: true,
      successMessage: 'Project has been updated successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_PROJECTS], [Queries.GET_PROJECT]],
      onSuccess: ({ data }) => {
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
