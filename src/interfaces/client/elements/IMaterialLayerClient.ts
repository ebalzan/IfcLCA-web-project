import IMaterialClient from "../materials/IMaterialClient"

interface IMaterialLayerClient {
  _id: string
  material: IMaterialClient
  volume: number
  fraction?: number
  thickness?: number
}

export default IMaterialLayerClient
