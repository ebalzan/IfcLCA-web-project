import { ClientSession } from 'mongoose'

export interface DefaultRequest<T> {
  data: T
  session?: ClientSession
}
