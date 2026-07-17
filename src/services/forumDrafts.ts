import pb from '@/lib/pocketbase/client'

export interface ForumDraft {
  id: string
  forum_id: string
  title: string
  file: string
  is_official: boolean
  created: string
  updated: string
}

export const getForumDrafts = (forumId: string): Promise<ForumDraft[]> =>
  pb.collection('forum_drafts').getFullList({
    filter: `forum_id="${forumId}"`,
    sort: '-created',
  })

export const createForumDraft = (data: FormData) => pb.collection('forum_drafts').create(data)

export const updateForumDraft = (id: string, data: Partial<ForumDraft>) =>
  pb.collection('forum_drafts').update(id, data)

export const deleteForumDraft = (id: string) => pb.collection('forum_drafts').delete(id)
