import pb from '@/lib/pocketbase/client'

export const getCertificateTemplates = () => pb.collection('certificate_templates').getFullList()

export const createCertificateTemplate = (data: FormData) =>
  pb.collection('certificate_templates').create(data)

export const updateCertificateTemplate = (id: string, data: FormData) =>
  pb.collection('certificate_templates').update(id, data)

export const deleteCertificateTemplate = (id: string) =>
  pb.collection('certificate_templates').delete(id)

export const downloadCertificate = async (level: string) => {
  const token = pb.authStore.token
  const response = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/certificates/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ level }),
    },
  )

  if (!response.ok) {
    throw new Error('Falha ao gerar certificado')
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Certificado_${level.replace(/\s+/g, '_')}.pdf`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export const emailCertificate = async (level: string) => {
  return pb.send('/backend/v1/certificates/email', {
    method: 'POST',
    body: JSON.stringify({ level }),
    headers: { 'Content-Type': 'application/json' },
  })
}
