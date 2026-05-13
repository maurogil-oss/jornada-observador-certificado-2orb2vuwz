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
