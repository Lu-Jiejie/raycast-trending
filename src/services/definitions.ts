export const serviceDefinitions = [
  {
    id: 'bilibili-hot-search',
    title: 'Bilibili (Hot Search)',
  },
  {
    id: 'bilibili-hot-video',
    title: 'Bilibili (Hot Video)',
  },
  {
    id: 'bilibili-ranking',
    title: 'Bilibili (Ranking)',
  },
  {
    id: 'tieba-hot-topic',
    title: 'Tieba (Hot Topic)',
  },
  {
    id: 'douyin-hot-search',
    title: 'Douyin (Hot Search)',
  },
] as const

export type TrendingType = typeof serviceDefinitions[number]['id']
export type ServiceConfig = typeof serviceDefinitions[number]
