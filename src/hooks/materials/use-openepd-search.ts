import { useCallback, useMemo, useState } from 'react'
import { OpenEPDProduct } from '@/lib/services/openepd-service'
import { Queries } from '@/queries'
import { useTanStackQuery } from '../use-tanstack-fetch'

export interface OpenEPDSearchState {
  searchTerm: string
  products: OpenEPDProduct[]
  isSearching: boolean
  filteredProducts: OpenEPDProduct[]
}

export function useOpenEPDSearch() {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [products, setProducts] = useState<OpenEPDProduct[]>([])

  const { refetch: searchProducts, isLoading: isSearching } = useTanStackQuery(
    `/v2/epds/search?omf=${encodeURIComponent(searchTerm)}&limit=50`,
    {
      queryKey: [Queries.SEARCH_OPENEPD, searchTerm],
    }
  )

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products

    const searchTermLower = searchTerm.toLowerCase()
    return products.filter(
      product =>
        product.name.toLowerCase().includes(searchTermLower) ||
        product.manufacturer.toLowerCase().includes(searchTermLower) ||
        product.category.toLowerCase().includes(searchTermLower)
    )
  }, [products, searchTerm])

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      searchProducts()
    }
  }, [searchTerm, searchProducts])

  const handleSearchTermChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  return {
    // State
    searchTerm,
    products,
    isSearching,
    filteredProducts,

    // Actions
    handleSearch,
    handleSearchTermChange,
  }
}
