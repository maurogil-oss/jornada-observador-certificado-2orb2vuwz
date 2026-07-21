import pb from '@/lib/pocketbase/client'

export interface ForumTag {
  id: string
  name: string
  created?: string
  updated?: string
}

export interface ForumRelation {
  id: string
  source_forum_id: string
  target_forum_id: string
  status: 'Pending' | 'Approved'
  created: string
  expand?: {
    source_forum_id?: Forum
    target_forum_id?: Forum
  }
}

export interface Forum {
  id: string
  code: string
  title: string
  objective: string
  relator_id: string
  opening_date: string
  closing_date: string
  status: 'Abertura' | 'Discussões' | 'Consolidação' | 'Aprovação' | 'Publicação'
  pilar_pnatrans: string
  theme_tags: string[]
  created: string
  updated: string
  expand?: { relator_id?: any; theme_tags?: ForumTag[] }
}

export const getForums = (): Promise<Forum[]> =>
  pb.collection('forums').getFullList({ sort: 'code', expand: 'relator_id,theme_tags' })

export const getForum = (id: string): Promise<Forum> =>
  pb.collection('forums').getOne(id, { expand: 'relator_id,theme_tags' })

export const createForum = (data: Partial<Forum>) => pb.collection('forums').create(data)

export const updateForum = (id: string, data: Partial<Forum>) =>
  pb.collection('forums').update(id, data)

export const deleteForum = (id: string) => pb.collection('forums').delete(id)

export const getForumTags = () =>
  pb.collection('forum_tags').getFullList<ForumTag>({ sort: 'name' })
export const createForumTag = (name: string) =>
  pb.collection('forum_tags').create<ForumTag>({ name })

export const getForumRelations = (forumId: string) =>
  pb.collection('forum_relations').getFullList<ForumRelation>({
    filter: `source_forum_id = "${forumId}" || target_forum_id = "${forumId}"`,
    expand: 'source_forum_id,target_forum_id',
  })
export const createForumRelation = (data: Partial<ForumRelation>) =>
  pb.collection('forum_relations').create<ForumRelation>(data)
export const updateForumRelation = (id: string, data: Partial<ForumRelation>) =>
  pb.collection('forum_relations').update<ForumRelation>(id, data)
export const deleteForumRelation = (id: string) => pb.collection('forum_relations').delete(id)

export const getNextForumCode = async (): Promise<string> => {
  const forums = await pb.collection('forums').getFullList({ fields: 'code' })
  const year = new Date().getFullYear()
  const prefix = `FT-${year}-`
  const yearForums = forums.filter((f: any) => f.code?.startsWith(prefix))
  if (yearForums.length === 0) return `${prefix}001`
  const maxNum = Math.max(
    ...yearForums.map((f: any) => {
      const parts = f.code?.split('-') || []
      const num = parseInt(parts[2] || '0', 10)
      return isNaN(num) ? 0 : num
    }),
  )
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`
}
