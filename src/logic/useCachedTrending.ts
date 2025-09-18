import { useCachedState } from '@raycast/utils'
import { useMemo, useState } from 'react'

export function useCachedTrending<T>(
  cacheKey: string,
  handler: () => Promise<T>,
  ttl: number = 1000 * 60 * 30, // default 30 minutes
) {
  const [cache, setCache] = useCachedState<{
    data: T | null
    timestamp: number
  }>(cacheKey, { data: null, timestamp: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async (force = false) => {
    if (!force && cache.data && Date.now() - cache.timestamp <= ttl) {
      console.log(`[${cacheKey}] Using cached data`)
      return
    }
    setIsLoading(true)
    setError(null)

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
  refresh()

  const data = useMemo(() => cache.data, [cache.data])

  return { data, refresh, isLoading, error }
}
