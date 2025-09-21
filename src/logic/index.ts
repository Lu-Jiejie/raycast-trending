import type { SourceInfo } from '../sources'
import { getPreferenceValues } from '@raycast/api'
import { sourceInfo } from '../sources'

export function getEnabledSources(): SourceInfo[] {
  const preferences = getPreferenceValues<Preferences>()

  const enabledSources = sourceInfo.filter(
    source => preferences[`show-${source.id}`],
  )

  const primarySourceId = preferences.primarySource
  if (primarySourceId) {
    const primarySource = enabledSources.find(
      source => source.id === primarySourceId,
    )
    if (primarySource) {
      return [
        primarySource,
        ...enabledSources.filter(source => source.id !== primarySourceId),
      ]
    }
  }

  return enabledSources
}
