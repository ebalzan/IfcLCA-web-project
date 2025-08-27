import { IEC3Material } from '@/interfaces/materials/IEC3Material'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, withAuthAndDB } from '@/lib/api-middleware'
import { api } from '@/lib/fetch'
import { withAuthAndDBQueryParams } from '@/lib/validation-middleware'
import { ValidationContext } from '@/lib/validation-middleware/types'
import {
  SearchEC3MaterialsRequestApi,
  searchEC3MaterialsRequestSchemaApi,
  SearchEC3MaterialsResponseApi,
} from '@/schemas/api/ec3/search'

async function searchEC3Materials(
  request: AuthenticatedRequest,
  context: ValidationContext<never, SearchEC3MaterialsRequestApi['query']>
) {
  try {
    const { pagination, sortBy, name, fields } = context.query
    const { page, size } = pagination || { page: 1, size: 50 }

    const params = new URLSearchParams()

    if (fields) {
      params.set('fields', fields.join(','))
    }
    params.set('page_number', page.toString())
    params.set('page_size', size.toString())
    if (sortBy) {
      params.set('sort_by', sortBy)
    }
    if (name) {
      params.set('name__like', name)
    }

    const ec3Materials = await api.get<IEC3Material[]>(
      `${process.env.EC3_API_URL}/industry_epds?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.EC3_API_KEY}`,
        },
      }
    )

    return sendApiSuccessResponse<SearchEC3MaterialsResponseApi['data']>(
      {
        materials: ec3Materials,
        pagination: {
          page,
          size,
          hasMore: page * size < (ec3Materials?.length || 0),
          totalCount: ec3Materials?.length || 0,
          totalPages: Math.ceil((ec3Materials?.length || 0) / size),
        },
      },
      'Materials fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'search', resource: 'material' })
  }
}

export const GET = withAuthAndDBQueryParams({
  queryParamsSchema: searchEC3MaterialsRequestSchemaApi.shape.query,
  handler: searchEC3Materials,
})
