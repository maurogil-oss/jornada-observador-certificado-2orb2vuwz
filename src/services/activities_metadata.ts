import pb from '@/lib/pocketbase/client'

export interface ActivityMetadata {
  id: string
  title: string
  axis?: string
  definition?: string
  required_evidence?: string
  validation_method?: string
  max_limit?: string
  points?: number
}

export const getActivityMetadataByTitle = async (
  title: string,
): Promise<ActivityMetadata | null> => {
  try {
    return await pb.collection('activities_metadata').getFirstListItem(`title="${title}"`)
  } catch (error) {
    // 404 is expected if the metadata hasn't been imported for this specific title
    return null
  }
}
