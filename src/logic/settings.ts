import type { SourceInfo } from '../sources'
import { getPreferenceValues } from '@raycast/api'
import { sourceInfo } from '../sources'

const preferences = getPreferenceValues<Preferences>()

export function getEnabledSources(): SourceInfo[] {
  const enabledSources = sourceInfo.filter(
    source => preferences[`show-${source.id}`],
  )
  console.log(enabledSources)
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

export const settings = {
  enabledSources: getEnabledSources(),
  ttl: +(preferences.ttl) * 60 * 1000 || 5 * 60 * 1000,
  lang: preferences.lang || 'en',
  primarySource: preferences.primarySource,
}
