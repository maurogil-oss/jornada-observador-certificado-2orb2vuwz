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
