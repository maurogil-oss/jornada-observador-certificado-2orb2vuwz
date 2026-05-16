import pb from '@/lib/pocketbase/client'

export interface GeoRecord {
  id: string
  name: string
  code?: string
}

export const getCountries = async (): Promise<GeoRecord[]> => {
  return pb.collection('countries').getFullList({ sort: 'name' })
}

export const getStates = async (countryId: string): Promise<GeoRecord[]> => {
  if (!countryId) return []
  return pb
    .collection('states')
    .getFullList({ filter: `country_id = "${countryId}"`, sort: 'name' })
}

export const getCities = async (stateId: string): Promise<GeoRecord[]> => {
  if (!stateId) return []
  return pb.collection('cities').getFullList({ filter: `state_id = "${stateId}"`, sort: 'name' })
}
