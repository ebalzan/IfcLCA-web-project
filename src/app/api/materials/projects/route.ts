import { NextResponse } from 'next/server'
import { withAuthAndDBParams } from '@/lib/api-middleware'
import { AuthenticatedRequest, getUserId } from '@/lib/auth-middleware'
import { MaterialService } from '@/lib/services/material-service'

async function getProjectsWithMaterials(request: AuthenticatedRequest) {
  const userId = getUserId(request)
  const projects = await MaterialService.getProjectsWithMaterials(userId)
  return NextResponse.json(projects)
}

export const GET = withAuthAndDBParams(getProjectsWithMaterials)
