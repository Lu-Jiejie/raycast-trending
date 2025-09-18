import type { TrendingType } from './services'

export interface TopicItem {
  id: string
  title: string
  url: string
  type: TrendingType
  description?: string
  date?: string
  extra?: Record<string, any>
}

export { TrendingType }
