import { Types } from 'mongoose'
import { logger } from '@/lib/logger'
import { ParseIFCFileRequest, ParseIFCFileResponse } from '@/schemas/api/ifc'
import { withTransaction } from '@/utils/withTransaction'
import { IFCProcessingService } from './ifc-processing-service'
// import { parseIfcWithWasm } from './ifc-wasm-parser'
import { MaterialService } from '../material-service'
import { UploadService } from '../upload-service'

export async function parseIFCFile({
  data: { filename, elements, projectId, userId },
  session,
}: ParseIFCFileRequest): Promise<ParseIFCFileResponse> {
  return withTransaction(async useSession => {
    try {
      logger.debug('Creating upload record')

      const uploadResult = await UploadService.createUpload({
        data: {
          projectId,
          userId,
          filename,
          status: 'Processing',
          _count: {
            elements: 0,
            materials: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: useSession,
      })

      if (!uploadResult.success) {
        throw new Error('Failed to create upload record')
      }

      // // Parse the Ifc file locally using IfcOpenShell WASM
      // logger.debug('Parsing Ifc file locally using IfcOpenShell WASM')

      // const wasmResult = await parseIfcWithWasm(file)
      // logger.debug('WASM Parse Result', wasmResult)

      // Process materials
      const processElementsAndMaterialsFromIFCResponse =
        await IFCProcessingService.processElementsAndMaterialsFromIFC({
          data: {
            projectId,
            elements,
            uploadId: new Types.ObjectId(uploadResult.data._id),
          },
          session: useSession,
        })

      if (!processElementsAndMaterialsFromIFCResponse.success) {
        throw new Error('Failed to process elements and materials')
      }

      const { elementCount, materialCount } = processElementsAndMaterialsFromIFCResponse.data

      // Get all materials
      const materials = await MaterialService.getMaterialBulk({
        data: {
          materialIds: [],
          projectId,
          pagination: { page: 1, size: materialCount },
        },
        session: useSession,
      })

      if (!materials.success) {
        throw new Error('Failed to get materials')
      }

      // Apply automatic material matches
      const applyAutomaticMaterialMatchesResponse =
        await IFCProcessingService.applyAutomaticMaterialMatches({
          data: {
            materialIds: materials.data.materials.map(material => new Types.ObjectId(material._id)),
            projectId,
          },
          session: useSession,
        })

      if (!applyAutomaticMaterialMatchesResponse.success) {
        throw new Error('Failed to apply automatic material matches')
      }

      const { matchedCount } = applyAutomaticMaterialMatchesResponse.data

      // Update upload record
      const updatedUpload = await UploadService.updateUpload({
        data: {
          uploadId: new Types.ObjectId(uploadResult.data._id),
          projectId,
          updates: {
            status: 'Completed',
            _count: {
              elements: elementCount,
              materials: materialCount,
            },
            updatedAt: new Date(),
          },
        },
        session: useSession,
      })

      if (!updatedUpload.success) {
        throw new Error('Failed to update upload record')
      }

      return {
        success: true,
        data: {
          uploadId: new Types.ObjectId(uploadResult.data._id),
          projectId,
          _count: {
            elements: elementCount,
            matchedMaterials: matchedCount,
            unmatchedMaterials: materialCount - matchedCount,
          },
          shouldRedirectToLibrary: materialCount - matchedCount > 0,
        },
        message: 'IFC file parsed successfully',
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error('Error in parseIFCFile', { error: error.message })
      }
      throw error
    }
  }, session)
}
