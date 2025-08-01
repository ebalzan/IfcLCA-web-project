import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { MaterialService } from '@/lib/services/material-service'
import { OpenEPDService } from '@/lib/services/openepd-service'
import { AuthenticatedValidationRequest, withAuthAndValidation } from '@/lib/validation-middleware'
import { Material } from '@/models'
import { MatchOpenEPDRequest, matchOpenEPDSchema } from '@/schemas/api'

async function handleMaterialMatch(request: AuthenticatedValidationRequest<MatchOpenEPDRequest>) {
  try {
    const { materialIds, openEPDProductId, density: userDefinedDensity } = request.validatedData

    // Fetch the OpenEPD product
    const openEPDProduct = await OpenEPDService.getProductById({ productId: openEPDProductId })
    if (!openEPDProduct) {
      return NextResponse.json({ error: 'OpenEPD product not found' }, { status: 404 })
    }

    // Use user-defined density if provided, otherwise use product density
    const finalDensity = userDefinedDensity || openEPDProduct.density || 1000 // Default to 1000 kg/m³

    const objectIds = materialIds.map((id: string) => new Types.ObjectId(id))

    // Update materials with OpenEPD match
    await Material.updateMany(
      { _id: { $in: objectIds } },
      {
        $set: {
          openepdMatchId: openEPDProductId,
          openEPDProduct,
          density: finalDensity,
          updatedAt: new Date(),
        },
      }
    )

    // Update elements with new environmental indicators
    await MaterialService.updateElementsForOpenEPDMatch(materialIds, openEPDProduct, finalDensity)

    return NextResponse.json({
      success: true,
      matchedCount: materialIds.length,
      product: openEPDProduct,
    })
  } catch (error: unknown) {
    console.error('OpenEPD match error:', error)
    return NextResponse.json(
      { error: 'Failed to match materials with OpenEPD product' },
      { status: 500 }
    )
  }
}

export const POST = withAuthAndValidation(matchOpenEPDSchema, handleMaterialMatch)
