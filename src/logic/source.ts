import type { SourceInfo } from '../sources'
import { LocalStorage } from '@raycast/api'
import { sourceInfo } from '../sources'

const STORAGE_KEY = 'source-order'
const ENABLED_SOURCES_KEY = 'enabled-sources'

// 生成按首字母排序的默认顺序
function getAlphabeticalOrder(): string[] {
  return sourceInfo
    .map(source => ({ id: source.id, title: source.title.en }))
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(source => source.id)
}

// 智能合并排序
async function mergeSourceOrder(savedOrder: string[], allSourceIds: string[]): Promise<string[]> {
  const existingOrder = savedOrder.filter(id => allSourceIds.includes(id))
  const newSources = allSourceIds.filter(id => !savedOrder.includes(id))

  // 如果有新增的源
  if (newSources.length > 0) {
    const newSourcesWithTitles = newSources.map((id) => {
      const source = sourceInfo.find(s => s.id === id)
      return { id, title: source?.title.en || id }
    })

    // 新增源按首字母排序后，追加到用户自定义顺序的末尾
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
      // 智能合并：保持现有顺序，新增源根据是否为默认状态决定插入方式
      return await mergeSourceOrder(parsedOrder, allSourceIds)
    }
    catch {
      // 解析失败，返回按首字母排序的默认顺序
      return getAlphabeticalOrder()
    }
  }

  // 首次使用，返回按首字母排序的默认顺序
  return getAlphabeticalOrder()
}

export async function getCustomEnabledSources(): Promise<string[]> {
  const savedEnabledSources = await LocalStorage.getItem<string>(ENABLED_SOURCES_KEY)
  const savedOrder = await LocalStorage.getItem<string>(STORAGE_KEY) // 用于检测新源
  const allSourceIds = sourceInfo.map(s => s.id)

  let enabledSources: string[]
  if (savedEnabledSources) {
    try {
      enabledSources = JSON.parse(savedEnabledSources)
    }
    catch {
      return migrateFromOldPreferences() // 解析失败，回退
    }
  }
  else {
    return migrateFromOldPreferences() // 首次使用
  }

  // 识别并添加新源
  if (savedOrder) {
    try {
      const knownSourceIds: string[] = JSON.parse(savedOrder)
      const newSourceIds = allSourceIds.filter(id => !knownSourceIds.includes(id))

      if (newSourceIds.length > 0) {
        // 将新源添加到启用列表
        return [...enabledSources, ...newSourceIds]
      }
    }
    catch {
      // savedOrder 解析失败，忽略并返回原列表
    }
  }

  return enabledSources
}

function migrateFromOldPreferences(): string[] {
  // 默认全部启用
  const allSourceIds = sourceInfo.map(s => s.id)
  LocalStorage.setItem(ENABLED_SOURCES_KEY, JSON.stringify(allSourceIds))
  return allSourceIds
}

export async function getOrderedEnabledSources(): Promise<SourceInfo[]> {
  // 获取启用的源
  const enabledSourceIds = await getCustomEnabledSources()
  const enabledSources = sourceInfo.filter(source => enabledSourceIds.includes(source.id))

  // 获取智能排序（包含默认首字母排序和新增源的处理）
  const customOrder = await getCustomSourceOrder()
  const orderedSources: SourceInfo[] = []
  const remainingSources = [...enabledSources]

  // 按排序顺序添加启用的源
  for (const sourceId of customOrder) {
    const sourceIndex = remainingSources.findIndex(s => s.id === sourceId)
    if (sourceIndex >= 0) {
      orderedSources.push(remainingSources.splice(sourceIndex, 1)[0])
    }
  }

  // 添加剩余的启用源（理论上不应该有，但作为安全措施）
  return [...orderedSources, ...remainingSources]
}

// 保存源配置
export async function saveSourceConfig(order: string[], enabledSources: string[]): Promise<void> {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  await LocalStorage.setItem(ENABLED_SOURCES_KEY, JSON.stringify(enabledSources))
}

// 重置为默认状态
export async function resetToDefaultState(): Promise<void> {
  await LocalStorage.removeItem(STORAGE_KEY)
  await LocalStorage.removeItem(ENABLED_SOURCES_KEY)
}

// 配置页面专用接口
export interface SourceOrderItem {
  id: string
  title: string
  icon: string | { light: string, dark: string }
  enabled: boolean
}

// 获取分组的源列表（用于配置页面）
export async function getGroupedSourcesForConfig(lang: 'en' | 'zh'): Promise<{
  enabled: SourceOrderItem[]
  disabled: SourceOrderItem[]
}> {
  const enabledSourceIds = await getCustomEnabledSources()
  const customOrder = await getCustomSourceOrder()

  // 构建所有源的信息
  const allSources = sourceInfo.map(source => ({
    id: source.id,
    title: source.title[lang],
    icon: source.icon,
    enabled: enabledSourceIds.includes(source.id),
  }))

  // 分离启用和禁用的源
  const enabledSources: SourceOrderItem[] = []
  const disabledSources: SourceOrderItem[] = []

  // 按自定义顺序排列启用的源
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

  // 处理可能遗漏的源
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

  // 禁用的源按首字母排序
  disabledSources.sort((a, b) => a.title.localeCompare(b.title))

  return {
    enabled: enabledSources,
    disabled: disabledSources,
  }
}

// 智能切换源状态
export function toggleSourceInGroup(
  sourceId: string,
  groupedSources: { enabled: SourceOrderItem[], disabled: SourceOrderItem[] },
): { enabled: SourceOrderItem[], disabled: SourceOrderItem[] } {
  const { enabled, disabled } = groupedSources

  // 查找源在哪个组
  const enabledIndex = enabled.findIndex(s => s.id === sourceId)
  const disabledIndex = disabled.findIndex(s => s.id === sourceId)

  if (enabledIndex >= 0) {
    // 从启用组移到禁用组，但保持在当前位置（等待用户下次进入才重新分组）
    const source = { ...enabled[enabledIndex], enabled: false }
    const newEnabled = [...enabled]
    newEnabled[enabledIndex] = source

    return {
      enabled: newEnabled,
      disabled: [...disabled],
    }
  }
  else if (disabledIndex >= 0) {
    // 从禁用组移到启用组的末尾
    const source = { ...disabled[disabledIndex], enabled: true }
    const newDisabled = disabled.filter((_, index) => index !== disabledIndex)

    return {
      enabled: [...enabled, source],
      disabled: newDisabled,
    }
  }

  return groupedSources
}
