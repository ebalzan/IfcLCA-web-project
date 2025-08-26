import { useCallback, useMemo } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { useTanStackInfiniteQuery } from '@/hooks/use-tanstack-fetch'
import { IEC3Material } from '@/interfaces/materials/IEC3Material'
import { Queries } from '@/queries'
import { SearchMaterialsResponse } from '@/schemas/api/ec3/search'
import { useMaterialsLibraryStore } from './materials-library-store'

export function useEC3Search() {
  const { ec3SearchValue, setEc3SearchValue } = useMaterialsLibraryStore()
  const debouncedSearchValue = useDebounce(ec3SearchValue, 1000)

  // Always enable the query to fetch initial materials
  const shouldSearch = true

  const {
    data: searchResults,
    refetch: searchMaterials,
    isLoading: isSearching,
    error: searchError,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useTanStackInfiniteQuery<SearchMaterialsResponse, IEC3Material[]>(
    `/api/materials/search${debouncedSearchValue ? `?name=${encodeURIComponent(debouncedSearchValue.trim())}` : ''}`,
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
