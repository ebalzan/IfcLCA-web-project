import { useCallback } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

interface FetchOptions extends RequestInit {
  showErrorToast?: boolean
  showSuccessToast?: boolean
  successMessage?: string
}

// TanStack Query enhanced fetch hook for GET requests
export const useTanStackFetch = <T>(
  url: string,
  options?: FetchOptions & {
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
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
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

// TanStack Query mutation hook for POST/PUT/DELETE operations
export const useTanStackMutation = <T, TVariables = void>(
  url: string,
  options?: FetchOptions & {
    mutationKey?: string[]
    onSuccess?: (data: T, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
    onSettled?: (data: T | undefined, error: Error | null, variables: TVariables) => void
  }
) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: options?.mutationKey || [url],
    mutationFn: async (variables: TVariables): Promise<T> => {
      const response = await fetch(url, {
        ...options,
        body: variables ? JSON.stringify(variables) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      if (options?.showSuccessToast && options?.successMessage) {
        toast({
          title: 'Success',
          description: options.successMessage,
        })
      }
      options?.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      if (options?.showErrorToast !== false) {
        toast({
          title: 'Error',
          description: error.message || 'An error occurred',
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
export const useTanStackSubmit = <T, TVariables = any>(
  url: string,
  options?: FetchOptions & {
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
