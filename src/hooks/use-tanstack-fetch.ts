import { useCallback } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  GetNextPageParamFunction,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseMutationOptions,
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
export const useTanStackQuery = <TResponse, TTransformedData = TResponse>(
  url: string,
  options?: TanStackOptions & UseQueryOptions<TResponse, Error, TTransformedData>
) => {
  const queryClient = useQueryClient()
  const queryKey = options?.queryKey || [url]

  // Extract fetch-specific options, excluding TanStack-specific properties
  const {
    showErrorToast,
    showSuccessToast,
    successMessage,
    queryKey: _queryKey,
    queryFn: _queryFn,
    enabled: _enabled,
    staleTime: _staleTime,
    gcTime: _gcTime,
    refetchOnWindowFocus: _refetchOnWindowFocus,
    refetchOnMount: _refetchOnMount,
    retry: _retry,
    retryDelay: _retryDelay,
    select: _select,
    ...fetchOptions
  } = options || {}

  const query = useQuery({
    ...options,
    queryKey,
    queryFn: async (): Promise<TResponse> => {
      return fetchApi<TResponse>(url, fetchOptions)
    },
  })

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error ? query.error.message : null,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey }),
  }
}

// TanStack Query infinite query hook for paginated data
export const useTanStackInfiniteQuery = <TResponse, TTransformedData = TResponse>(
  url: string,
  options?: TanStackOptions &
    UseInfiniteQueryOptions<TResponse, Error, TTransformedData> & {
      limit?: number
    }
) => {
  const queryKey = options?.queryKey || [url]
  const limit = options?.limit ?? 10

  // Extract fetch-specific options, excluding TanStack-specific properties
  const {
    showErrorToast,
    showSuccessToast,
    successMessage,
    limit: _limit,
    queryKey: _queryKey,
    queryFn: _queryFn,
    enabled: _enabled,
    staleTime: _staleTime,
    gcTime: _gcTime,
    refetchOnWindowFocus: _refetchOnWindowFocus,
    refetchOnMount: _refetchOnMount,
    retry: _retry,
    retryDelay: _retryDelay,
    getNextPageParam: _getNextPageParam,
    select: _select,
    initialPageParam: _initialPageParam,
    ...fetchOptions
  } = options || {}

  const defaultGetNextPageParam: GetNextPageParamFunction<unknown, TResponse> = (
    lastPage: TResponse,
    allPages: TResponse[],
    lastPageParam: unknown
  ) => {
    // Check for hasMore inside data.pagination (your backend structure)
    if (lastPage && typeof lastPage === 'object' && 'data' in lastPage) {
      const data = (lastPage as any).data
      if (data && typeof data === 'object' && 'pagination' in data) {
        const pagination = data.pagination
        if (pagination && typeof pagination === 'object' && 'hasMore' in pagination) {
          return pagination.hasMore ? (lastPageParam as number) + 1 : undefined
        }
      }
    }
    return undefined
  }

  const query = useInfiniteQuery({
    ...options,
    queryKey,
    queryFn: async ({ pageParam = 1 }): Promise<TResponse> => {
      const separator = url.includes('?') ? '&' : '?'
      const paginatedUrl = `${url}${separator}page=${pageParam}&limit=${limit}`
      return api.get<TResponse>(paginatedUrl, fetchOptions)
    },
    getNextPageParam: options?.getNextPageParam || defaultGetNextPageParam,
    initialPageParam: 1,
  })

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error ? query.error.message : null,
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
  options?: TanStackOptions &
    UseMutationOptions<TResponse, Error, TRequestData, unknown> & {
      invalidateQueries?: readonly unknown[][]
    }
) => {
  const queryClient = useQueryClient()

  // Extract fetch-specific options, excluding TanStack-specific properties
  const {
    showErrorToast,
    showSuccessToast,
    successMessage,
    invalidateQueries,
    mutationKey: _mutationKey,
    mutationFn: _mutationFn,
    retryDelay: _retryDelay,
    onSuccess: _onSuccess,
    onError: _onError,
    onSettled: _onSettled,
    ...fetchOptions
  } = options || {}

  const mutation = useMutation({
    ...options,
    mutationKey: options?.mutationKey || [url],
    mutationFn: async (variables: TRequestData): Promise<TResponse> => {
      // For DELETE operations, append the ID to the URL
      const finalUrl =
        fetchOptions?.method === 'DELETE' && typeof variables === 'string'
          ? `${url}/${variables}`
          : url

      console.log('VARS#####', variables)

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
        // Wrap the client data in the expected format for the backend
        const requestData = {
          data: variables,
        }
        body = JSON.stringify(requestData)
      }

      return fetchApi<TResponse>(finalUrl, {
        ...fetchOptions,
        body,
      })
    },
    onSuccess: (data, variables, context) => {
      if (showSuccessToast && successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        })
      }

      // Invalidate related queries
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey })
        })
      }

      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      if (showErrorToast !== false) {
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
      options?.onError?.(error, variables, context)
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
  options?: TanStackOptions &
    UseMutationOptions<TResponse, Error, TRequestData, unknown> & {
      invalidateQueries?: readonly unknown[][]
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
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey })
        })
      }
      options?.onSuccess?.(data, variables, context)
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
