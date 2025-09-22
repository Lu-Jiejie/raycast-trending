import type { SourceInfo, SourceType } from '../config/sourceInfo'
import { useEffect, useState } from 'react'
import { getOrderedEnabledSources } from '../logic/source'

/**
 * Custom hook to manage source state
 * Handles source list loading, default source selection and state maintenance
 */
export function useSourceState(defaultSource?: SourceType) {
  const [enabledSources, setEnabledSources] = useState<SourceInfo[]>([])
  const [trendingType, setSourceType] = useState<SourceType | undefined>(defaultSource)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load enabled source list
  useEffect(() => {
    async function loadOrderedSources() {
      setIsLoading(true)
      try {
        const orderedSources = await getOrderedEnabledSources()
        setEnabledSources(orderedSources)

        // Only set trendingType during first load or when defaultSource explicitly changes
        if (!isInitialized) {
          // If default source is provided, use it
          if (defaultSource) {
            setSourceType(defaultSource)
          }
          // Otherwise use the first available source
          else if (orderedSources.length > 0) {
            setSourceType(orderedSources[0].id)
          }
          setIsInitialized(true)
        }
      }
      finally {
        setIsLoading(false)
      }
    }

    loadOrderedSources()
  }, [defaultSource, isInitialized])

  // Refresh source list
  const refreshSources = async () => {
    setIsLoading(true)
    try {
      const orderedSources = await getOrderedEnabledSources()
      setEnabledSources(orderedSources)

      // Check if current source is still available
      if (trendingType && !orderedSources.some(s => s.id === trendingType) && orderedSources.length > 0) {
        setSourceType(orderedSources[0].id)
      }
    }
    finally {
      setIsLoading(false)
    }
  }

  return {
    enabledSources,
    trendingType,
    setSourceType,
    isLoading,
    refreshSources,
  }
}
