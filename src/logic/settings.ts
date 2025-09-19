import type { ServiceConfig } from '../services/definitions'
import { getPreferenceValues } from '@raycast/api'
import { serviceDefinitions } from '../services/definitions'

const preferences = getPreferenceValues<Preferences>()

export function getEnabledServices(): ServiceConfig[] {
  const enabledServices = serviceDefinitions.filter(
    service => preferences[`show-${service.id}`],
  )

  const primaryServiceId = preferences.primaryService
  if (primaryServiceId && primaryServiceId !== 'default') {
    const primaryService = enabledServices.find(
      service => service.id === primaryServiceId,
    )
    if (primaryService) {
      return [
        primaryService,
        ...enabledServices.filter(service => service.id !== primaryServiceId),
      ]
    }
  }

  return enabledServices
}

export const settings = {
  enabledServices: getEnabledServices(),
  ttl: +(preferences.ttl) * 60 * 1000 || 5 * 60 * 1000,
  lang: preferences.lang || 'en',
}
