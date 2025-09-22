import type { SourceInfo } from '../sources'
import type { SourceOrderItem } from '../types'
import { LocalStorage } from '@raycast/api'
import { sourceInfo } from '../sources'

const STORAGE_KEY = 'source-order'
const ENABLED_SOURCES_KEY = 'enabled-sources'

// Get sources in alphabetical order as default fallback
function getAlphabeticalOrder(): string[] {
  return sourceInfo
    .map(source => ({ id: source.id, title: source.title.en }))
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(source => source.id)
}

// Merge saved order with any new sources that might have been added
async function mergeSourceOrder(savedOrder: string[], allSourceIds: string[]): Promise<string[]> {
  const existingOrder = savedOrder.filter(id => allSourceIds.includes(id))
  const newSources = allSourceIds.filter(id => !savedOrder.includes(id))

  // If there are new sources, append them sorted alphabetically
  if (newSources.length > 0) {
    const newSourcesWithTitles = newSources.map((id) => {
      const source = sourceInfo.find(s => s.id === id)
      return { id, title: source?.title.en || id }
    })

    const sortedNewSources = newSourcesWithTitles
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(s => s.id)
    return [...existingOrder, ...sortedNewSources]
  }

  return existingOrder
}

// Get user's custom source order or default to alphabetical
export async function getCustomSourceOrder(): Promise<string[]> {
  const savedOrder = await LocalStorage.getItem<string>(STORAGE_KEY)
  const allSourceIds = sourceInfo.map(s => s.id)

  if (savedOrder) {
    try {
      const parsedOrder = JSON.parse(savedOrder)
      return await mergeSourceOrder(parsedOrder, allSourceIds)
    }
    catch {
      return getAlphabeticalOrder()
    }
  }

  return getAlphabeticalOrder()
}

// Get list of sources enabled by the user
export async function getCustomEnabledSources(): Promise<string[]> {
  const savedEnabledSources = await LocalStorage.getItem<string>(ENABLED_SOURCES_KEY)
  const savedOrder = await LocalStorage.getItem<string>(STORAGE_KEY)
  const allSourceIds = sourceInfo.map(s => s.id)

  let enabledSources: string[]
  if (savedEnabledSources) {
    try {
      enabledSources = JSON.parse(savedEnabledSources)
    }
    catch {
      return migrateFromOldPreferences()
    }
  }
  else {
    return migrateFromOldPreferences()
  }

  // Add any new sources that weren't previously known
  if (savedOrder) {
    try {
      const knownSourceIds: string[] = JSON.parse(savedOrder)
      const newSourceIds = allSourceIds.filter(id => !knownSourceIds.includes(id))

      if (newSourceIds.length > 0) {
        return [...enabledSources, ...newSourceIds]
      }
    }
    catch {
    }
  }

  return enabledSources
}

// Migration helper for first-time setup or after data corruption
function migrateFromOldPreferences(): string[] {
  // Enable all sources by default on first run
  const allSourceIds = sourceInfo.map(s => s.id)
  LocalStorage.setItem(ENABLED_SOURCES_KEY, JSON.stringify(allSourceIds))
  return allSourceIds
}

// Get sources in user's preferred order, filtered to only enabled ones
export async function getOrderedEnabledSources(): Promise<SourceInfo[]> {
  const enabledSourceIds = await getCustomEnabledSources()
  const enabledSources = sourceInfo.filter(source => enabledSourceIds.includes(source.id))

  const customOrder = await getCustomSourceOrder()
  const orderedSources: SourceInfo[] = []
  const remainingSources = [...enabledSources]

  // Arrange sources according to user's custom order
  for (const sourceId of customOrder) {
    const sourceIndex = remainingSources.findIndex(s => s.id === sourceId)
    if (sourceIndex >= 0) {
      orderedSources.push(remainingSources.splice(sourceIndex, 1)[0])
    }
  }

  return [...orderedSources, ...remainingSources]
}

// Save user's source configuration to persistent storage
export async function saveSourceConfig(order: string[], enabledSources: string[]): Promise<void> {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  await LocalStorage.setItem(ENABLED_SOURCES_KEY, JSON.stringify(enabledSources))
}

// Reset source configuration to default state
export async function resetToDefaultState(): Promise<void> {
  await LocalStorage.removeItem(STORAGE_KEY)
  await LocalStorage.removeItem(ENABLED_SOURCES_KEY)
}

// Group sources into enabled and disabled categories for configuration UI
export async function getGroupedSourcesForConfig(lang: 'en' | 'zh'): Promise<{
  enabled: SourceOrderItem[]
  disabled: SourceOrderItem[]
}> {
  const enabledSourceIds = await getCustomEnabledSources()
  const customOrder = await getCustomSourceOrder()

  const allSources = sourceInfo.map(source => ({
    id: source.id,
    title: source.title[lang],
    icon: source.icon,
    enabled: enabledSourceIds.includes(source.id),
  }))

  const enabledSources: SourceOrderItem[] = []
  const disabledSources: SourceOrderItem[] = []

  // First process sources in custom order
  for (const sourceId of customOrder) {
    const source = allSources.find(s => s.id === sourceId)
    if (source) {
      if (source.enabled) {
        enabledSources.push(source)
      }
      else {
        disabledSources.push(source)
      }
    }
  }

  // Then handle any sources not in the custom order
  const processedIds = new Set([...enabledSources.map(s => s.id), ...disabledSources.map(s => s.id)])
  const remainingSources = allSources.filter(s => !processedIds.has(s.id))

  for (const source of remainingSources) {
    if (source.enabled) {
      enabledSources.push(source)
    }
    else {
      disabledSources.push(source)
    }
  }

  disabledSources.sort((a, b) => a.title.localeCompare(b.title))

  return {
    enabled: enabledSources,
    disabled: disabledSources,
  }
}

// Toggle a source between enabled and disabled states without moving it
// This allows users to change their mind before saving
export function toggleSourceInGroup(
  sourceId: string,
  groupedSources: { enabled: SourceOrderItem[], disabled: SourceOrderItem[] },
): { enabled: SourceOrderItem[], disabled: SourceOrderItem[] } {
  const { enabled, disabled } = groupedSources

  const enabledIndex = enabled.findIndex(s => s.id === sourceId)
  const disabledIndex = disabled.findIndex(s => s.id === sourceId)

  if (enabledIndex >= 0) {
    // When disabling a source, just toggle its enabled state but keep it in the same array
    const newEnabled = [...enabled]
    newEnabled[enabledIndex] = { ...enabled[enabledIndex], enabled: false }

    return {
      enabled: newEnabled,
      disabled,
    }
  }
  else if (disabledIndex >= 0) {
    // When enabling a source, just toggle its enabled state but keep it in the same array
    const newDisabled = [...disabled]
    newDisabled[disabledIndex] = { ...disabled[disabledIndex], enabled: true }

    return {
      enabled,
      disabled: newDisabled,
    }
  }

  return groupedSources
}
