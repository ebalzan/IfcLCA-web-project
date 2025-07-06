import { Types } from "mongoose"

interface IMaterialLayer {
  material: Types.ObjectId
  volume: number
  fraction: number
  thickness?: number
}

export default IMaterialLayer
