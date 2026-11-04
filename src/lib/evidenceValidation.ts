/**
 * Validação client-side compartilhada dos arquivos anexados como evidência.
 * Garante que TODAS as telas de envio exibam a MESMA regra e a MESMA mensagem
 * específica (formato / tamanho / arquivo vazio) — nunca um aviso genérico
 * de "legibilidade".
 */

/** Extensões aceitas — devem permanecer idênticas às mimeTypes do campo `file`
 *  da coleção `submissions` (migração 0142) e ao hook on_submission_create. */
export const ACCEPTED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'doc', 'docx'] as const

/** Limite de tamanho do campo `file` da coleção `submissions` (20 MB). */
export const MAX_EVIDENCE_FILE_SIZE = 20 * 1024 * 1024

/** Rótulo legível dos formatos aceitos, para uso em textos da interface. */
export const ACCEPTED_EXTENSIONS_LABEL = 'PDF, PNG, JPG, JPEG, WEBP, DOC ou DOCX'

export interface EvidenceFileValidation {
  /** null = arquivo válido; caso contrário, motivo específico da reprovação. */
  reason: null | {
    kind: 'empty' | 'format' | 'size'
    title: string
    message: string
  }
}

export function validateEvidenceFile(file: File): EvidenceFileValidation['reason'] {
  if (file.size === 0) {
    return {
      kind: 'empty',
      title: 'Arquivo vazio',
      message: `O arquivo "${file.name}" não possui conteúdo. Gere novamente o documento e tente enviar outro arquivo.`,
    }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ACCEPTED_EXTENSIONS.includes(ext as (typeof ACCEPTED_EXTENSIONS)[number])) {
    return {
      kind: 'format',
      title: 'Formato não suportado',
      message: `O arquivo "${file.name}" está no formato .${
        ext || 'desconhecido'
      }, que não é aceito. Envie um documento em ${ACCEPTED_EXTENSIONS_LABEL} (até 20 MB).`,
    }
  }

  if (file.size > MAX_EVIDENCE_FILE_SIZE) {
    return {
      kind: 'size',
      title: 'Arquivo muito grande',
      message: `O arquivo "${file.name}" tem ${(file.size / (1024 * 1024)).toFixed(
        1,
      )} MB e ultrapassa o limite de 20 MB. Compacte-o ou envie um documento menor.`,
    }
  }

  return null
}

/** Mensagem amigável para erros retornados pelo PocketBase no create/update de submissões. */
export function describeSubmissionError(error: unknown): string {
  const anyErr = error as any
  const data = anyErr?.response?.data
  const fieldMessages: string[] = []
  if (data && typeof data === 'object') {
    for (const value of Object.values(data)) {
      const v = value as any
      if (v && typeof v === 'object' && typeof v.message === 'string') {
        fieldMessages.push(v.message)
      }
    }
  }

  if (fieldMessages.length > 0) {
    return `Não foi possível enviar a evidência: ${fieldMessages.join(' ')}`
  }

  const rawMessage = typeof anyErr?.message === 'string' ? anyErr.message : ''
  if (rawMessage) {
    return `Não foi possível enviar a evidência: ${rawMessage}`
  }

  return (
    'Não foi possível enviar a evidência. Verifique o formato do arquivo (' +
    ACCEPTED_EXTENSIONS_LABEL +
    '), o tamanho (até 20 MB) e tente novamente.'
  )
}
