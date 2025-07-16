import { useQuery } from '@tanstack/react-query'
import { ProjectService } from '@/lib/services/projects/project-service'
import { Queries } from '@/queries'

export function useProjectWithStatsById(projectId: string) {
  return useQuery({
    queryKey: [Queries.GET_PROJECT_BY_ID, projectId],
    queryFn: () => ProjectService.getProjectWithStatsById(projectId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useProjectById(projectId: string) {
  return useQuery({
    queryKey: [Queries.GET_PROJECT_BY_ID, projectId],
    queryFn: () => ProjectService.getProject(projectId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
