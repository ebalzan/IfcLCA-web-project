import { NextResponse } from 'next/server'
import { withDB } from '@/lib/api-middleware'
import { KBOBMaterial } from '@/models/kbob'

export const dynamic = 'force-dynamic'

async function getKBOBMaterials() {
  const materials = await KBOBMaterial.findValidMaterials()
  return NextResponse.json(materials)
}

export const GET = withDB(getKBOBMaterials)
