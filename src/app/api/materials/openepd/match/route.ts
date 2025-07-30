import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { AuthenticatedRequest, withAuthAndDB } from '@/lib/api-middleware'
import { MaterialService } from '@/lib/services/material-service'
import { OpenEPDService } from '@/lib/services/openepd-service'
import { Material } from '@/models'

interface MatchOpenEPDRequest {
  materialIds: string[]
  openepdProductId: string
  density?: number
}

async function handleMaterialMatch(request: AuthenticatedRequest) {
  try {
    const body: MatchOpenEPDRequest = await request.json()
    const { materialIds, openepdProductId, density: userDefinedDensity } = body

    // Fetch the OpenEPD product
    const openepdProduct = await OpenEPDService.getProductById({ productId: openepdProductId })
    if (!openepdProduct) {
      return NextResponse.json({ error: 'OpenEPD product not found' }, { status: 404 })
    }

    // Use user-defined density if provided, otherwise use product density
    const finalDensity = userDefinedDensity || openepdProduct.density || 1000 // Default to 1000 kg/m³

    const objectIds = materialIds.map((id: string) => new Types.ObjectId(id))

    // Update materials with OpenEPD match
    await Material.updateMany(
      { _id: { $in: objectIds } },
      {
        $set: {
          openepdMatchId: openepdProductId,
          openepdProduct: {
            id: openepdProduct.id,
            name: openepdProduct.name,
            manufacturer: openepdProduct.manufacturer,
            category: openepdProduct.category,
            gwp: openepdProduct.gwp,
            ubp: openepdProduct.ubp,
            penre: openepdProduct.penre,
            unit: openepdProduct.unit,
            declaredUnit: openepdProduct.declaredUnit,
          },
          density: finalDensity,
          updatedAt: new Date(),
        },
      }
    )

    // Update elements with new environmental indicators
    await MaterialService.updateElementsForOpenEPDMatch(materialIds, openepdProduct, finalDensity)

    return NextResponse.json({
      success: true,
      matchedCount: materialIds.length,
      product: openepdProduct,
    })
  } catch (error) {
    console.error('OpenEPD match error:', error)
    return NextResponse.json(
      { error: 'Failed to match materials with OpenEPD product' },
      { status: 500 }
    )
  }
}

export const POST = withAuthAndDB(handleMaterialMatch)
