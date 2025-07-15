import IActivity from "../client/activities/IActivity"

interface ActivityResponse {
  activities: IActivity[]
  hasMore: boolean
  totalCount: number
}

export default ActivityResponse