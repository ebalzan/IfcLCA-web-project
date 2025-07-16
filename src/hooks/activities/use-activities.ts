import { useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'
import { ActivityService } from '@/lib/services/activities/activity-service'
import { Queries } from '@/queries'

export function useActivities() {
  const limit = 6

  const {
    data: activities,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [Queries.GET_ACTIVITIES, limit],
    queryFn: ({ pageParam = 1 }) => ActivityService.getActivities({ page: pageParam, limit }),
    select: data => {
      return data.pages.flatMap(page => page.activities)
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPage.hasMore ? lastPageParam + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }, [isError, error])

  useEffect(() => {
    logger.debug('ACTIVITIES', activities)
  }, [activities])

  return {
    activities: activities || [],
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  }
}
