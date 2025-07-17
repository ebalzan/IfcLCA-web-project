import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'
import { AuthenticatedRequest, withAuthAndDBParams } from '@/lib/api-middleware'
import { Element, KBOBMaterial, Material } from '@/models'

interface MatchMaterialsToKBOBRequest {
  materialIds: string[]
  kbobMaterialId: string
  density: number
}

async function matchMaterialsToKBOB(request: AuthenticatedRequest) {
  const body: MatchMaterialsToKBOBRequest = await request.json()
  const { materialIds, kbobMaterialId, density: userDefinedDensity } = body

  // First fetch the KBOB material
  const kbobMaterial = await KBOBMaterial.findById(kbobMaterialId).lean()

  if (!kbobMaterial) {
    return NextResponse.json({ error: 'KBOB material not found' }, { status: 404 })
  }

  // Use user-defined density if provided, otherwise calculate from KBOB material data
  let density = userDefinedDensity
  if (!density) {
    if (kbobMaterial['kg/unit'] && typeof kbobMaterial['kg/unit'] === 'number') {
      density = kbobMaterial['kg/unit']
    } else if (kbobMaterial['min density'] && kbobMaterial['max density']) {
      density = (kbobMaterial['min density'] + kbobMaterial['max density']) / 2
    }
  }

  if (!density) {
    return NextResponse.json({ error: 'Invalid density in KBOB material' }, { status: 400 })
  }

  const objectIds = materialIds.map((id: string) => new mongoose.Types.ObjectId(id))

  // Update materials with KBOB match and density
  await Material.updateMany(
    { _id: { $in: objectIds } },
    {
      $set: {
        kbobMatchId: new mongoose.Types.ObjectId(kbobMaterialId),
        density: density,
        updatedAt: new Date(),
      },
    }
  )

  // Find elements that need updating - add batch processing
  const batchSize = 500
  const allElements = await Element.find({
    'materials.material': { $in: objectIds },
  })
    .populate({
      path: 'materials.material',
      select: '_id name kbobMatchId density',
    })
    .lean()

  // Process elements in batches
  const batches = []
  for (let i = 0; i < allElements.length; i += batchSize) {
    batches.push(allElements.slice(i, i + batchSize))
  }

  let totalModified = 0
  let totalMatched = 0

  for (const elementBatch of batches) {
    // Prepare bulk operations for updating elements
    const bulkOps = elementBatch.map(element => ({
      updateOne: {
        filter: { _id: element._id },
        update: {
          $set: {
            materials: element.materials.map((mat: any) => {
              if (materialIds.includes(mat.material._id.toString())) {
                return {
                  _id: mat._id,
                  material: mat.material._id,
                  volume: mat.volume,
                  fraction: mat.fraction,
                  indicators: {
                    gwp: mat.volume * density * kbobMaterial.gwp,
                    ubp: mat.volume * density * kbobMaterial.ubp,
                    penre: mat.volume * density * kbobMaterial.penre,
                  },
                }
              }
              return mat
            }),
            updatedAt: new Date(),
          },
        },
      },
    }))

    try {
      const result = await Element.bulkWrite(bulkOps, {
        ordered: false,
        writeConcern: { w: 1 },
      })

      totalModified += result.modifiedCount
      totalMatched += result.matchedCount
    } catch (error) {
      console.error('Error in batch:', error)
      // Continue processing other batches
    }
  }

  // Verify updates by sampling elements from different batches
  const sampleSize = Math.min(5, allElements.length)
  const sampleIndices = Array.from({ length: sampleSize }, () =>
    Math.floor(Math.random() * allElements.length)
  )

  const sampledElements = await Element.find({
    _id: { $in: sampleIndices.map(i => allElements[i]._id) },
  })
    .lean()
    .populate<{ materials: { material: IMaterialDB }[] }>('materials.material')

  sampledElements.map(element => ({
    _id: element._id,
    materialsCount: element.materials.length,
    hasIndicators: element.materials.every(
      ({ material: { gwp, ubp, penre } }) => gwp && ubp && penre
    ),
    sampleIndicators: element.materials[0]?.material,
  }))

  return NextResponse.json({
    message: 'Successfully updated materials and elements',
    totalModified,
    totalMatched,
    totalElements: allElements.length,
  })
}

export const POST = withAuthAndDBParams(matchMaterialsToKBOB)
