export type ActivityType =
  | 'project_created'
  | 'file_uploaded'
  | 'material_created'
  | 'project_deleted'
  | 'material_deleted'
  | 'project_updated'
  | 'new_user'
  | 'project_member_added'
  | 'project_member_removed'
  | 'image_uploaded'

interface IActivity {
  id: string
  type: ActivityType
  user: {
    name: string
    imageUrl: string | null
  }
  action: string
  project: {
    id: string
    name: string
  }
  timestamp: Date
  details: {
    materialName?: string
    reason?: string
    description?: string
    filename?: string
    elementCount?: number
    imageUrl?: string
    changes?: {
      name?: string
      description?: string
    }
  } | null
}

export default IActivity
