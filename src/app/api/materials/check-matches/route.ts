import { NextResponse } from 'next/server'
import { getUserId } from '@/lib/api-middleware'
import { MaterialService } from '@/lib/services/material-service'
import { AuthenticatedValidationRequest, withAuthAndValidation } from '@/lib/validation-middleware'
import { Project } from '@/models'
import { CheckMatchesRequest, checkMatchesSchema } from '@/schemas/api'

export interface CheckMatchesResponse {
  unmatchedMaterials: string[]
  matchedMaterials: string[]
  unmatchedCount: number
}

async function checkAndCreateMaterialMatches(
  request: AuthenticatedValidationRequest<CheckMatchesRequest>
) {
  const userId = getUserId(request)

  const { materialNames, projectId } = request.validatedData

  // Verify that the project belongs to the current user
  const project = await Project.findOne({ _id: projectId, userId }).lean()
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const unmatchedMaterials: string[] = []
  const matchedMaterials: string[] = []

  for (const materialName of materialNames) {
    // Check if the material, already matched to KBOB, exists in the user's projects
    const existingMatch = await MaterialService.findMaterialInUserProjects(materialName, userId)
    // If the material, already matched to KBOB, does not exist in the user's projects, add it to the unmatched materials
    if (!existingMatch) {
      unmatchedMaterials.push(materialName)
    } else {
      // If the material, already matched to KBOB, exists in the user's projects, create a new material in the current project with the same match
      const newMaterial = await MaterialService.createOrUpdateMaterialWithKbobMatch(
        projectId,
        materialName,
        existingMatch.kbobMatchId._id,
        existingMatch.density
      )
      matchedMaterials.push(newMaterial.name)
    }
  }

  return NextResponse.json<CheckMatchesResponse>({
    unmatchedMaterials,
    matchedMaterials,
    unmatchedCount: unmatchedMaterials.length,
  })
}

export const POST = withAuthAndValidation(checkMatchesSchema, checkAndCreateMaterialMatches)
