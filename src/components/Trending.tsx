import type { SourceType } from '../config/sourceInfo'
import { List } from '@raycast/api'
import { useSourceState } from '../hooks/useSourceState'
import TrendingChild from './TrendingMain'

/**
 * Main trending content component
 * Responsible for managing source state and rendering the TrendingChild component
 */
export default function TrendingMain({
  defaultSource,
}: {
  defaultSource?: SourceType
} = {}) {
  // Use custom hook to manage source state
  const {
    enabledSources,
    trendingType,
    setSourceType,
    isLoading,
  } = useSourceState(defaultSource)

  // Wait for source selection to complete
  if (!trendingType) {
    return <List isLoading={isLoading} />
  }

  return (
    <TrendingChild
      trendingType={trendingType}
      enabledSources={enabledSources}
      setSourceType={setSourceType}
    />
  )
}
