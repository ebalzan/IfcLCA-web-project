import { api } from '@/lib/fetch'
import { logger } from '@/lib/logger'

export interface OpenEPDProduct {
  id: string
  name: string
  manufacturer: string
  category: string
  description?: string
  gwp?: number // Global Warming Potential (kg CO2-eq)
  ubp?: number // Environmental Damage Points
  penre?: number // Primary Energy Non-Renewable (MJ)
  unit: string
  density?: number
  declaredUnit: string
  validFrom: string
  validTo: string
}

export interface OpenEPDSearchParams {
  query?: string
  category?: string
  manufacturer?: string
  limit?: number
  offset?: number
}

export interface OpenEPDSearchResponse {
  products: OpenEPDProduct[]
  total: number
  hasMore: boolean
}

export interface OpenEPDGetProductRequest {
  productId: string
  fields?: string[]
}

export class OpenEPDService {
  private static baseURL = process.env.OPENEPD_API_URL
  private static apiKey = process.env.OPENEPD_API_KEY

  /**
   * Search for products in openEPD database
   */
  static async searchProducts(params: OpenEPDSearchParams): Promise<OpenEPDSearchResponse> {
    try {
      const searchParams = new URLSearchParams()

      if (params.query) searchParams.append('q', params.query)
      if (params.category) searchParams.append('category', params.category)
      if (params.manufacturer) searchParams.append('manufacturer', params.manufacturer)
      if (params.limit) searchParams.append('limit', params.limit.toString())
      if (params.offset) searchParams.append('offset', params.offset.toString())

      const response = await api.get<OpenEPDSearchResponse>(
        `${this.baseURL}/epds/search?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )

      logger.debug('OpenEPD search response', {
        query: params.query,
        results: response.products.length,
        total: response.total,
      })

      return response
    } catch (error) {
      logger.error('Error searching OpenEPD products', { error, params })
      throw new Error(
        `Failed to search OpenEPD products: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get detailed product information by ID
   */
  static async getProductById({
    productId,
    fields,
  }: OpenEPDGetProductRequest): Promise<OpenEPDProduct> {
    try {
      let url = `${this.baseURL}/epds`
      if (fields) {
        url += `?fields=${fields.join(',')}`
      }
      const response = await api.get<OpenEPDProduct>(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      })

      logger.debug('OpenEPD product details retrieved', {
        productId,
        name: response.name,
        manufacturer: response.manufacturer,
      })

      return response
    } catch (error) {
      logger.error('Error fetching OpenEPD product details', { error, productId })
      throw new Error(
        `Failed to fetch OpenEPD product details: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get product categories
   */
  static async getCategories(): Promise<string[]> {
    try {
      const response = await api.get<{ categories: string[] }>(`${this.baseURL}/epds/categories`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      })

      return response.categories
    } catch (error) {
      logger.error('Error fetching OpenEPD categories', { error })
      throw new Error(
        `Failed to fetch OpenEPD categories: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Find best matching product for a material name
   */
  static async findBestMatch(materialName: string): Promise<OpenEPDProduct | null> {
    try {
      // Clean the material name for better search results
      const cleanedName = materialName.trim().toLowerCase()

      // Try exact match first
      const exactMatch = await this.searchProducts({
        query: materialName,
        limit: 1,
      })

      if (exactMatch.products.length > 0) {
        return exactMatch.products[0]
      }

      // Try partial match with broader search
      const partialMatch = await this.searchProducts({
        query: cleanedName.split(' ')[0], // Use first word
        limit: 5,
      })

      if (partialMatch.products.length > 0) {
        // Return the first result (you could implement more sophisticated matching logic)
        return partialMatch.products[0]
      }

      return null
    } catch (error) {
      logger.error('Error finding OpenEPD match', { error, materialName })
      return null
    }
  }

  /**
   * Calculate environmental indicators for a given volume and product
   */
  static calculateIndicators(volume: number, density: number, product: OpenEPDProduct) {
    const mass = volume * density

    return {
      gwp: product.gwp ? (product.gwp * mass) / 1000 : 0, // Convert to kg CO2-eq
      ubp: product.ubp ? product.ubp * mass : 0,
      penre: product.penre ? product.penre * mass : 0,
    }
  }
}
