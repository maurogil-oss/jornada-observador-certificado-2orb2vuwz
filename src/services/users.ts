import pb from '@/lib/pocketbase/client'

export const getUsers = () => pb.collection('users').getFullList({ sort: '-created' })

export const updateUser = (
  id: string,
  data: Partial<{ role: string; points: number; level: string }>,
) => pb.collection('users').update(id, data)
