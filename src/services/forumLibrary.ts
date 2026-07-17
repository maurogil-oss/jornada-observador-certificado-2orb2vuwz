import pb from '@/lib/pocketbase/client'

export interface ForumLibraryItem {
  id: string
  forum_id: string
  title: string
  file: string
  category: 'Legislação' | 'Estudos' | 'Normas Técnicas' | 'Apresentações' | 'Outros'
  created: string
  updated: string
}

export const getForumLibrary = (forumId: string): Promise<ForumLibraryItem[]> =>
  pb.collection('forum_library').getFullList({
    filter: `forum_id="${forumId}"`,
    sort: '-created',
  })

export const createForumLibraryItem = (data: FormData) =>
  pb.collection('forum_library').create(data)

export const deleteForumLibraryItem = (id: string) => pb.collection('forum_library').delete(id)
