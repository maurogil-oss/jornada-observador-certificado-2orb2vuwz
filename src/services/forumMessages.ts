import pb from '@/lib/pocketbase/client'

export interface ForumMessage {
  id: string
  forum_id: string
  user_id: string
  parent_id: string | null
  content: string
  attachments: string[]
  created: string
  updated: string
  expand?: { user_id?: any }
}

export const getForumMessages = (forumId: string): Promise<ForumMessage[]> =>
  pb.collection('forum_messages').getFullList({
    filter: `forum_id="${forumId}"`,
    sort: 'created',
    expand: 'user_id',
  })

export const createForumMessage = (data: FormData) => pb.collection('forum_messages').create(data)

export const deleteForumMessage = (id: string) => pb.collection('forum_messages').delete(id)
