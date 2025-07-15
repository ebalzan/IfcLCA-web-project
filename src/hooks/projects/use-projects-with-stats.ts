import { useInfiniteQuery } from "@tanstack/react-query";
import { ProjectService } from "@/lib/services/projects/project-service";
import { Queries } from "@/queries";
import { toast } from "../use-toast";
import { useEffect } from "react";

export function useProjectsWithStats() {
  const limit = 3

  const { data: projectsWithStats, isLoading, isError, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [Queries.GET_PROJECTS],
    queryFn: ({ pageParam = 1 }) => ProjectService.getProjectsWithStats({ page: pageParam, limit }),
    select: (data) => {
      return data.pages.flatMap(page => page.projects)
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPage.hasMore ? lastPageParam + 1 : undefined
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error",
        description: error.message,
      });
    }
  }, [isError, error]);

  return {
    projectsWithStats: projectsWithStats || [],
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}
