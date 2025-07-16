import { Types } from "mongoose"

interface IKBOBMaterial {
  _id: Types.ObjectId
  name: string
  category: string
  gwp: number
  ubp: number
  penre: number
  "kg/unit"?: number
  "min density"?: number
  "max density"?: number
}

export default IKBOBMaterial