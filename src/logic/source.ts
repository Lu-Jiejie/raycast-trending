import type { SourceInfo } from '../sources'
import type { SourceOrderItem } from '../types'
import { LocalStorage } from '@raycast/api'
import { sourceInfo } from '../sources'

const STORAGE_KEY = 'source-order'
const ENABLED_SOURCES_KEY = 'enabled-sources'

function getAlphabeticalOrder(): string[] {
  return sourceInfo
    .map(source => ({ id: source.id, title: source.title.en }))
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(source => source.id)
}

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

function migrateFromOldPreferences(): string[] {
  // ena
  const allSourceIds = sourceInfo.map(s => s.id)
  LocalStorage.setItem(ENABLED_SOURCES_KEY, JSON.stringify(allSourceIds))
  return allSourceIds
}

export async function getOrderedEnabledSources(): Promise<SourceInfo[]> {
  const enabledSourceIds = await getCustomEnabledSources()
  const enabledSources = sourceInfo.filter(source => enabledSourceIds.includes(source.id))

  const customOrder = await getCustomSourceOrder()
  const orderedSources: SourceInfo[] = []
  const remainingSources = [...enabledSources]

  for (const sourceId of customOrder) {
    const sourceIndex = remainingSources.findIndex(s => s.id === sourceId)
    if (sourceIndex >= 0) {
      orderedSources.push(remainingSources.splice(sourceIndex, 1)[0])
    }
  }

  return [...orderedSources, ...remainingSources]
}

export async function saveSourceConfig(order: string[], enabledSources: string[]): Promise<void> {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  await LocalStorage.setItem(ENABLED_SOURCES_KEY, JSON.stringify(enabledSources))
}

export async function resetToDefaultState(): Promise<void> {
  await LocalStorage.removeItem(STORAGE_KEY)
  await LocalStorage.removeItem(ENABLED_SOURCES_KEY)
}

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

export function toggleSourceInGroup(
  sourceId: string,
  groupedSources: { enabled: SourceOrderItem[], disabled: SourceOrderItem[] },
): { enabled: SourceOrderItem[], disabled: SourceOrderItem[] } {
  const { enabled, disabled } = groupedSources

  const enabledIndex = enabled.findIndex(s => s.id === sourceId)
  const disabledIndex = disabled.findIndex(s => s.id === sourceId)

  if (enabledIndex >= 0) {
    const source = { ...enabled[enabledIndex], enabled: false }
    const newEnabled = [...enabled]
    newEnabled[enabledIndex] = source

    return {
      enabled: newEnabled,
      disabled: [...disabled],
    }
  }
  else if (disabledIndex >= 0) {
    const source = { ...disabled[disabledIndex], enabled: true }
    const newDisabled = disabled.filter((_, index) => index !== disabledIndex)

    return {
      enabled: [...enabled, source],
      disabled: newDisabled,
    }
  }

  return groupedSources
}
