import { Types } from 'mongoose'

interface IOpenEPDProduct {
  _id: Types.ObjectId
  name: string
  category: string
  gwp: number
  ubp: number
  penre: number
  'kg/unit'?: number
  'min density'?: number
  'max density'?: number
}

export default IOpenEPDProduct
