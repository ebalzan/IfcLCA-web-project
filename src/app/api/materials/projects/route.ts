import { NextResponse } from 'next/server'
import { AuthenticatedRequest, getUserId, withAuthAndDBParams } from '@/lib/api-middleware'
import { MaterialService } from '@/lib/services/material-service'

async function getProjectsWithMaterials(request: AuthenticatedRequest) {
  const userId = getUserId(request)
  const projects = await MaterialService.getProjectsWithMaterials(userId)
  return NextResponse.json(projects)
}

export const GET = withAuthAndDBParams(getProjectsWithMaterials)
