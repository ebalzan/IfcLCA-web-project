
import ILCAIndicators from "@/interfaces/materials/ILCAIndicators"
import { IElementWithVirtuals } from "../elements/IElementClient"
import IMaterialClient from "../materials/IMaterialClient"
import IUploadClient from "../uploads/IUploadClient"
import IProjectClient from "./IProjectClient"

export interface IElementWithMaterialRefsClient extends IElementWithVirtuals{
  materialRefs: IMaterialClient[]
}

interface IProjectWithStatsClient extends IProjectClient {
  elements: IElementWithMaterialRefsClient[]
  materials: IMaterialClient[]
  uploads: IUploadClient[]
  totalEmissions: ILCAIndicators
  lastActivityAt: Date
  _count: {
    elements: number
    uploads: number
    materials: number
  }
}

export default IProjectWithStatsClient
