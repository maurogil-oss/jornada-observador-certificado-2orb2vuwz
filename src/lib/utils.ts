import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a string by removing diacritics and converting to lowercase
 */
export function normalizeString(str: string): string {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Determines the certificate level index for a user
 * Returns -1 if not eligible, 0 for Nível I, 1 for Nível II, 2 for Nível III
 */
export function getUserLevelIndex(user: any): number {
  if (!user) return -1
  const lvl = user.level || ''
  const normLvl = normalizeString(lvl)

  let index = -1
  if (normLvl.includes('nivel iii') || normLvl.includes('mobilizador')) index = 2
  else if (normLvl.includes('nivel ii') || normLvl.includes('multiplicador')) index = 1
  else if (normLvl.includes('nivel i') || normLvl.includes('local')) index = 0

  // Turma 15 default to at least Nível I
  if (user.turma === 15 || user.turma === '15') {
    index = Math.max(index, 0)
  }

  return index
}

/**
 * Converts a string to Title Case (e.g., "PEDRO SILVA" -> "Pedro Silva")
 * Handles extra spaces and lowercase prepositions.
 */
export function toTitleCase(str: string): string {
  if (!str) return ''
  const lowercaseWords = ['da', 'de', 'di', 'do', 'du', 'das', 'dos', 'e']
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index > 0 && lowercaseWords.includes(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

/**
 * Exports an array of objects to a CSV file and triggers download
 */
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0]).join(',')
  const rows = data.map((row) =>
    Object.values(row)
      .map((val) => `"${String(val).replace(/"/g, '""')}"`)
      .join(','),
  )

  const csvContent = [headers, ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
