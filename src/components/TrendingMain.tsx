import type { SourceInfo, SourceType } from '../sources'
import {
  List,
} from '@raycast/api'
import { useEffect, useRef, useState } from 'react'
import { getOrderedEnabledSources } from '../logic/source'
import TrendingChild from './TrendingChild'

export default function TrendingMain({
  defaultSource,
}: {
  defaultSource?: SourceType
} = {}) {
  const [enabledSources, setEnabledSources] = useState<SourceInfo[]>([])
  const [trendingType, setSourceType] = useState<SourceType | undefined>(defaultSource)
  // Flag to track initialization state to prevent infinite loops
  const initialized = useRef(false)

  // Load ordered source list
  useEffect(() => {
    async function loadOrderedSources() {
      const orderedSources = await getOrderedEnabledSources()
      setEnabledSources(orderedSources)

      // Only set trendingType during first load or when defaultSource explicitly changes
      if (!initialized.current) {
        // If default source is provided, use it
        if (defaultSource) {
          setSourceType(defaultSource)
        }
        // Otherwise use the first available source
        else if (orderedSources.length > 0) {
          setSourceType(orderedSources[0].id)
        }
        initialized.current = true
      }
    }

    loadOrderedSources()
  }, [defaultSource])

  if (!trendingType) {
    return <List isLoading />
  }

  return (
    <TrendingChild
      trendingType={trendingType}
      enabledSources={enabledSources}
      setSourceType={setSourceType}
    />
  )
}
