import { useCallback, useMemo } from 'react'
import { useTanStackQuery } from '@/hooks/use-tanstack-fetch'
import { EC3SearchResponse } from '@/interfaces/materials/ec3/EC3SearchMaterial'
import { EC3Service } from '@/lib/services/ec3-service'
import { Queries } from '@/queries'
import { useMaterialsLibraryStore } from './materials-library-store'

export function useEC3Search() {
  const { searchValue, setSearchValue } = useMaterialsLibraryStore()
  const shouldSearch = searchValue.trim().length >= 2

  const {
    data: searchResults,
    refetch: searchProducts,
    isLoading: isSearching,
    error: searchError,
    isError,
  } = useTanStackQuery<EC3SearchResponse>(
    `/api/materials/ec3/search?query=${encodeURIComponent(searchValue)}`,
    {
      queryKey: [Queries.SEARCH_EC3, searchValue],
      enabled: shouldSearch,
      staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
      retry: 2,
    }
  )

  // Memoized products from search results
  const products = useMemo(() => {
    return searchResults?.products || []
  }, [searchResults])

  // Additional filtering can be done here if needed
  const filteredProducts = useMemo(() => {
    if (!searchValue.trim() || !products.length) return products

    const searchTermLower = searchValue.toLowerCase()
    return products.filter(
      product =>
        product.name.toLowerCase().includes(searchTermLower) ||
        product.manufacturer.toLowerCase().includes(searchTermLower) ||
        product.category?.toLowerCase().includes(searchTermLower) ||
        product.description?.toLowerCase().includes(searchTermLower)
    )
  }, [products, searchValue])

  // Handle search term changes
  const handleSearchTermChange = useCallback(
    (value: string) => {
      setSearchValue(value)
    },
    [setSearchValue]
  )

  // Manual search trigger (useful for search buttons)
  const handleSearch = useCallback(() => {
    if (shouldSearch) {
      searchProducts()
    }
  }, [shouldSearch, searchProducts])

  // Clear search results
  const handleClearSearch = useCallback(() => {
    setSearchValue('')
  }, [setSearchValue])

  // Find best match for a specific material name
  const findBestMatch = useCallback(async (materialName: string) => {
    try {
      return await EC3Service.findBestMatch(materialName)
    } catch (error) {
      console.error('Error finding best match:', error)
      return null
    }
  }, [])

  // Search statistics
  const searchStats = useMemo(() => {
    return {
      total: searchResults?.total || 0,
      displayed: filteredProducts.length,
      hasMore: searchResults?.hasMore || false,
      hasResults: filteredProducts.length > 0,
      hasSearchTerm: searchValue.trim().length > 0,
    }
  }, [searchResults, filteredProducts, searchValue])

  return {
    // State
    searchValue,
    products,
    filteredProducts,
    isSearching,
    searchError,
    isError,
    searchStats,

    // Actions
    handleSearch,
    handleSearchTermChange,
    handleClearSearch,
    findBestMatch,

    // Utilities
    shouldSearch,
  }
}
