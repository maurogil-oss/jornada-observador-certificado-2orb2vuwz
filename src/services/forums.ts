import pb from '@/lib/pocketbase/client'

export interface Forum {
  id: string
  code: string
  title: string
  objective: string
  relator_id: string
  opening_date: string
  closing_date: string
  status: 'Aberto' | 'Em Consolidação' | 'Encerrado'
  created: string
  updated: string
  expand?: { relator_id?: any }
}

export const getForums = (): Promise<Forum[]> =>
  pb.collection('forums').getFullList({ sort: 'code', expand: 'relator_id' })

export const getForum = (id: string): Promise<Forum> =>
  pb.collection('forums').getOne(id, { expand: 'relator_id' })

export const createForum = (data: Partial<Forum>) => pb.collection('forums').create(data)

export const updateForum = (id: string, data: Partial<Forum>) =>
  pb.collection('forums').update(id, data)

export const deleteForum = (id: string) => pb.collection('forums').delete(id)

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
