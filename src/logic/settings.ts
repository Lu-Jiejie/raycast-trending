import type { ServiceConfig } from '../services/definitions'
import { getPreferenceValues } from '@raycast/api'
import { serviceDefinitions } from '../services/definitions'

interface Preferences {
  primaryService: string
  [key: string]: boolean | string
}

export function getEnabledServices(): ServiceConfig[] {
  const preferences = getPreferenceValues<Preferences>()
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
