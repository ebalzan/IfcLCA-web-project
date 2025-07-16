import ILCAIndicators from '@/interfaces/materials/ILCAIndicators'

interface IProjectClient {
  _id: string
  name: string
  description?: string
  userId: string
  imageUrl?: string
  emissions: ILCAIndicators
  createdAt: Date
  updatedAt: Date
}

export default IProjectClient
