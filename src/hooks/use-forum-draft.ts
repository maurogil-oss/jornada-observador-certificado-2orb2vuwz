import { useState, useEffect, useRef, useCallback } from 'react'

const SAVE_DELAY = 2000
const INDICATOR_DURATION = 3000

export function useForumDraft(key: string) {
  const [content, setContent] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const indicatorRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) setContent(saved)
    } catch {
      // ignore
    }
  }, [key])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (indicatorRef.current) clearTimeout(indicatorRef.current)
    }
  }, [])

  const updateContent = useCallback(
    (value: string) => {
      setContent(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        try {
          if (value.trim()) {
            localStorage.setItem(key, value)
          } else {
            localStorage.removeItem(key)
          }
          setShowSaved(true)
          if (indicatorRef.current) clearTimeout(indicatorRef.current)
          indicatorRef.current = setTimeout(() => setShowSaved(false), INDICATOR_DURATION)
        } catch {
          // ignore
        }
      }, SAVE_DELAY)
    },
    [key],
  )

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
    setContent('')
    setShowSaved(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (indicatorRef.current) clearTimeout(indicatorRef.current)
  }, [key])

  return { content, updateContent, clearDraft, showSaved }
}
