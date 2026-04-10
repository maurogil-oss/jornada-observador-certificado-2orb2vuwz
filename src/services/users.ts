import pb from '@/lib/pocketbase/client'

export const getUsers = () => pb.collection('users').getFullList({ sort: '-created' })

export const updateUser = (id: string, data: any) => pb.collection('users').update(id, data)
