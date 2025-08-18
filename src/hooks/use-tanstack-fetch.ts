import { useCallback } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  GetNextPageParamFunction,
} from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { ApiError, NetworkError, ParseError } from '@/lib/errors'
import { api, fetchApi } from '@/lib/fetch'

interface TanStackOptions extends RequestInit {
  showErrorToast?: boolean
  showSuccessToast?: boolean
  successMessage?: string
}

// TanStack Query enhanced fetch hook for GET requests
export const useTanStackQuery = <TResponse, TTransformedData>(
  url: string,
  options?: TanStackOptions & {
    queryKey?: string[]
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    refetchOnWindowFocus?: boolean
    refetchOnMount?: boolean
    retry?: number | boolean
    select?: (data: TResponse) => TTransformedData
  }
) => {
  const queryClient = useQueryClient()
  const queryKey = options?.queryKey || [url]

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<TResponse> => {
      return fetchApi<TResponse>(url, options)
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
    refetchOnMount: options?.refetchOnMount ?? true,
    retry: options?.retry ?? 3,
    select: options?.select,
  })

  return {
    data: (query.data as TTransformedData) || null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey }),
  }
}

// TanStack Query infinite query hook for paginated data
export const useTanStackInfiniteQuery = <TResponse, TTransformedData>(
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
    getNextPageParam?: GetNextPageParamFunction<number, TResponse>
    select?: (data: { pages: TResponse[]; pageParams: number[] }) => TTransformedData
  }
) => {
  const queryKey = options?.queryKey || [url]
  const limit = options?.limit || 10

  const defaultGetNextPageParam: GetNextPageParamFunction<number, TResponse> = (
    lastPage: TResponse,
    allPages: TResponse[],
    lastPageParam: number
  ) => {
    // Check for hasMore inside data.pagination (your backend structure)
    if (lastPage && typeof lastPage === 'object' && 'data' in lastPage) {
      const data = (lastPage as any).data
      if (data && typeof data === 'object' && 'pagination' in data) {
        const pagination = data.pagination
        if (pagination && typeof pagination === 'object' && 'hasMore' in pagination) {
          return pagination.hasMore ? lastPageParam + 1 : undefined
        }
      }
    }
    return undefined
  }

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }): Promise<TResponse> => {
      const separator = url.includes('?') ? '&' : '?'
      const paginatedUrl = `${url}${separator}page=${pageParam}&limit=${limit}`
      return api.get<TResponse>(paginatedUrl, options)
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
    data: (query.data as TTransformedData) || null,
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
export const useTanStackMutation = <TResponse, TRequestData>(
  url: string,
  options?: TanStackOptions & {
    mutationKey?: string[]
    onSuccess?: (data: TResponse, variables: TRequestData) => void
    onError?: (error: Error, variables: TRequestData) => void
    onSettled?: (data: TResponse | undefined, error: Error | null, variables: TRequestData) => void
    invalidateQueries?: string[][]
  }
) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: options?.mutationKey || [url],
    mutationFn: async (variables: TRequestData): Promise<TResponse> => {
      // For DELETE operations, append the ID to the URL
      const finalUrl =
        options?.method === 'DELETE' && typeof variables === 'string' ? `${url}/${variables}` : url

      // Check if we're sending FormData by looking for File objects in variables
      const isFormData =
        variables &&
        typeof variables === 'object' &&
        'file' in variables &&
        variables.file instanceof File

      let body: string | FormData | undefined

      if (isFormData) {
        const formData = new FormData()

        // Add file
        formData.append('file', (variables as { file: File }).file)

        // Create the data object without the file
        const dataObject: Record<string, unknown> = {}
        Object.entries(variables as Record<string, unknown>).forEach(([key, value]) => {
          if (key !== 'file' && value !== undefined) {
            dataObject[key] = value
          }
        })

        // Add the data object as a JSON string
        formData.append('data', JSON.stringify(dataObject))

        body = formData
      } else if (variables && typeof variables !== 'string') {
        body = JSON.stringify(variables)
      }

      return fetchApi<TResponse>(finalUrl, {
        ...options,
        body,
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
    error: mutation.error,
    reset: mutation.reset,
  }
}

// Hook for handling form submissions with TanStack Query
export const useTanStackSubmit = <TResponse, TRequestData = unknown>(
  url: string,
  options?: TanStackOptions & {
    mutationKey?: string[]
    invalidateQueries?: string[][]
    onSuccess?: (data: TResponse, variables: TRequestData) => void
  }
) => {
  const queryClient = useQueryClient()

  const mutation = useTanStackMutation<TResponse, TRequestData>(url, {
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
    async (body: TRequestData) => {
      return mutation.mutateAsync(body)
    },
    [mutation]
  )

  return {
    ...mutation,
    submit,
  }
}
