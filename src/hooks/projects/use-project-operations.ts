import { useRouter } from 'next/navigation'
import {
  useTanStackQuery,
  useTanStackMutation,
  useTanStackInfiniteQuery,
} from '@/hooks/use-tanstack-fetch'
import { IProjectClient } from '@/interfaces/client/projects/IProjectClient'
import { IProjectWithNestedDataClient } from '@/interfaces/client/projects/IProjectWithNestedData'
import { Queries } from '@/queries'
import {
  CreateProjectBulkRequestApi,
  CreateProjectRequestApi,
  DeleteProjectBulkRequestApi,
  UpdateProjectBulkRequestApi,
  UpdateProjectRequestApi,
} from '@/schemas/api/projects/project-requests'
import {
  GetProjectBulkResponseApi,
  GetProjectWithNestedDataBulkResponseApi,
  CreateProjectResponseApi,
  UpdateProjectResponseApi,
  DeleteProjectResponseApi,
  GetProjectResponseApi,
  GetProjectWithNestedDataResponseApi,
  GetProjectBulkByUserResponseApi,
  GetProjectWithNestedDataBulkByUserResponseApi,
  CreateProjectBulkResponseApi,
  UpdateProjectBulkResponseApi,
  DeleteProjectBulkResponseApi,
} from '@/schemas/api/projects/project-responses'
import { SearchProjectsResponseApi } from '@/schemas/api/projects/search'
import {
  DeleteProjectBulkSchema,
  DeleteProjectSchema,
  GetProjectBulkByUserSchema,
  GetProjectBulkSchema,
  GetProjectSchema,
  GetProjectWithNestedDataBulkByUserSchema,
  GetProjectWithNestedDataBulkSchema,
  GetProjectWithNestedDataSchema,
  SearchProjectsSchema,
  UpdateProjectBulkSchema,
  UpdateProjectSchema,
} from '@/schemas/client/project-schemas'

// CREATE
export const useCreateProject = () => {
  const router = useRouter()

  return useTanStackMutation<CreateProjectRequestApi['data'], CreateProjectResponseApi>(
    '/api/projects/create',
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
export const useCreateProjectBulk = () => {
  return useTanStackMutation<CreateProjectBulkRequestApi['data'], CreateProjectBulkResponseApi>(
    '/api/projects',
    {
      method: 'POST',
      mutationKey: [Queries.GET_PROJECTS],
      showSuccessToast: true,
      successMessage: 'Projects have been created successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_PROJECTS]],
    }
  )
}

// GET regular projects
export const useGetProject = ({ id: projectId }: GetProjectSchema) => {
  return useTanStackQuery<GetProjectResponseApi, IProjectClient>(`/api/projects/${projectId}`, {
    queryKey: [Queries.GET_PROJECT, projectId],
    staleTime: 1000 * 60 * 2, // 2 minutes
    select: ({ data }) => data,
  })
}
export const useGetProjectBulk = ({ projectIds }: GetProjectBulkSchema) => {
  return useTanStackInfiniteQuery<GetProjectBulkResponseApi, IProjectClient[]>(
    `/api/projects?projectIds=${projectIds.join(',')}`,
    {
      queryKey: [Queries.GET_PROJECTS],
      initialPageParam: 1,
      select: data => {
        return data.pages.flatMap(page => page.data.projects)
      },
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        return lastPage.data.pagination.hasMore ? (lastPageParam as number) + 1 : undefined
      },
    }
  )
}
export const useGetProjectBulkByUser = ({ userId }: GetProjectBulkByUserSchema) => {
  return useTanStackInfiniteQuery<GetProjectBulkByUserResponseApi, IProjectClient[]>(
    `/api/projects/user/${userId}`,
    {
      queryKey: [Queries.GET_PROJECTS_USER, userId],
      enabled: !!userId,
      initialPageParam: 1,
      select: data => {
        return data.pages.flatMap(page => page.data.projects)
      },
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        return lastPage.data.pagination.hasMore ? (lastPageParam as number) + 1 : undefined
      },
    }
  )
}

