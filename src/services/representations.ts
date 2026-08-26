import pb from '@/lib/pocketbase/client'

export interface RepresentationInstitution {
  id: string
  name: string
  acronym: string
  category: 'Federal' | 'Estadual' | 'Municipal'
  state?: string
  city?: string
  description?: string
  scope?: string
  term_start?: string
  term_end?: string
  is_active: boolean
  created: string
  updated: string
  // Expand references if loaded
  expand?: {
    representation_members_via_institution_id?: RepresentationMember[]
    representation_documents_via_institution_id?: RepresentationDocument[]
    representation_meetings_via_institution_id?: RepresentationMeeting[]
    representation_topics_via_institution_id?: RepresentationTopic[]
  }
}

export interface RepresentationMember {
  id: string
  institution_id: string
  user_id?: string
  name: string
  email?: string
  role_type: 'Titular' | 'Suplente'
  term_start?: string
  term_end?: string
  commitment_term_signed?: boolean
  commitment_term_file?: string
  appointment_act?: string
  status: 'Ativo' | 'Encerrado' | 'Pendente'
  created: string
  updated: string
  expand?: {
    user_id?: {
      id: string
      name: string
      avatar?: string
      email?: string
    }
  }
}

export interface RepresentationDocument {
  id: string
  institution_id: string
  title: string
  category:
    | 'Legislação'
    | 'Regimento Interno'
    | 'Edital'
    | 'Ato de Nomeação'
    | 'Nota Técnica'
    | 'Outros'
  file?: string
  url?: string
  description?: string
  published_date?: string
  uploaded_by?: string
  created: string
  updated: string
}

export interface RepresentationMeeting {
  id: string
  institution_id: string
  title: string
  meeting_type: 'Ordinária' | 'Extraordinária' | 'Câmara Temática' | 'Grupo de Trabalho'
  meeting_date: string
  location_or_link?: string
  agenda?: string
  minutes_summary?: string
  report_file?: string
  convocacao_file?: string
  ata_file?: string
  decisions?: string
  attendees_count?: number
  created_by?: string
  created: string
  updated: string
}

export interface RepresentationTopic {
  id: string
  institution_id: string
  title: string
  description?: string
  status: 'Em Discussão' | 'Sinalizado ONSV' | 'Orientado ONSV' | 'Concluído'
  attention_flag: boolean
  onsv_guidance?: string
  onsv_guidance_date?: string
  author_id?: string
  decisions_forwarded?: string
  next_discussion_date?: string
  forum_id?: string
  created: string
  updated: string
  expand?: {
    forum_id?: {
      id: string
      code: string
      title: string
      status?: string
      is_active?: boolean
    }
  }
}

export async function getRepresentationInstitutions(): Promise<RepresentationInstitution[]> {
  try {
    const records = await pb
      .collection('representation_institutions')
      .getFullList<RepresentationInstitution>({
        sort: 'name',
        filter: 'is_active = true',
        expand:
          'representation_members_via_institution_id,representation_documents_via_institution_id,representation_meetings_via_institution_id,representation_topics_via_institution_id',
      })
    return records
  } catch (error) {
    console.error('Error fetching representation institutions:', error)
    return []
  }
}

export async function getAllRepresentationInstitutionsAdmin(): Promise<
  RepresentationInstitution[]
> {
  try {
    const records = await pb
      .collection('representation_institutions')
      .getFullList<RepresentationInstitution>({
        sort: 'name',
        expand:
          'representation_members_via_institution_id.user_id,representation_documents_via_institution_id,representation_meetings_via_institution_id,representation_topics_via_institution_id',
      })
    return records
  } catch (error) {
    console.error('Error fetching admin representation institutions:', error)
    return []
  }
}

export async function getRepresentationDetail(
  id: string,
): Promise<RepresentationInstitution | null> {
  try {
    const record = await pb
      .collection('representation_institutions')
      .getOne<RepresentationInstitution>(id, {
        expand:
          'representation_members_via_institution_id.user_id,representation_documents_via_institution_id,representation_meetings_via_institution_id,representation_topics_via_institution_id.forum_id',
      })
    return record
  } catch (error) {
    console.error(`Error fetching representation detail for id ${id}:`, error)
    return null
  }
}

