import { useCallback } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  GetNextPageParamFunction,
} from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { fetchApi, ApiError, NetworkError, ParseError } from '@/lib/fetch'

interface TanStackOptions extends RequestInit {
  showErrorToast?: boolean
  showSuccessToast?: boolean
  successMessage?: string
}

// TanStack Query enhanced fetch hook for GET requests
export const useTanStackQuery = <T>(
  url: string,
  options?: TanStackOptions & {
    queryKey?: string[]
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    refetchOnWindowFocus?: boolean
    refetchOnMount?: boolean
    retry?: number | boolean
  }
) => {
  const queryClient = useQueryClient()
  const queryKey = options?.queryKey || [url]

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<T> => {
      return fetchApi<T>(url, options)
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
    refetchOnMount: options?.refetchOnMount ?? true,
    retry: options?.retry ?? 3,
  })

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey }),
  }
}

// TanStack Query infinite query hook for paginated data
export const useTanStackInfiniteQuery = <T, TData = { pages: T[]; pageParams: number[] }>(
  url: string,
  options?: TanStackOptions & {
    queryKey?: string[]
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    refetchOnWindowFocus?: boolean
    refetchOnMount?: boolean
    retry?: number | boolean
    limit?: number
    getNextPageParam?: GetNextPageParamFunction<number, T>
    select?: (data: { pages: T[]; pageParams: number[] }) => TData
  }
) => {
  const queryKey = options?.queryKey || [url]
  const limit = options?.limit || 10

  const defaultGetNextPageParam: GetNextPageParamFunction<number, T> = (
    lastPage: T,
    allPages: T[],
    lastPageParam: number
  ) => {
    // Simple check for hasMore property - this is what actually works
    if (lastPage && typeof lastPage === 'object' && 'hasMore' in lastPage) {
      return (lastPage as { hasMore: boolean }).hasMore ? lastPageParam + 1 : undefined
    }
    return undefined
  }

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }): Promise<T> => {
      const separator = url.includes('?') ? '&' : '?'
      const paginatedUrl = `${url}${separator}page=${pageParam}&limit=${limit}`
      return fetchApi<T>(paginatedUrl, options)
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
    refetchOnMount: options?.refetchOnMount ?? true,
    retry: options?.retry ?? 3,
    getNextPageParam: options?.getNextPageParam || defaultGetNextPageParam,
    select: options?.select,
    initialPageParam: 1,
  })

  return {
    data: (query.data as TData) || null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    isError: query.isError,
    isSuccess: query.isSuccess,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch: query.refetch,
  }
}

// TanStack Query mutation hook for POST/PUT/DELETE operations
export const useTanStackMutation = <T, TVariables = void>(
  url: string,
  options?: TanStackOptions & {
    mutationKey?: string[]
    onSuccess?: (data: T, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
    onSettled?: (data: T | undefined, error: Error | null, variables: TVariables) => void
    invalidateQueries?: string[][]
  }
) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: options?.mutationKey || [url],
    mutationFn: async (variables: TVariables): Promise<T> => {
      // For DELETE operations, append the ID to the URL
      const finalUrl =
        options?.method === 'DELETE' && typeof variables === 'string' ? `${url}/${variables}` : url

      return fetchApi<T>(finalUrl, {
        ...options,
        body: variables && typeof variables !== 'string' ? JSON.stringify(variables) : undefined,
      })
    },
    onSuccess: (data, variables) => {
      if (options?.showSuccessToast && options?.successMessage) {
        toast({
          title: 'Success',
          description: options.successMessage,
        })
      }

      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey })
        })
      }

      options?.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      if (options?.showErrorToast !== false) {
        let errorMessage = 'An error occurred'
        if (error instanceof ApiError) {
          errorMessage = `API Error (${error.status}): ${error.message}`
        } else if (error instanceof NetworkError) {
          errorMessage = `Network Error: ${error.message}`
        } else if (error instanceof ParseError) {
          errorMessage = `Parse Error: ${error.message}`
        } else if (error instanceof Error) {
          errorMessage = error.message
        }

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
      options?.onError?.(error, variables)
    },
    onSettled: options?.onSettled,
  })

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error ? (mutation.error as Error).message : null,
    data: mutation.data || null,
    reset: mutation.reset,
  }
}

// Hook for handling form submissions with TanStack Query
export const useTanStackSubmit = <T, TVariables = unknown>(
  url: string,
  options?: TanStackOptions & {
    mutationKey?: string[]
    invalidateQueries?: string[][]
    onSuccess?: (data: T, variables: TVariables) => void
  }
) => {
  const queryClient = useQueryClient()

  const mutation = useTanStackMutation<T, TVariables>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey })
        })
      }
      options?.onSuccess?.(data, variables)
    },
  })

  const submit = useCallback(
    async (body: TVariables) => {
      return mutation.mutateAsync(body)
    },
    [mutation]
  )

  return {
    ...mutation,
    submit,
  }
}
