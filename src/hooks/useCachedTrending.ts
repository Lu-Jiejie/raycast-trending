import type { TopicItem } from '../types'
import { useCachedState } from '@raycast/utils'
import { useEffect, useMemo, useState } from 'react'

export function useCachedTrending(
  cacheKey: string,
  handler: () => Promise<TopicItem[]>,
  ttl: number = 1000 * 60 * 30, // default 30 minutes
) {
  const [cache, setCache] = useCachedState<{
    data: TopicItem[] | null
    timestamp: number
  }>(cacheKey, { data: null, timestamp: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async (force = false) => {
    if (!force && cache.data && Date.now() - cache.timestamp <= ttl) {
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
