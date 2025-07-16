import IProjectWithStatsClient from '../client/projects/IProjectWithStatsClient'

export interface ProjectsWithStatsResponse {
  projects: IProjectWithStatsClient[]
  hasMore: boolean
  totalCount: number
}