// CRUD Institutions
export async function createInstitution(data: Partial<RepresentationInstitution>) {
  return await pb.collection('representation_institutions').create(data)
}

export async function updateInstitution(id: string, data: Partial<RepresentationInstitution>) {
  return await pb.collection('representation_institutions').update(id, data)
}

export async function deleteInstitution(id: string) {
  return await pb.collection('representation_institutions').delete(id)
}

// Members
export async function getMembersByInstitution(
  institutionId: string,
): Promise<RepresentationMember[]> {
  try {
    return await pb.collection('representation_members').getFullList<RepresentationMember>({
      filter: `institution_id = "${institutionId}"`,
      sort: 'role_type,-created',
      expand: 'user_id',
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    return []
  }
}

export async function createMember(data: FormData | Partial<RepresentationMember>) {
  return await pb.collection('representation_members').create(data)
}

export async function updateMember(id: string, data: FormData | Partial<RepresentationMember>) {
  return await pb.collection('representation_members').update(id, data)
}

export async function deleteMember(id: string) {
  return await pb.collection('representation_members').delete(id)
}

// Documents
export async function getDocumentsByInstitution(
  institutionId: string,
): Promise<RepresentationDocument[]> {
  try {
    return await pb.collection('representation_documents').getFullList<RepresentationDocument>({
      filter: `institution_id = "${institutionId}"`,
      sort: '-published_date,-created',
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return []
  }
}

export async function createDocument(data: FormData | Partial<RepresentationDocument>) {
  return await pb.collection('representation_documents').create(data)
}

export async function updateDocument(id: string, data: FormData | Partial<RepresentationDocument>) {
  return await pb.collection('representation_documents').update(id, data)
}

export async function deleteDocument(id: string) {
  return await pb.collection('representation_documents').delete(id)
}

// Meetings
export async function getMeetingsByInstitution(
  institutionId: string,
): Promise<RepresentationMeeting[]> {
  try {
    return await pb.collection('representation_meetings').getFullList<RepresentationMeeting>({
      filter: `institution_id = "${institutionId}"`,
      sort: '-meeting_date',
    })
  } catch (error) {
    console.error('Error fetching meetings:', error)
    return []
  }
}

export async function createMeeting(data: FormData | Partial<RepresentationMeeting>) {
  return await pb.collection('representation_meetings').create(data)
}

export async function updateMeeting(id: string, data: FormData | Partial<RepresentationMeeting>) {
  return await pb.collection('representation_meetings').update(id, data)
}

export async function deleteMeeting(id: string) {
  return await pb.collection('representation_meetings').delete(id)
}

// Topics / Discussions / Guidance
export async function getTopicsByInstitution(
  institutionId: string,
): Promise<RepresentationTopic[]> {
  try {
    return await pb.collection('representation_topics').getFullList<RepresentationTopic>({
      filter: `institution_id = "${institutionId}"`,
      sort: '-updated',
    })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return []
  }
}

export async function createTopic(data: Partial<RepresentationTopic>) {
  return await pb.collection('representation_topics').create(data)
}

export async function updateTopic(id: string, data: Partial<RepresentationTopic>) {
  return await pb.collection('representation_topics').update(id, data)
}

export async function deleteTopic(id: string) {
  return await pb.collection('representation_topics').delete(id)
}

// Utility helper for file URL
export function getFileUrl(
  record: { collectionId?: string; id: string },
  filename?: string,
): string {
  if (!filename) return '#'
  const collection = record.collectionId || 'representation_documents'
  return `${import.meta.env.VITE_POCKETBASE_URL || ''}/api/files/${collection}/${record.id}/${filename}`
}

// Link/unlink a discussion topic to a Technical Forum (Ajuste 3)
export async function linkTopicToForum(topicId: string, forumId: string | null) {
  return await pb.collection('representation_topics').update(topicId, { forum_id: forumId })
}

// Fetch active forums available for linking (delegates to forums service)
export async function getLinkableForums(): Promise<
  { id: string; code: string; title: string; status?: string }[]
> {
  try {
    return await pb.collection('forums').getFullList({
      sort: 'code',
      filter: 'is_active = true',
    })
  } catch (error) {
    console.error('Error fetching linkable forums:', error)
    return []
  }
}
