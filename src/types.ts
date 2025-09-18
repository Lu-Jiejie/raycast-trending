export type TrendingType
  = 'bilibili-hot-search'
    | 'bilibili-hot-video'
    | 'bilibili-ranking'
    | 'tieba-hot-search'

export interface TopicItem {
  id: string
  title: string
  url: string
  type: TrendingType
  description?: string
  date?: string
  extra?: Record<string, any>
}
