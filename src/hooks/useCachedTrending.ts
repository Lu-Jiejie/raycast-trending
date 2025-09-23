import type { SourceType } from '../config/sourceInfo'
import type { HookReturnType, TrendingItem } from '../types'
import { getPreferenceValues } from '@raycast/api'
import { useCachedState } from '@raycast/utils'
import { useEffect, useMemo, useState } from 'react'

const minTTL = 1000 * 10 // minimum 10 seconds

export function useCachedTrending(
  cacheKey: SourceType,
  handler: () => Promise<TrendingItem[]>,
): HookReturnType {
  const preferences = getPreferenceValues<Preferences>()
  const ttl = +(preferences.ttl) * 60 * 1000 || 5 * 60 * 1000

  const [cache, setCache] = useCachedState<{
    data: TrendingItem[] | null
    timestamp: number
  }>(cacheKey, { data: null, timestamp: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async (force = false) => {
    // console.log(`[${cacheKey}] Refreshing...`)
    // console.log(force, Date.now() - cache.timestamp, ttl, minTTL)
    if (
      (force && Date.now() - cache.timestamp < minTTL)
      || (!force && cache.data && Date.now() - cache.timestamp <= ttl)
    ) {
      // console.log(`[${cacheKey}] Using cached data`)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    // setCache({ data: null, timestamp: Date.now() })
    try {
      const data = await handler()
      setCache({ data, timestamp: Date.now() })
    }
    catch (err) {
      setError(err as Error)
      console.error(`[${cacheKey}] Error:`, err)
    }
    finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [cacheKey])

  const data = useMemo(() => cache.data, [cache.data])

  return { data, refresh, isLoading, error, timestamp: cache.timestamp }
}
