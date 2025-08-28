'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Search, Building2, Package, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { api } from '@/lib/fetch'

interface OpenEPDProduct {
  id: string
  name: string
  manufacturer: string
  category: string
  gwp?: number
  ubp?: number
  penre?: number
  unit: string
  declaredUnit: string
}

interface OpenEPDSearchModalProps {
  isOpen: boolean
  onClose: () => void
  materialIds: string[]
  onMatchSuccess: () => void
}

export function OpenEPDSearchModal({
  isOpen,
  onClose,
  materialIds,
  onMatchSuccess,
}: OpenEPDSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<OpenEPDProduct | null>(null)
  const [density, setDensity] = useState('')

  const {
    data: searchResults,
    isLoading: isSearching,
    refetch: searchProducts,
  } = useQuery({
    queryKey: ['openepd-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { products: [], total: 0, hasMore: false }

      const response = await api.get<{
        products: OpenEPDProduct[]
        total: number
        hasMore: boolean
      }>(`/api/materials/openepd/search?q=${encodeURIComponent(searchQuery)}&limit=10`)

      return response
    },
    enabled: false, // Don't auto-search, only on button click
  })

  const matchMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct) throw new Error('No product selected')

      await api.post('/api/materials/openepd/match', {
        materialIds,
        openepdProductId: selectedProduct.id,
        density: density ? parseFloat(density) : undefined,
      })
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Materials matched with OpenEPD product successfully',
      })
      onMatchSuccess()
      onClose()
    },
    onError: error => {
      toast({
        title: 'Error',
        description: 'Failed to match materials with OpenEPD product',
        variant: 'destructive',
      })
    },
  })

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      searchProducts()
    }
  }, [searchQuery, searchProducts])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch]
  )

  const handleProductSelect = useCallback((product: OpenEPDProduct) => {
    setSelectedProduct(product)
  }, [])

  const handleMatch = useCallback(() => {
    if (!selectedProduct) return
    matchMutation.mutate()
  }, [selectedProduct, matchMutation])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Search OpenEPD Products
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Section */}
          <div className="flex gap-2">
            <Input
              placeholder="Search for products (e.g., concrete, steel, wood)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults && searchResults.products.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Found {searchResults.total} products
              </h3>

              {searchResults.products.map(product => (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleProductSelect(product)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-3 w-3" />
                      {product.manufacturer}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{product.category}</Badge>
                      <Badge variant="outline">{product.unit}</Badge>
                    </div>

                    {product.gwp && (
                      <div className="text-sm text-muted-foreground">
                        GWP: {product.gwp} kg CO₂-eq/{product.declaredUnit}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Selected Product Details */}
          {selectedProduct && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-base">Selected Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">{selectedProduct.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedProduct.manufacturer}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  {selectedProduct.gwp && (
                    <div>
                      <div className="font-medium">GWP</div>
                      <div className="text-muted-foreground">
                        {selectedProduct.gwp} kg CO₂-eq/{selectedProduct.declaredUnit}
                      </div>
                    </div>
                  )}
                  {selectedProduct.ubp && (
                    <div>
                      <div className="font-medium">UBP</div>
                      <div className="text-muted-foreground">
                        {selectedProduct.ubp} /{selectedProduct.declaredUnit}
                      </div>
                    </div>
                  )}
                  {selectedProduct.penre && (
                    <div>
                      <div className="font-medium">PENRE</div>
                      <div className="text-muted-foreground">
                        {selectedProduct.penre} MJ/{selectedProduct.declaredUnit}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Density (kg/m³)</label>
                  <Input
                    type="number"
                    placeholder="Enter density"
                    value={density}
                    onChange={e => setDensity(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleMatch} disabled={!selectedProduct || matchMutation.isPending}>
              {matchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Match Materials
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
