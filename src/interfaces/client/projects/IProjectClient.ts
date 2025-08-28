import IProjectDB from '@/interfaces/projects/IProjectDB'

export interface IProjectClient extends Omit<IProjectDB, '_id'> {
  _id: string
}
