import pb from '@/lib/pocketbase/client'
import { generateCertificate } from '@/lib/certificate'

export const getCertificateTemplates = () => pb.collection('certificate_templates').getFullList()

export const createCertificateTemplate = (data: FormData) =>
  pb.collection('certificate_templates').create(data)

export const updateCertificateTemplate = (id: string, data: FormData) =>
  pb.collection('certificate_templates').update(id, data)

export const deleteCertificateTemplate = (id: string) =>
  pb.collection('certificate_templates').delete(id)

export const downloadCertificate = async (level: string) => {
  return generateCertificate(level)
}
