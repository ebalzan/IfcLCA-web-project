import { IEC3Material } from '@/interfaces/materials/IEC3Material'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, withAuthAndDB } from '@/lib/api-middleware'
import { api } from '@/lib/fetch'
import { validateQueryParams } from '@/lib/validation-middleware'
import {
  searchEC3MaterialsRequestSchemaApi,
  SearchEC3MaterialsResponseApi,
} from '@/schemas/api/ec3/search'

async function searchEC3Materials(request: AuthenticatedRequest) {
  try {
    const queryParams = validateQueryParams(
      searchEC3MaterialsRequestSchemaApi.shape.query,
      request,
      {
        sortBy: '+name',
        pagination: {
          page: 1,
          size: 50,
        },
      }
    )

    if (!queryParams) {
      return sendApiErrorResponse(new Error('Invalid query parameters'), request)
    }

    const { pagination, sortBy, name } = queryParams
    const { page, size } = pagination

    const params = new URLSearchParams()

    if (sortBy?.trim()) {
      params.set('sort_by', sortBy.trim())
    }

    if (name?.trim()) {
      params.set('name__like', name.trim())
    }

    params.set('page_number', page.toString())
    params.set('page_size', size.toString())

    const fields =
      'id,name,manufacturer,category,description,gwp,ubp,penre,unit,density,declared_unit,valid_from,valid_to'

    const ec3Materials = await api.get<IEC3Material[]>(
      `${process.env.EC3_API_URL}/industry_epds?fields=${fields}&${params.toString()}`,
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

export const GET = withAuthAndDB(searchEC3Materials)
