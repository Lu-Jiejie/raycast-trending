import { kebabToPascalCase } from '../utils/string'
import * as bilibili from './bilibili.service'
import * as douyin from './douyin.service'
import * as tieba from './tieba.service'

const allHooks = { ...bilibili, ...douyin, ...tieba }
export interface ServiceConfig {
  id: string
  title: string
}

export const serviceDefinitions: ServiceConfig[] = [
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
]

export const trendingServices = Object.fromEntries(
  serviceDefinitions.map((service) => {
    const hookName = `use${kebabToPascalCase(service.id)}`
    const hook = (allHooks as Record<string, () => any>)[hookName]

    if (!hook) {
      throw new Error(
        `Hook not found for service ID: "${service.id}". Expected to find an exported function named "${hookName}".`,
      )
    }

    return [
      service.id,
      {
        title: service.title,
        hook,
      },
    ]
  }),
)

export type TrendingType = keyof typeof trendingServices
