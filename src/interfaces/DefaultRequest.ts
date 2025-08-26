import { ClientSession } from 'mongoose'

export interface DefaultRequest<PATHPARAMS, QUERY, DATA> {
  pathParams: PATHPARAMS
  query: QUERY
  data: DATA
  session?: ClientSession
}