// GET project with nested data
export const useGetProjectWithNestedData = ({ id: projectId }: GetProjectWithNestedDataSchema) => {
  return useTanStackQuery<GetProjectWithNestedDataResponseApi, IProjectWithNestedDataClient>(
    `/api/projects/${projectId}/nested`,
    {
      queryKey: [Queries.GET_PROJECTS_NESTED, projectId],
      staleTime: 1000 * 60 * 2, // 2 minutes
      select: ({ data }) => data,
    }
  )
}
export const useGetProjectWithNestedDataBulk = ({
  projectIds,
}: GetProjectWithNestedDataBulkSchema) => {
  return useTanStackInfiniteQuery<
    GetProjectWithNestedDataBulkResponseApi,
    IProjectWithNestedDataClient[]
  >(`/api/projects/nested?projectIds=${projectIds.join(',')}`, {
    queryKey: [Queries.GET_PROJECTS_NESTED, projectIds],
    initialPageParam: 1,
    select: data => {
      return data.pages.flatMap(page => page.data.projects)
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPage.data.pagination.hasMore ? (lastPageParam as number) + 1 : undefined
    },
  })
}
export const useGetProjectWithNestedDataBulkByUser = ({
  userId,
}: GetProjectWithNestedDataBulkByUserSchema) => {
  return useTanStackInfiniteQuery<
    GetProjectWithNestedDataBulkByUserResponseApi,
    IProjectWithNestedDataClient[]
  >(`/api/projects/user/${userId}/nested`, {
    enabled: !!userId,
    queryKey: [Queries.GET_PROJECTS_NESTED_USER, userId],
    initialPageParam: 1,
    select: data => {
      return data.pages.flatMap(page => page.data.projects)
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPage.data.pagination.hasMore ? (lastPageParam as number) + 1 : undefined
    },
  })
}

// UPDATE
export const useUpdateProject = ({ id: projectId }: UpdateProjectSchema) => {
  const router = useRouter()

  return useTanStackMutation<UpdateProjectRequestApi['data'], UpdateProjectResponseApi>(
    `/api/projects/${projectId}`,
    {
      method: 'PATCH',
      mutationKey: [Queries.GET_PROJECT, projectId],
      showSuccessToast: true,
      successMessage: 'Project has been updated successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_PROJECTS], [Queries.GET_PROJECT, projectId]],
      onSuccess: ({ data }) => {
        router.push(`/projects/${data._id}`)
      },
    }
  )
}
export const useUpdateProjectBulk = ({ projectIds }: UpdateProjectBulkSchema) => {
  return useTanStackMutation<UpdateProjectBulkRequestApi['data'], UpdateProjectBulkResponseApi>(
    `/api/projects?projectIds=${projectIds.join(',')}`,
    {
      method: 'PUT',
      mutationKey: [Queries.GET_PROJECTS],
      showSuccessToast: true,
      successMessage: 'Projects have been updated successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_PROJECTS]],
    }
  )
}

// DELETE
export const useDeleteProject = ({ id: projectId }: DeleteProjectSchema) => {
  const router = useRouter()

  return useTanStackMutation<void, DeleteProjectResponseApi>(`/api/projects/${projectId}`, {
    method: 'DELETE',
    mutationKey: [Queries.DELETE_PROJECT, projectId],
    showSuccessToast: true,
    successMessage: 'The project has been successfully deleted.',
    showErrorToast: true,
    invalidateQueries: [[Queries.GET_PROJECTS], [Queries.GET_PROJECT, projectId]],
    onSuccess: () => {
      router.replace('/projects')
    },
  })
}
export const useDeleteProjectBulk = ({ projectIds }: DeleteProjectBulkSchema) => {
  return useTanStackMutation<DeleteProjectBulkRequestApi['data'], DeleteProjectBulkResponseApi>(
    `/api/projects?projectIds=${projectIds.join(',')}`,
    {
      method: 'DELETE',
      mutationKey: [Queries.GET_PROJECTS],
      showSuccessToast: true,
      successMessage: 'Projects have been deleted successfully',
      showErrorToast: true,
      invalidateQueries: [[Queries.GET_PROJECTS]],
    }
  )
}

// SEARCH
export const useSearchProjects = ({ name, sortBy }: SearchProjectsSchema) => {
  return useTanStackInfiniteQuery<SearchProjectsResponseApi, IProjectClient[]>(
    `/api/projects/search?name=${name}&sortBy=${sortBy}`,
    {
      method: 'GET',
      queryKey: [Queries.SEARCH_PROJECTS],
      initialPageParam: 1,
      select: data => {
        return data.pages.flatMap(page => page.data.projects)
      },
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        return lastPage.data.pagination.hasMore ? (lastPageParam as number) + 1 : undefined
      },
    }
  )
}
