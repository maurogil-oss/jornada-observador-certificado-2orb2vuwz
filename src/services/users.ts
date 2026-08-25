import pb from '@/lib/pocketbase/client'

export const getUsers = () => pb.collection('users').getFullList({ sort: '-created' })

export const getPendingUsersCount = async () => {
  const result = await pb.collection('users').getList(1, 1, {
    filter: 'is_active = false',
  })
  return result.totalItems
}

export const updateUser = (id: string, data: any) => pb.collection('users').update(id, data)

export const deleteUser = (id: string) => pb.collection('users').delete(id)
