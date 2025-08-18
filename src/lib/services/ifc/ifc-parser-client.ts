import { Types } from 'mongoose'
import { logger } from '@/lib/logger'
import { ParseIFCFileRequest, ParseIFCFileResponse } from '@/schemas/api/ifc'
import { withTransaction } from '@/utils/withTransaction'
import { IFCProcessingService } from './ifc-processing-service'
import { parseIfcWithWasm } from './ifc-wasm-parser'
import { MaterialService } from '../material-service'
import { UploadService } from '../upload-service'

export async function parseIFCFile({
  data: { file, projectId, userId },
  session,
}: ParseIFCFileRequest): Promise<ParseIFCFileResponse> {
  return withTransaction(async useSession => {
    try {
      logger.debug('Starting Ifc parsing process', {
        filename: file.name,
        size: file.size,
        type: file.type,
        projectId,
      })

      logger.debug('Creating upload record')

      const uploadResult = await UploadService.createUpload({
        data: {
          projectId,
          userId,
          filename: file.name,
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

      // Parse the Ifc file locally using IfcOpenShell WASM
      logger.debug('Parsing Ifc file locally using IfcOpenShell WASM')

      const parseResult = await parseIfcWithWasm(file)
      logger.debug('WASM Parse Result', parseResult)

      // Process materials
      const processElementsAndMaterialsFromIFCResponse =
        await IFCProcessingService.processElementsAndMaterialsFromIFC({
          data: {
            projectId,
            elements: parseResult.elements,
            uploadId: new Types.ObjectId(uploadResult.data._id),
          },
          session: useSession,
        })
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

      // Apply automatic material matches
      const applyAutomaticMaterialMatchesResponse =
        await IFCProcessingService.applyAutomaticMaterialMatches({
          data: {
            materialIds: materials.data.materials.map(material => new Types.ObjectId(material._id)),
            projectId,
          },
          session: useSession,
        })
      const { matchedCount } = applyAutomaticMaterialMatchesResponse.data

      return {
        success: true,
        data: {
          uploadId: uploadResult.data._id.toString(),
          projectId: projectId.toString(),
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
