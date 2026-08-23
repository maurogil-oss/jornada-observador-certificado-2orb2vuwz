import { useEffect, useRef } from 'react'
import type { RecordModel, RecordSubscription } from 'pocketbase'

import pb from '@/lib/pocketbase/client'

/**
 * Hook for real-time subscriptions to a PocketBase collection.
 * ALWAYS use this hook instead of subscribing inline.
 * Uses the per-listener UnsubscribeFunc so multiple components
 * can safely subscribe to the same collection without conflicts.
 *
 * Generic over the record type: pass your collection's interface as
 * `useRealtime<MyRecord>(...)` to get a typed subscription payload
 * instead of `unknown`.
 */
export function useRealtime<TRecord extends RecordModel = RecordModel>(
  collectionName: string,
  callback: (data: RecordSubscription<TRecord>) => void,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    let unsubscribeFn: (() => Promise<void>) | undefined
    let cancelled = false
    let retryTimeout: ReturnType<typeof setTimeout> | undefined
    let retryCount = 0
    const maxRetries = 5
    const baseDelayMs = 1500
    const maxDelayMs = 30000

    const subscribeWithRetry = () => {
      if (cancelled) return

      pb.collection<TRecord>(collectionName)
        .subscribe('*', (e) => {
          try {
            callbackRef.current(e)
          } catch (cbErr) {
            console.warn(
              `[useRealtime] Error in event callback for collection "${collectionName}":`,
              cbErr,
            )
          }
        })
        .then((fn) => {
          if (cancelled) {
            fn().catch(() => {})
          } else {
            unsubscribeFn = fn
            retryCount = 0 // reset counter on successful subscription
          }
        })
        .catch((err) => {
          // Silent fallback: do not crash UI or block normal operation
          if (cancelled) return

          if (retryCount < maxRetries) {
            const delay = Math.min(
              baseDelayMs * Math.pow(2, retryCount) + Math.random() * 500,
              maxDelayMs,
            )
            retryCount++
            console.warn(
              `[useRealtime] Realtime subscription failed for "${collectionName}". Retrying in ${Math.round(delay)}ms (attempt ${retryCount}/${maxRetries}):`,
              err?.message || err,
            )
            retryTimeout = setTimeout(subscribeWithRetry, delay)
          } else {
            console.warn(
              `[useRealtime] Realtime subscription failed for "${collectionName}". Falling back to static data.`,
            )
          }
        })
    }

    subscribeWithRetry()

    return () => {
      cancelled = true
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
      if (unsubscribeFn) {
        unsubscribeFn().catch(() => {})
      }
    }
  }, [collectionName, enabled])
}

export default useRealtime
