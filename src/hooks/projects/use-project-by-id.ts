import { useQuery } from "@tanstack/react-query";
import { Queries } from "@/queries";
import { ProjectService } from "@/lib/services/projects/project-service";

export function useProjectWithStatsById(projectId: string) {
  return useQuery({
    queryKey: [Queries.GET_PROJECT_BY_ID, projectId],
    queryFn: () => ProjectService.getProjectWithStatsById(projectId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useProjectById(projectId: string) {
  return useQuery({
    queryKey: [Queries.GET_PROJECT_BY_ID, projectId],
    queryFn: () => ProjectService.getProject(projectId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
