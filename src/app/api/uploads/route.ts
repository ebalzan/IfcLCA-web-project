import { NextResponse } from 'next/server'
import { AuthenticatedRequest } from '@/lib/api-middleware'
import { validatePathParams } from '@/lib/validation-middleware'
import { Upload } from '@/models'
import { uploadIdSchema } from '@/schemas/api'

export async function processMaterials(
  projectId: string,
  // elements: Array<{
  //   id: string;
  //   name: string;
  //   type: string;
  //   globalId: string;
  //   netVolume?: number | { net: number; gross: number };
  //   grossVolume?: number | { net: number; gross: number };
  //   materialLayers?: any;
  //   properties?: {
  //     loadBearing?: boolean;
  //     isExternal?: boolean;
  //   };
  // }>,
  uploadId: string,
  request: AuthenticatedRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const validatedParams = await validatePathParams(uploadIdSchema, context.params)
  const upload = await Upload.findById(validatedParams.id).populate('elements')

  if (!upload) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
  }

  // Create elements
  // const processedElements = await Element.create(
  //   elements.map((element) => {
  //     const volume = (() => {
  //       if (typeof element.netVolume === "object") {
  //         return element.netVolume.net;
  //       }
  //       if (typeof element.netVolume === "number") {
  //         return element.netVolume;
  //       }
  //       if (typeof element.grossVolume === "object") {
  //         return element.grossVolume.net;
  //       }
  //       if (typeof element.grossVolume === "number") {
  //         return element.grossVolume;
  //       }
  //       return 0;
  //     })();

  //     return {
  //       projectId,
  //       guid: element.globalId,
  //       name: element.name,
  //       type: element.type,
  //       volume: volume,
  //       loadBearing: element.properties?.loadBearing || false,
  //       isExternal: element.properties?.isExternal || false,
  //       materials: [],
  //     };
  //   })
  // );
}
