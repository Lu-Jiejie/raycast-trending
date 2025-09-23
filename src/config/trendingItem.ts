import type { List } from '@raycast/api'
import type { TrendingItem } from '../types'
import type { SourceType } from './sourceInfo'
import { getPreferenceValues, Icon, Image } from '@raycast/api'
import { TagColor } from '../types'

const preferences = getPreferenceValues<Preferences>()
const lang = preferences.lang || 'en'

interface ItemProcessor {
  getAccessories?: (item: TrendingItem) => List.Item.Accessory[]
  getSubtitle?: (item: TrendingItem) => string | undefined
}

function formatCompactNumber(number: number) {
  const langCode = lang === 'en' ? 'en-US' : 'zh-CN'
  return new Intl.NumberFormat(langCode, { notation: 'compact' }).format(number)
}

function formatDate(date: string | number) {
  const d = new Date(date)
  return d.toISOString().replace('T', ' ').slice(0, 16)
}

export function getDefaultTag(item: TrendingItem): List.Item.Accessory[] {
  const accessories: List.Item.Accessory[] = []
  if (item?.tag && item.tag?.value) {
    accessories.push({ tag: { value: item.tag.value, color: item.tag.color || TagColor.Yellow } })
  }
  return accessories
}

/**
 * Define per-source item processors or subtitle
 */
const sourceConfigs: [SourceType | SourceType[], ItemProcessor][] = [
  [
    ['bilibili-hot-video', 'bilibili-ranking'],
    {
      getAccessories: item => [
        { icon: { source: item.extra?.ownerFace, mask: Image.Mask.RoundedRectangle }, text: item.extra?.owner },
        { icon: Icon.Play, text: formatCompactNumber(item.extra?.view || 0) },
      ],
    },
  ],
  [
    ['douyin-hot-search', 'weibo-hot-search', 'zhihu-hot-topic'],
    {
      getAccessories: item => [
        { icon: Icon.LineChart, text: formatCompactNumber(item.extra?.hotValue || 0) },
      ],
    },
  ],
  [
    'tieba-hot-topic',
    {
      getAccessories: item => [
        { icon: Icon.Message, text: formatCompactNumber(item.extra?.discuss || 0) },
      ],
    },
  ],
  [
    'thepaper-hot-news',
    {
      getAccessories: item => [
        { icon: Icon.ThumbsUp, text: formatCompactNumber(item.extra?.praiseCount || 0) },
        { text: formatDate(item.extra?.publishTime) },
      ],
    },
  ],
  [
    'juejin-hot-post',
    {
      getAccessories: item => [
        { icon: { source: item.extra?.authorAvatar, mask: Image.Mask.RoundedRectangle }, text: item.extra?.author },
        { icon: Icon.LineChart, text: formatCompactNumber(item.extra?.hotValue || 0) },
      ],
    },
  ],
  [
    'github-trending-today',
    {
      getAccessories: item => [
        { icon: item.extra?.language ? { source: Icon.CircleFilled, tintColor: item.extra?.languageColor } : undefined, text: item.extra?.language },
        { icon: Icon.Star, text: formatCompactNumber(item.extra?.starCount) },
      ],
      getSubtitle: item => item.extra?.owner,
    },
  ],
  [
    'douban-new-movie',
    {
      getAccessories: item => [
        { icon: Icon.Star, text: item.extra?.ratingNum || 'N/A' },
        { icon: Icon.Message, text: item.extra?.ratingPeople || 'N/A' },
      ],
    },
  ],
]

export const sourceItemProcessors: Record<SourceType, ItemProcessor> = {} as Record<SourceType, ItemProcessor>

sourceConfigs.forEach(([sourceTypes, processor]) => {
  if (typeof sourceTypes === 'string') {
    sourceItemProcessors[sourceTypes] = processor
  }
  else if (Array.isArray(sourceTypes)) {
    sourceTypes.forEach((sourceType) => {
      sourceItemProcessors[sourceType] = processor
    })
  }
})

export function getSourceItemProcessor(sourceType: SourceType): ItemProcessor {
  return sourceItemProcessors[sourceType] || {}
}

export function getFullAccessories(item: TrendingItem, trendingType: SourceType): List.Item.Accessory[] {
  const defaultAccessories = getDefaultTag(item)
  const processor = getSourceItemProcessor(trendingType)

  if (!processor.getAccessories) {
    return defaultAccessories
  }

  const sourceAccessories = processor.getAccessories(item)
  return [...defaultAccessories, ...sourceAccessories]
}

export function getItemSubtitle(item: TrendingItem, trendingType: SourceType): string | undefined {
  const processor = getSourceItemProcessor(trendingType)
  return processor.getSubtitle ? processor.getSubtitle(item) : undefined
}
