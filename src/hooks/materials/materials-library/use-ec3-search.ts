import { useCallback, useMemo } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { useTanStackInfiniteQuery } from '@/hooks/use-tanstack-fetch'
import { IEC3MaterialClient } from '@/interfaces/client/materials/IEC3MaterialClient'
import { Queries } from '@/queries'
import { SearchEC3MaterialsResponseApi } from '@/schemas/api/ec3/search'
import { useMaterialsLibraryStore } from './materials-library-store'

export function useEC3Search() {
  const { ec3SearchValue, setEc3SearchValue, ec3SearchFields, ec3SearchSortBy } =
    useMaterialsLibraryStore()
  const debouncedSearchValue = useDebounce(ec3SearchValue, 1000)

  // Always enable the query to fetch initial materials
  const shouldSearch = true

  const ec3SearchParams = new URLSearchParams()
  if (debouncedSearchValue) {
    ec3SearchParams.set('name', debouncedSearchValue.trim())
  }
  if (ec3SearchFields.length > 0) {
    ec3SearchParams.set('fields', ec3SearchFields.join(','))
  }
  if (ec3SearchSortBy) {
    ec3SearchParams.set('sort_by', ec3SearchSortBy)
  }

  const {
    data: searchResults,
    refetch: searchMaterials,
    isLoading: isSearching,
    error: searchError,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useTanStackInfiniteQuery<SearchEC3MaterialsResponseApi, IEC3MaterialClient[]>(
    `/api/ec3/search?${ec3SearchParams.toString()}`,
    {
      queryKey: [Queries.SEARCH_EC3, debouncedSearchValue],
      enabled: shouldSearch,
      staleTime: 5 * 60 * 1000,
      retry: 2,
      select: data => {
        return data.pages.flatMap(page => page.data.materials)
      },
      getNextPageParam: (lastPage, allPages, lastPageParam) =>
        lastPage?.data?.pagination?.hasMore ? (lastPageParam as number) + 1 : undefined,
      initialPageParam: 1,
    }
  )

  const EC3Materials = useMemo(() => {
    try {
      if (!searchResults || searchResults.length === 0) {
        return []
      }

      return searchResults
    } catch (error) {
      console.error('Error processing EC3Materials:', error)
      return []
    }
  }, [searchResults])

  const handleSearchTermChange = useCallback(
    (value: string) => {
      setEc3SearchValue(value)
    },
    [setEc3SearchValue]
  )

  const handleSearch = useCallback(() => {
    searchMaterials()
  }, [searchMaterials])

  const handleClearSearch = useCallback(() => {
    setEc3SearchValue('')
  }, [setEc3SearchValue])

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return {
    ec3SearchValue,
    ec3SearchFields,
    ec3SearchSortBy,
    EC3Materials,
    isSearching,
    searchError,
    isError,
    hasNextPage,
    isFetchingNextPage,
    handleEC3Search: handleSearch,
    handleEC3SearchTermChange: handleSearchTermChange,
    handleClearEC3Search: handleClearSearch,
    handleLoadMore,
  }
}
